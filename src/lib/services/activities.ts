import { ActivitySignupStatus, ActivityType } from "@prisma/client"

import { prisma } from "@/lib/db"

type CreateActivityInput = {
  type: ActivityType
  title: string
  desc: string
  location?: string | null
  startTime: Date
  endTime?: Date | null
  capacity?: number | null
  creatorId?: string | null
}

type ListActivitiesFilters = {
  type?: ActivityType
}

function ensureDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }
}

export async function createActivity(input: CreateActivityInput) {
  ensureDb()
  return prisma.activity.create({
    data: {
      type: input.type,
      title: input.title,
      desc: input.desc,
      location: input.location ?? null,
      startTime: input.startTime,
      endTime: input.endTime ?? null,
      capacity: input.capacity ?? null,
      creatorId: input.creatorId ?? null,
    },
  })
}

export async function listActivities(filters: ListActivitiesFilters = {}) {
  ensureDb()
  return prisma.activity.findMany({
    where: {
      type: filters.type,
    },
    orderBy: { startTime: "asc" },
    include: {
      signups: {
        where: { status: ActivitySignupStatus.JOINED },
        select: { id: true },
      },
    },
  })
}

export async function getActivityWithSignupState(activityId: string, userId?: string) {
  ensureDb()
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      signups: {
        where: {
          OR: [
            { status: ActivitySignupStatus.JOINED },
            ...(userId ? [{ userId }] : []),
          ],
        },
      },
    },
  })

  if (!activity) {
    return null
  }

  const joinedSignups = activity.signups.filter(
    (s) => s.status === ActivitySignupStatus.JOINED
  )
  const isJoined = userId
    ? activity.signups.some((s) => s.userId === userId && s.status === ActivitySignupStatus.JOINED)
    : false

  return {
    activity,
    joinedCount: joinedSignups.length,
    isJoined,
  }
}

export async function signupActivity(activityId: string, userId: string) {
  ensureDb()

  return prisma.$transaction(async (tx) => {
    const activity = await tx.activity.findUnique({
      where: { id: activityId },
      include: {
        signups: {
          where: {
            OR: [
              { status: ActivitySignupStatus.JOINED },
              { userId },
            ],
          },
        },
      },
    })

    if (!activity) {
      throw new Error("Activity not found")
    }

    const joinedCount = activity.signups.filter(
      (s) => s.status === ActivitySignupStatus.JOINED
    ).length
    const existing = activity.signups.find((s) => s.userId === userId)

    if (existing?.status === ActivitySignupStatus.JOINED) {
      throw new Error("Already joined")
    }

    if (activity.capacity && joinedCount >= activity.capacity) {
      throw new Error("Activity is full")
    }

    if (existing) {
      await tx.activitySignup.update({
        where: { id: existing.id },
        data: { status: ActivitySignupStatus.JOINED },
      })
      return existing
    }

    return tx.activitySignup.create({
      data: {
        activityId,
        userId,
        status: ActivitySignupStatus.JOINED,
      },
    })
  })
}

export async function cancelSignup(activityId: string, userId: string) {
  ensureDb()

  const signup = await prisma.activitySignup.findUnique({
    where: {
      activityId_userId: { activityId, userId },
    },
  })

  if (!signup) {
    throw new Error("Signup not found")
  }

  if (signup.status === ActivitySignupStatus.CANCELED) {
    return signup
  }

  return prisma.activitySignup.update({
    where: { id: signup.id },
    data: { status: ActivitySignupStatus.CANCELED },
  })
}

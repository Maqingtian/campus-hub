import { prisma } from "@/lib/db"

function ensureDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }
}

export async function listQuestionsAdmin(limit = 20, includeDeleted = false) {
  ensureDb()
  return prisma.question.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      tags: { include: { tag: true } },
    },
  })
}

export async function softDeleteQuestion(questionId: string) {
  ensureDb()
  return prisma.question.update({
    where: { id: questionId },
    data: { deletedAt: new Date() },
  })
}

export async function listAnswersAdmin(limit = 20, includeDeleted = false) {
  ensureDb()
  return prisma.answer.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      question: { select: { id: true, title: true } },
    },
  })
}

export async function softDeleteAnswer(answerId: string) {
  ensureDb()
  return prisma.answer.update({
    where: { id: answerId },
    data: { deletedAt: new Date() },
  })
}

export async function listActivitiesAdmin(limit = 20) {
  ensureDb()
  return prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      signups: {
        select: { id: true, status: true },
      },
    },
  })
}

export async function setActivityHidden(activityId: string, hidden: boolean) {
  ensureDb()
  return prisma.activity.update({
    where: { id: activityId },
    data: { isHidden: hidden },
  })
}

export async function stats() {
  ensureDb()
  const [users, questions, answers, activities, signups, notifications] =
    await Promise.all([
      prisma.user.count(),
      prisma.question.count({ where: { deletedAt: null } }),
      prisma.answer.count({ where: { deletedAt: null } }),
      prisma.activity.count({ where: { isHidden: false } }),
      prisma.activitySignup.count(),
      prisma.notification.count(),
    ])

  return {
    users,
    questions,
    answers,
    activities,
    signups,
    notifications,
  }
}

import { ActivityType } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { createActivity, listActivities } from "@/lib/services/activities"
import { getServerSession } from "next-auth"

const createActivitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  title: z.string().min(3, "Title is too short"),
  desc: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(),
})

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const typeParam = url.searchParams.get("type")
    const filters: { type?: ActivityType } = {}

    if (typeParam && Object.values(ActivityType).includes(typeParam as ActivityType)) {
      filters.type = typeParam as ActivityType
    }

    const activities = await listActivities(filters)

    const data = activities.map((activity) => ({
      ...activity,
      joinedCount: activity.signups.length,
    }))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : "Failed to load activities"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createActivitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id

    const activity = await createActivity({
      type: parsed.data.type,
      title: parsed.data.title,
      desc: parsed.data.desc,
      location: parsed.data.location ?? null,
      startTime: new Date(parsed.data.startTime),
      endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
      capacity: parsed.data.capacity ?? null,
      creatorId: userId ?? null,
    })

    return NextResponse.json({ ok: true, data: activity }, { status: 201 })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : "Failed to create activity"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { markRead } from "@/lib/services/notifications"
import { getServerSession } from "next-auth"

type RouteContext = {
  params: { id: string }
}

const idSchema = z.object({
  id: z.string().min(1),
})

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const parsed = idSchema.safeParse(context.params)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid notification id" },
        { status: 400 }
      )
    }

    await markRead(userId, parsed.data.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: "Failed to mark notification" },
      { status: 500 }
    )
  }
}

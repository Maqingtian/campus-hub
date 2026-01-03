export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { markAllRead } from "@/lib/services/notifications"
import { getServerSession } from "next-auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    await markAllRead(userId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: "Failed to mark notifications" },
      { status: 500 }
    )
  }
}

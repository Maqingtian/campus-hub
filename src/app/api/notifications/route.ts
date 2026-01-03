export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import {
  listNotifications,
  unreadCount,
} from "@/lib/services/notifications"
import { getServerSession } from "next-auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [items, unread] = await Promise.all([
      listNotifications(userId, 20),
      unreadCount(userId),
    ])

    return NextResponse.json({ ok: true, data: { items, unreadCount: unread } })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: "Failed to load notifications" },
      { status: 500 }
    )
  }
}

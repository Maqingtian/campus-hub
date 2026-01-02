import { NextResponse } from "next/server"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { cancelSignup, signupActivity } from "@/lib/services/activities"
import { getServerSession } from "next-auth"

type RouteContext = {
  params: { id: string }
}

const emptySchema = z.object({}).strict()

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

    const body = (await req.json().catch(() => ({}))) as unknown
    const parsed = emptySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid request" },
        { status: 400 }
      )
    }

    const signup = await signupActivity(context.params.id, userId)
    return NextResponse.json({ ok: true, data: signup }, { status: 201 })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : "Failed to join activity"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = (await req.json().catch(() => ({}))) as unknown
    const parsed = emptySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid request" },
        { status: 400 }
      )
    }

    const result = await cancelSignup(context.params.id, userId)
    return NextResponse.json({ ok: true, data: result })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : "Failed to cancel signup"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

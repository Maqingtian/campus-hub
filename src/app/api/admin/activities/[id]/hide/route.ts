import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdmin } from "@/lib/authz"
import { setActivityHidden } from "@/lib/services/admin"

export const dynamic = "force-dynamic"

const paramsSchema = z.object({
  id: z.string().min(1),
})

const bodySchema = z.object({
  hidden: z.boolean(),
})

type RouteContext = {
  params: { id: string }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const paramsParsed = paramsSchema.safeParse(context.params)
    if (!paramsParsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid activity id" },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const parsedBody = bodySchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body" },
        { status: 400 }
      )
    }

    await setActivityHidden(paramsParsed.data.id, parsedBody.data.hidden)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : "Failed to update activity"
    const status = message === "Forbidden" ? 403 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}

import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdmin } from "@/lib/authz"
import { softDeleteAnswer } from "@/lib/services/admin"

export const dynamic = "force-dynamic"

const paramsSchema = z.object({
  id: z.string().min(1),
})

type RouteContext = {
  params: { id: string }
}

export async function POST(_: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const parsed = paramsSchema.safeParse(context.params)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid answer id" },
        { status: 400 }
      )
    }

    await softDeleteAnswer(parsed.data.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : "Failed to delete"
    const status = message === "Forbidden" ? 403 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}

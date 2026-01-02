import { NextResponse } from "next/server"
import { z } from "zod"

import { createAnswer } from "@/lib/services/answers"

const createAnswerSchema = z.object({
  content: z.string().min(1, "Content is required"),
})

type RouteContext = {
  params: { id: string }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const body = await req.json()
    const parsed = createAnswerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      )
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL is not configured" },
        { status: 500 }
      )
    }

    const answer = await createAnswer({
      questionId: context.params.id,
      content: parsed.data.content,
      authorId: null,
    })

    return NextResponse.json({ ok: true, data: answer }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: "Failed to create answer" },
      { status: 500 }
    )
  }
}

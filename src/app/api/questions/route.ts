import { NextResponse } from "next/server"
import { z } from "zod"

import { createQuestion, listQuestions } from "@/lib/services/questions"

const createQuestionSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  content: z.string().min(1, "Content is required"),
  tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
    .max(3, "Up to 3 tags")
    .optional(),
})

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get("q")
    const tag = url.searchParams.get("tag")
    const questions = await listQuestions({ q, tag })
    return NextResponse.json({ ok: true, data: questions })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : "Failed to load questions"
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createQuestionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten().formErrors.join(", ") },
        { status: 400 }
      )
    }

    const tagNames = parsed.data.tags?.map((t) => t.trim().toLowerCase()) ?? []

    const question = await createQuestion({
      title: parsed.data.title,
      content: parsed.data.content,
      authorId: null,
      tagNames,
    })

    return NextResponse.json({ ok: true, data: question }, { status: 201 })
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : "Failed to create question"
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}

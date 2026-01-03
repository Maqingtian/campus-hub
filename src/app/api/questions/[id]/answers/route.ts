import { NextResponse } from "next/server"
import { NotificationType } from "@prisma/client"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { createAnswer } from "@/lib/services/answers"
import { createNotification } from "@/lib/services/notifications"
import { getQuestionAuthor } from "@/lib/services/questions"
import { getServerSession } from "next-auth"

const createAnswerSchema = z.object({
  content: z.string().min(1, "Content is required"),
})

type RouteContext = {
  params: { id: string }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    const authorId = (session?.user as { id?: string } | undefined)?.id ?? null

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
      authorId,
    })

    const questionAuthor = await getQuestionAuthor(context.params.id)
    const recipientId = questionAuthor?.authorId
    if (recipientId && recipientId !== authorId) {
      const snippet = parsed.data.content.slice(0, 80)
      await createNotification({
        userId: recipientId,
        type: NotificationType.ANSWER_ON_YOUR_QUESTION,
        title: "New answer to your question",
        body: snippet,
        link: `/questions/${context.params.id}`,
      })
    }

    return NextResponse.json({ ok: true, data: answer }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: "Failed to create answer" },
      { status: 500 }
    )
  }
}

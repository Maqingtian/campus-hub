import { Answer } from "@prisma/client"

import { prisma } from "@/lib/db"

type CreateAnswerInput = {
  questionId: string
  content: string
  authorId?: string | null
}

export async function createAnswer(input: CreateAnswerInput): Promise<Answer> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  const { questionId, content, authorId } = input

  return prisma.answer.create({
    data: {
      questionId,
      content,
      authorId: authorId ?? null,
    },
  })
}

export async function listAnswers(questionId: string): Promise<Answer[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  return prisma.answer.findMany({
    where: { questionId },
    orderBy: { createdAt: "asc" },
  })
}

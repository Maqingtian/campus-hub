import { Question } from "@prisma/client"

import { prisma } from "@/lib/db"

type CreateQuestionInput = {
  title: string
  content: string
  authorId?: string | null
}

export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  const { title, content, authorId } = input
  return prisma.question.create({
    data: {
      title,
      content,
      authorId: authorId ?? null,
    },
  })
}

export async function listQuestions(limit = 20): Promise<Question[]> {
  if (!process.env.DATABASE_URL) {
    return []
  }

  return prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

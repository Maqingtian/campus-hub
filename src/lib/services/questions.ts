import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"
import { getOrCreateTags, normalizeTagNames } from "@/lib/services/tags"

export type QuestionWithTags = Prisma.QuestionGetPayload<{
  include: { tags: { include: { tag: true } } }
}>

type CreateQuestionInput = {
  title: string
  content: string
  authorId?: string | null
  tagNames?: string[]
}

type ListQuestionOptions = {
  limit?: number
  q?: string | null
  tag?: string | null
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<QuestionWithTags> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  const { title, content, authorId, tagNames = [] } = input
  const normalizedTags = normalizeTagNames(tagNames)

  const result = await prisma.$transaction(async (tx) => {
    const question = await tx.question.create({
      data: {
        title,
        content,
        authorId: authorId ?? null,
      },
    })

    if (normalizedTags.length > 0) {
      const tags = await getOrCreateTags(normalizedTags, tx)
      if (tags.length > 0) {
        await tx.questionTag.createMany({
          data: tags.map((tag) => ({
            questionId: question.id,
            tagId: tag.id,
          })),
          skipDuplicates: true,
        })
      }
    }

    return tx.question.findUnique({
      where: { id: question.id },
      include: { tags: { include: { tag: true } } },
    })
  })

  if (!result) {
    throw new Error("Failed to create question")
  }

  return result
}

export async function listQuestions(
  options: ListQuestionOptions = {}
): Promise<QuestionWithTags[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  const limit = options.limit ?? 20
  const q = options.q?.trim()
  const tag = options.tag?.trim().toLowerCase()

  return prisma.question.findMany({
    where: {
      AND: [
        { deletedAt: null },
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        tag
          ? {
              tags: {
                some: {
                  tag: {
                    name: tag,
                  },
                },
              },
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      tags: { include: { tag: true } },
      answers: false,
    },
  })
}

export async function getQuestionWithAnswers(id: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  return prisma.question.findUnique({
    where: { id, deletedAt: null },
    include: {
      answers: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
      tags: { include: { tag: true } },
    },
  })
}

export async function getQuestionAuthor(id: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  return prisma.question.findUnique({
    where: { id },
    select: { authorId: true },
  })
}

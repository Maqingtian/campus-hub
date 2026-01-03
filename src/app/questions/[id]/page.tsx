import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getQuestionWithAnswers } from "@/lib/services/questions"

import { AnswerForm } from "./post-answer"

type PageProps = {
  params: { id: string }
}

export const dynamic = "force-dynamic"

export default async function QuestionDetailPage({ params }: PageProps) {
  if (!process.env.DATABASE_URL) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Question</h1>
        <p className="mt-2 text-destructive">DATABASE_URL is not configured.</p>
      </div>
    )
  }

  const question = await getQuestionWithAnswers(params.id)

  if (!question) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{question.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
          {question.content}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Asked on {new Date(question.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Answers</h2>
          <Button variant="outline" size="sm">
            {question.answers.length} answer
            {question.answers.length === 1 ? "" : "s"}
          </Button>
        </div>
        {question.answers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No answers yet.</p>
        ) : (
          <div className="space-y-3">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className="rounded-lg border bg-background p-4 shadow-sm"
              >
                <p className="whitespace-pre-wrap text-sm">{answer.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Posted on {new Date(answer.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnswerForm questionId={question.id} />
    </div>
  )
}

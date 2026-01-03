import Link from "next/link"

import { Button } from "@/components/ui/button"
import { listQuestions } from "@/lib/services/questions"

export default async function QuestionsIndexPage() {
  let questions: Awaited<ReturnType<typeof listQuestions>> = []
  let error: string | null = null

  try {
    questions = await listQuestions()
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to load questions. Check DATABASE_URL."
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Questions</h1>
          <p className="text-sm text-muted-foreground">
            Browse and explore questions from the campus community.
          </p>
        </div>
        <Button asChild>
          <Link href="/questions/new">Ask a question</Link>
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {questions.map((question) => (
            <article
              key={question.id}
              className="rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30"
            >
              <Link href={`/questions/${question.id}`}>
                <h3 className="text-lg font-semibold">{question.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {question.content}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(question.createdAt).toLocaleString()}
                </p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { listQuestions } from "@/lib/services/questions"

export default async function Home() {
  let questions: Awaited<ReturnType<typeof listQuestions>> = []
  let error: string | null = null

  try {
    questions = await listQuestions()
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to load questions. Check DATABASE_URL."
  }

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border bg-card px-6 py-10 shadow-sm sm:px-10">
        <p className="text-sm font-medium text-primary">Campus Hub</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
          Your campus life, organized.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Ask questions, discover activities, and keep track of what matters on
          campus. Start by browsing existing questions or post your own.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/questions/new">Ask a question</Link>
          </Button>
          <Link
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href="/activities"
          >
            Browse activities
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest questions</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/questions/new">New question</Link>
          </Button>
        </div>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions yet. Be the first to ask!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {questions.map((question) => (
              <article
                key={question.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <Link className="block" href={`/questions/${question.id}`}>
                  <h3 className="text-lg font-semibold">{question.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {question.content}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(question.createdAt).toLocaleString()}
                  </p>
                </Link>
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/questions/${question.id}`}>View</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { listQuestions } from "@/lib/services/questions"
import { listTags } from "@/lib/services/tags"

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams?: { q?: string; tag?: string }
}

export default async function QuestionsIndexPage({ searchParams }: PageProps) {
  const q = searchParams?.q?.toString() ?? ""
  const tagFilter = searchParams?.tag?.toString() ?? ""

  let questions: Awaited<ReturnType<typeof listQuestions>> = []
  let tags: Awaited<ReturnType<typeof listTags>> = []
  let error: string | null = null

  try {
    questions = await listQuestions({
      q: q || null,
      tag: tagFilter || null,
    })
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to load questions. Check DATABASE_URL."
  }

  try {
    tags = await listTags()
  } catch (err) {
    console.error(err)
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

      <form
        action="/questions"
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4 shadow-sm"
        method="get"
      >
        <div className="min-w-[240px] flex-1 space-y-1">
          <label className="text-sm font-medium" htmlFor="q">
            Keyword
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="q"
            name="q"
            placeholder="Search title or content"
            defaultValue={q}
          />
        </div>
        <div className="w-48 space-y-1">
          <label className="text-sm font-medium" htmlFor="tag">
            Tag
          </label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="tag"
            name="tag"
            defaultValue={tagFilter}
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Search</Button>
          {(q || tagFilter) && (
            <Button asChild type="button" variant="outline">
              <Link href="/questions">Clear</Link>
            </Button>
          )}
        </div>
      </form>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            No questions{q || tagFilter ? " match your filters" : ""}. Be the first to ask!
          </p>
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
                {question.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <Badge key={tag.tagId} variant="secondary">
                        {tag.tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
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

"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

type AnswerFormProps = {
  questionId: string
}

export function AnswerForm({ questionId }: AnswerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const content = String(formData.get("content") ?? "")

    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Failed to post answer")
        return
      }

      event.currentTarget.reset()
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Failed to post answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Your answer</h2>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="content">
            Content
          </label>
          <textarea
            className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="content"
            name="content"
            placeholder="Share your thoughts..."
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex items-center gap-3">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Posting..." : "Post answer"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              router.refresh()
            }}
          >
            Refresh
          </Button>
        </div>
      </form>
    </div>
  )
}

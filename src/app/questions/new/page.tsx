"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export default function NewQuestionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Failed to create question")
        return
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Failed to create question")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">New question</h1>
        <p className="text-sm text-muted-foreground">
          Share a question with the campus community.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="title"
            name="title"
            placeholder="e.g. How do I reserve a study room?"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="content">
            Content
          </label>
          <textarea
            className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="content"
            name="content"
            placeholder="Include details so others can help."
            required
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex items-center gap-3">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Submitting..." : "Submit question"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

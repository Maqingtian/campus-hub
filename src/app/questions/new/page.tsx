"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export default function NewQuestionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const rawTags = String(formData.get("tags") ?? "")
    const parsedTags = rawTags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
    const uniqueTags = Array.from(new Set(parsedTags))

    if (uniqueTags.length > 3) {
      const message = "Up to 3 tags are allowed"
      setError(message)
      toast.error(message)
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
          tags: uniqueTags,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Failed to create question")
        toast.error(data?.error ?? "Failed to create question")
        return
      }

      const questionId = data?.data?.id
      if (questionId) {
        router.push(`/questions/${questionId}`)
      } else {
        router.push("/")
      }
      router.refresh()
      toast.success("Question created")
    } catch (err) {
      console.error(err)
      setError("Failed to create question")
      toast.error("Failed to create question")
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
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="tags">
            Tags (comma separated, max 3)
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="tags"
            name="tags"
            placeholder="e.g. housing, cafeteria, library"
          />
          <p className="text-xs text-muted-foreground">
            Tags are lowercased and limited to 3.
          </p>
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

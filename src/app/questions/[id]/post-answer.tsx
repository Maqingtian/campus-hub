"use client"

import { FormEvent, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type AnswerFormProps = {
  questionId: string
}

export function AnswerForm({ questionId }: AnswerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const formData = new FormData(event.currentTarget)
    const content = String(formData.get("content") ?? "")
    const requestId = crypto.randomUUID()

    setIsSubmitting(true)
    setError(null)

    if (process.env.NODE_ENV !== "production") {
      console.log("[answer-submit]", { requestId, contentLen: content.length })
    }

    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        // minimal request correlation for debugging
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-request-id": requestId,
        },
        body: JSON.stringify({ content }),
      })

      // Robust JSON parsing to avoid json() throwing
      const text = await res.text()
      let data: unknown = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = null
      }

      if (process.env.NODE_ENV !== "production") {
        console.log("[answer-response]", {
          requestId,
          status: res.status,
          ok: res.ok,
          data,
        })
      }

      // Non-2xx: use server-provided error when available
      if (!res.ok) {
        const message = data?.error ?? "Failed to post answer"
        setError(message)
        toast.error(message)
        return
      }

      // 2xx but API reports ok:false
      if (data?.ok === false) {
        const message = data.error ?? "Failed to post answer"
        setError(message)
        toast.error(message)
        return
      }

      // Success path
      setError(null)
      formRef.current?.reset()
      toast.success("Answer posted")
      // Slight delay to avoid race with streaming refresh in some browsers
      setTimeout(() => router.refresh(), 0)
    } catch (err) {
      console.error(err)
      setError("Failed to post answer")
      toast.error("Failed to post answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Your answer</h2>
      <form
        ref={formRef}
        className="mt-4 space-y-3"
        onSubmit={onSubmit}
      >
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
            onChange={() => setError(null)}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive">
            [AnswerForm error] {error}
          </p>
        ) : null}
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

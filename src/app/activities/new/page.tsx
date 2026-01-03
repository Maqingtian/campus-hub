"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ActivityType } from "@prisma/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

const activityTypes = Object.values(ActivityType)

export default function NewActivityPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        type: formData.get("type"),
        title: formData.get("title"),
        desc: formData.get("desc"),
        location: formData.get("location") || undefined,
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime") || undefined,
        capacity: formData.get("capacity")
          ? Number(formData.get("capacity"))
          : undefined,
      }

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Failed to create activity")
        toast.error(data?.error ?? "Failed to create activity")
        return
      }

      toast.success("Activity created")
      router.push(`/activities/${data.data.id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Failed to create activity")
      toast.error("Failed to create activity")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">New activity</h1>
        <p className="text-sm text-muted-foreground">
          Share a campus event, workshop, or meetup.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="type">
            Type
          </label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="type"
            name="type"
            required
            defaultValue={activityTypes[0]}
          >
            {activityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="title"
            name="title"
            placeholder="e.g. Maker Club Meetup"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="desc">
            Description
          </label>
          <textarea
            className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="desc"
            name="desc"
            placeholder="What is this activity about?"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="location">
            Location (optional)
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="location"
            name="location"
            placeholder="Building / Room"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="startTime">
              Start time
            </label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="endTime">
              End time (optional)
            </label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              id="endTime"
              name="endTime"
              type="datetime-local"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="capacity">
            Capacity (optional)
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            placeholder="e.g. 50"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex items-center gap-3">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating..." : "Create activity"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

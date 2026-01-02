"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

type SignupActionsProps = {
  activityId: string
  isJoined: boolean
  capacityText: string
  isFull: boolean
}

export function SignupActions({ activityId, isJoined, capacityText, isFull }: SignupActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (method: "POST" | "DELETE") => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/activities/${activityId}/signup`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Request failed")
        return
      }
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {isJoined ? (
          <Button disabled={loading} variant="outline" onClick={() => void handleAction("DELETE")}>
            {loading ? "Leaving..." : "Cancel signup"}
          </Button>
        ) : (
          <Button disabled={loading || isFull} onClick={() => void handleAction("POST")}>
            {loading ? "Joining..." : isFull ? "Full" : "Sign up"}
          </Button>
        )}
        <span className="text-sm text-muted-foreground">{capacityText}</span>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

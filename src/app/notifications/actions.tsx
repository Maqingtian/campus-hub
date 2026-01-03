"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

async function handleRequest(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; error?: string | null }> {
  const res = await fetch(path, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || data?.ok === false) {
    return { ok: false, error: data?.error ?? "Failed to update notification" }
  }
  return { ok: true }
}

export function MarkAllReadButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onClick = async () => {
    if (loading || disabled) return
    setLoading(true)
    try {
      const result = await handleRequest("/api/notifications/read-all")
      if (!result.ok) {
        toast.error(result.error ?? "Failed to mark all as read")
        return
      }
      toast.success("All notifications marked as read")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to mark all as read")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button disabled={loading || disabled} onClick={onClick} variant="outline">
      {loading ? "Marking..." : "Mark all as read"}
    </Button>
  )
}

export function MarkReadButton({
  notificationId,
  disabled,
}: {
  notificationId: string
  disabled?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onClick = async () => {
    if (loading || disabled) return
    setLoading(true)
    try {
      const result = await handleRequest(
        `/api/notifications/${notificationId}/read`
      )
      if (!result.ok) {
        toast.error(result.error ?? "Failed to mark as read")
        return
      }
      toast.success("Marked as read")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to mark as read")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      disabled={loading || disabled}
      onClick={onClick}
      size="sm"
      variant="ghost"
    >
      {loading ? "Marking..." : "Mark as read"}
    </Button>
  )
}

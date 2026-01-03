"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

async function callApi(path: string, body?: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error ?? "Request failed")
  }
  return data
}

export function DeleteQuestionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const onClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      await callApi(`/api/admin/questions/${id}/delete`)
      toast.success("Question removed")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to remove question")
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button variant="destructive" size="sm" onClick={onClick} disabled={loading}>
      {loading ? "Removing..." : "Delete"}
    </Button>
  )
}

export function DeleteAnswerButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const onClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      await callApi(`/api/admin/answers/${id}/delete`)
      toast.success("Answer removed")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to remove answer")
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button variant="destructive" size="sm" onClick={onClick} disabled={loading}>
      {loading ? "Removing..." : "Delete"}
    </Button>
  )
}

export function ToggleActivityVisibilityButton({
  id,
  hidden,
}: {
  id: string
  hidden: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const onClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      await callApi(`/api/admin/activities/${id}/hide`, { hidden: !hidden })
      toast.success(!hidden ? "Activity hidden" : "Activity visible")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update activity")
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? "Saving..." : hidden ? "Unhide" : "Hide"}
    </Button>
  )
}

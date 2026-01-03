import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { authOptions } from "@/lib/auth"
import { getActivityWithSignupState } from "@/lib/services/activities"
import { getServerSession } from "next-auth"

import { SignupActions } from "./signup-actions"

type PageProps = {
  params: { id: string }
}

export const dynamic = "force-dynamic"

export default async function ActivityDetailPage({ params }: PageProps) {
  if (!process.env.DATABASE_URL) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Activity</h1>
        <p className="mt-2 text-destructive">DATABASE_URL is not configured.</p>
      </div>
    )
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const result = await getActivityWithSignupState(params.id, userId ?? undefined)

  if (!result) {
    notFound()
  }

  const { activity, joinedCount, isJoined } = result
  const capacityText =
    activity.capacity != null
      ? `${joinedCount}/${activity.capacity} joined`
      : `${joinedCount} joined`
  const isFull = activity.capacity != null && joinedCount >= activity.capacity

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-primary">{activity.type}</p>
          <span className="text-xs text-muted-foreground">{capacityText}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold">{activity.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{activity.desc}</p>
        {activity.location ? (
          <p className="mt-3 text-sm text-muted-foreground">Location: {activity.location}</p>
        ) : null}
        <p className="mt-3 text-sm text-muted-foreground">
          Starts: {new Date(activity.startTime).toLocaleString()}
          {activity.endTime ? ` • Ends: ${new Date(activity.endTime).toLocaleString()}` : ""}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Created on {new Date(activity.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Signup</h2>
        {!session ? (
          <div className="mt-3 flex items-center gap-3">
            <Button asChild>
              <Link href="/api/auth/signin">Sign in to join</Link>
            </Button>
            <span className="text-sm text-muted-foreground">{capacityText}</span>
          </div>
        ) : (
          <div className="mt-3">
            <SignupActions
              activityId={activity.id}
              capacityText={capacityText}
              isJoined={isJoined}
              isFull={isFull}
            />
          </div>
        )}
      </div>
    </div>
  )
}

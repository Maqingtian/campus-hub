import Link from "next/link"

import { Button } from "@/components/ui/button"
import { listActivities } from "@/lib/services/activities"

export default async function ActivitiesPage() {
  let activities: Awaited<ReturnType<typeof listActivities>> = []
  let error: string | null = null

  try {
    activities = await listActivities()
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load activities"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Activities</h1>
          <p className="text-sm text-muted-foreground">
            Join events, workshops, and campus activities.
          </p>
        </div>
        <Button asChild>
          <Link href="/activities/new">Create activity</Link>
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activities yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activities.map((activity) => {
            const joinedCount = activity.signups.length
            const capacityText =
              activity.capacity != null
                ? `${joinedCount}/${activity.capacity}`
                : `${joinedCount}`

            return (
              <Link
                key={activity.id}
                className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30"
                href={`/activities/${activity.id}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-primary">
                    {activity.type}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {capacityText} joined
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{activity.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {activity.desc}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(activity.startTime).toLocaleString()}
                </p>
                <p className="mt-2 text-sm font-medium text-primary">View</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

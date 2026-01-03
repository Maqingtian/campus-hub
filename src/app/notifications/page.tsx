import Link from "next/link"
import { getServerSession } from "next-auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import {
  listNotifications,
  unreadCount,
} from "@/lib/services/notifications"

import { MarkAllReadButton, MarkReadButton } from "./actions"

export const dynamic = "force-dynamic"

function formatDate(value: Date) {
  return new Date(value).toLocaleString()
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!userId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground">
              Please sign in to view your notifications.
            </p>
            <Button asChild className="mt-4">
              <Link href="/api/auth/signin">Sign in with GitHub</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!process.env.DATABASE_URL) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Card>
          <CardContent className="py-6">
            <p className="text-destructive">
              DATABASE_URL is not configured. Cannot load notifications.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [items, unread] = await Promise.all([
    listNotifications(userId, 20),
    unreadCount(userId),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unread} unread
          </p>
        </div>
        <MarkAllReadButton disabled={unread === 0} />
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className={
                item.isRead ? "" : "border-primary/40 bg-primary/5 shadow-sm"
              }
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                {!item.isRead ? (
                  <MarkReadButton notificationId={item.id} />
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3">
                {item.body ? (
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                ) : null}
                {item.link ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href={item.link}>Open</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

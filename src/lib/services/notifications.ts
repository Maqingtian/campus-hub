import { Notification, NotificationType } from "@prisma/client"

import { prisma } from "@/lib/db"

type CreateNotificationInput = {
  userId: string
  type: NotificationType
  title: string
  body?: string | null
  link?: string | null
}

function ensureDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  ensureDb()
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    },
  })
}

export async function listNotifications(userId: string, limit = 20) {
  ensureDb()
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function unreadCount(userId: string) {
  ensureDb()
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function markAllRead(userId: string) {
  ensureDb()
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })
}

export async function markRead(userId: string, notificationId: string) {
  ensureDb()
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  })
}

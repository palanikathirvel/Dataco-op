import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET notifications for current user or brand
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, id } = session.user
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get("limit") || "30", 10)

    let notifications: any[] = []
    let unreadCount = 0

    if (role === "USER") {
      [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId: id },
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
        prisma.notification.count({
          where: { userId: id, read: false },
        }),
      ])
    } else if (role === "BRAND") {
      [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { brandId: id },
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
        prisma.notification.count({
          where: { brandId: id, read: false },
        }),
      ])
    } else if (role === "ADMIN") {
      // Admin sees recent system-wide notifications
      [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
        prisma.notification.count({
          where: { read: false },
        }),
      ])
    }

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, id } = session.user

    if (role === "USER") {
      await prisma.notification.updateMany({
        where: { userId: id, read: false },
        data: { read: true },
      })
    } else if (role === "BRAND") {
      await prisma.notification.updateMany({
        where: { brandId: id, read: false },
        data: { read: true },
      })
    } else if (role === "ADMIN") {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: id },
            { type: "ADMIN_ALERT" },
          ],
          read: false,
        },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}


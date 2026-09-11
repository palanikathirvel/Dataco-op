import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { NotificationType } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin clearance required" }, { status: 403 })
    }

    const body = await req.json()
    const { title, message, audience, type, actionUrl, targetEmail } = body

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      )
    }

    const notifType: NotificationType =
      type && Object.values(NotificationType).includes(type)
        ? type
        : "SYSTEM_ANNOUNCEMENT"

    let dispatchedCount = 0

    if (audience === "CUSTOMERS" || audience === "EVERYONE") {
      const users = await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
      })

      if (users.length > 0) {
        await prisma.notification.createMany({
          data: users.map((u) => ({
            userId: u.id,
            type: notifType,
            title: title.trim(),
            message: message.trim(),
            actionUrl: actionUrl?.trim() || null,
            senderRole: "ADMIN",
            read: false,
          })),
        })
        dispatchedCount += users.length
      }
    }

    if (audience === "BRANDS" || audience === "EVERYONE") {
      const brands = await prisma.brand.findMany({
        select: { id: true },
      })

      if (brands.length > 0) {
        await prisma.notification.createMany({
          data: brands.map((b) => ({
            brandId: b.id,
            type: notifType,
            title: title.trim(),
            message: message.trim(),
            actionUrl: actionUrl?.trim() || null,
            senderRole: "ADMIN",
            read: false,
          })),
        })
        dispatchedCount += brands.length
      }
    }

    if (audience === "TARGETED") {
      if (!targetEmail?.trim()) {
        return NextResponse.json(
          { error: "Target email is required for targeted notifications" },
          { status: 400 }
        )
      }

      const emailClean = targetEmail.trim().toLowerCase()
      const user = await prisma.user.findUnique({ where: { email: emailClean } })
      const brand = await prisma.brand.findUnique({ where: { email: emailClean } })

      if (!user && !brand) {
        return NextResponse.json(
          { error: `No customer or brand found with email "${targetEmail}"` },
          { status: 404 }
        )
      }

      if (user) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: notifType,
            title: title.trim(),
            message: message.trim(),
            actionUrl: actionUrl?.trim() || null,
            senderRole: "ADMIN",
            read: false,
          },
        })
        dispatchedCount++
      }

      if (brand) {
        await prisma.notification.create({
          data: {
            brandId: brand.id,
            type: notifType,
            title: title.trim(),
            message: message.trim(),
            actionUrl: actionUrl?.trim() || null,
            senderRole: "ADMIN",
            read: false,
          },
        })
        dispatchedCount++
      }
    }

    return NextResponse.json({
      success: true,
      dispatchedCount,
      message: `Successfully broadcasted to ${dispatchedCount} recipient(s).`,
    })
  } catch (error) {
    console.error("Failed to broadcast notification:", error)
    return NextResponse.json({ error: "Failed to broadcast notification" }, { status: 500 })
  }
}

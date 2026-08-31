import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const purchases = await prisma.purchase.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ purchases })
  } catch (err) {
    console.error("[PURCHASES_GET]", err)
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const platform = formData.get("platform") as string
    const productName = formData.get("productName") as string
    const category = formData.get("category") as string
    const brand = formData.get("brand") as string | null
    const amountStr = formData.get("amount") as string
    const purchaseDateStr = formData.get("purchaseDate") as string
    const orderId = formData.get("orderId") as string
    const screenshot = formData.get("screenshot") as File | null

    // Validate required fields
    if (!platform || !productName || !category || !amountStr || !purchaseDateStr || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const amount = parseInt(amountStr, 10)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const purchaseDate = new Date(purchaseDateStr)
    if (isNaN(purchaseDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    // Check for duplicate order ID from same user
    const existing = await prisma.purchase.findFirst({
      where: { userId: session.user.id, orderId },
    })
    if (existing) {
      return NextResponse.json(
        { error: "You already submitted this order ID" },
        { status: 409 }
      )
    }

    // Handle screenshot upload
    let screenshotUrl: string | null = null
    let screenshotData: string | null = null

    if (screenshot && screenshot.size > 0) {
      if (screenshot.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Screenshot must be under 5MB" }, { status: 400 })
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
      if (!allowedTypes.includes(screenshot.type)) {
        return NextResponse.json({ error: "Only JPEG and PNG images allowed" }, { status: 400 })
      }

      // Store as base64 data URL (simple, no file storage needed)
      const buffer = Buffer.from(await screenshot.arrayBuffer())
      const base64 = buffer.toString("base64")
      screenshotData = `data:${screenshot.type};base64,${base64}`
      screenshotUrl = screenshotData // Use the data URL as the URL
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        platform,
        productName,
        category,
        brand: brand || null,
        amount,
        purchaseDate,
        orderId,
        status: "PENDING_VERIFICATION",
        method: "SCREENSHOT",
        screenshotUrl,
        screenshotData,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ purchase }, { status: 201 })
  } catch (err) {
    console.error("[PURCHASES_POST]", err)
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { action, reason } = body

    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true } } },
    })
    if (!purchase) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (action === "verify") {
      await prisma.purchase.update({
        where: { id: params.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy: session.user.id,
        },
      })

      // Auto-generate cohort tags
      const amount = Number(purchase.amount)
      const cat = (purchase.category ?? "").toUpperCase()
      const tags: string[] = []

      if (amount > 5000000) tags.push("ultra_premium_buyer")
      else if (amount > 2000000) tags.push("premium_buyer")
      else if (amount > 1000000) tags.push("mid_tier_buyer")

      if (cat.includes("SKIN") || cat.includes("BEAUTY")) tags.push("skincare_buyer")
      if (cat.includes("FOOT") || cat.includes("SHOE")) tags.push("footwear_buyer")
      if (cat.includes("ELECTRON")) tags.push("electronics_buyer")
      if (cat.includes("FOOD")) tags.push("food_buyer")
      if (cat.includes("FASHION") || cat.includes("CLOTH")) tags.push("fashion_buyer")

      for (const tag of tags) {
        try {
          await prisma.cohortTag.upsert({
            where: { userId_tag: { userId: purchase.userId, tag } },
            create: { userId: purchase.userId, tag, confidenceScore: 0.9 },
            update: {},
          })
        } catch (e) {
          console.warn("[COHORT_TAG_UPSERT]", e)
        }
      }
    } else if (action === "reject") {
      await prisma.purchase.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          rejectReason: reason ?? "No reason provided",
        },
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[VERIFY_PURCHASE]", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

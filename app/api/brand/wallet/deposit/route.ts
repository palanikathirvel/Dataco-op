import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createRazorpayOrder } from "@/lib/razorpay"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "BRAND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const brand = await prisma.brand.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, status: true },
    })

    if (!brand) {
      return NextResponse.json({ error: "Brand account not found" }, { status: 404 })
    }

    const body = await req.json()
    const { amount } = body

    // Amount is in paise (100000 = ₹1,000)
    if (typeof amount !== "number" || amount < 100000) {
      return NextResponse.json(
        { error: "Minimum top-up is ₹1,000" },
        { status: 400 }
      )
    }

    // Maximum safety limit per transaction (₹5,00,000 = 50,000,000 paise)
    if (amount > 50000000) {
      return NextResponse.json(
        { error: "Maximum single top-up limit is ₹5,00,000" },
        { status: 400 }
      )
    }

    const receipt = `dep_${brand.id.slice(0, 8)}_${Date.now()}`
    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt,
      notes: {
        brandId: brand.id,
        brandName: brand.name,
        brandEmail: brand.email,
        type: "wallet_deposit",
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      brandName: brand.name,
      brandEmail: brand.email,
    })
  } catch (err: any) {
    console.error("[BRAND_WALLET_DEPOSIT]", err)
    return NextResponse.json(
      { error: err.message || "Failed to initialize payment order" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Stub for Razorpay integration. In production this would create a Razorpay order
// and return the order ID for client-side checkout.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "BRAND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount } = body

    if (typeof amount !== "number" || amount < 100000) {
      return NextResponse.json(
        { error: "Minimum top-up is ₹1,000" },
        { status: 400 }
      )
    }

    // For now, just record a transaction. In production:
    // 1. Create Razorpay order
    // 2. Return order ID for client checkout
    // 3. Webhook credits wallet on payment success

    return NextResponse.json({
      message: "Razorpay integration pending. Contact admin for manual top-up.",
      amount,
    })
  } catch (err) {
    console.error("[BRAND_WALLET_DEPOSIT]", err)
    return NextResponse.json({ error: "Failed to process" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const MIN_PAYOUT_PAISE = 50000 // ₹500

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const payouts = await prisma.payoutRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ payouts })
  } catch (err) {
    console.error("[PAYOUTS_GET]", err)
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, upiId } = body

    if (typeof amount !== "number" || amount < MIN_PAYOUT_PAISE) {
      return NextResponse.json(
        { error: "Minimum withdrawal is ₹500" },
        { status: 400 }
      )
    }
    if (!upiId || !/^[\w.\-]+@[\w]+$/.test(upiId)) {
      return NextResponse.json(
        { error: "Invalid UPI ID format" },
        { status: 400 }
      )
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const balance = Number(user.walletBalance)
    if (balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // Save UPI ID to user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { upiId },
    })

    // Create payout request (don't deduct balance yet — admin approves)
    const payout = await prisma.payoutRequest.create({
      data: {
        userId: session.user.id,
        amount,
        upiId,
        status: "PENDING",
      },
    })

    return NextResponse.json({ payout }, { status: 201 })
  } catch (err) {
    console.error("[PAYOUTS_POST]", err)
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 })
  }
}

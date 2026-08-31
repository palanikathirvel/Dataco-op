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
    const { action, transactionId, reason } = body

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true, walletBalance: true } } },
    })
    if (!payout) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (action === "reject") {
      await prisma.payoutRequest.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          rejectReason: reason ?? "Rejected by admin",
        },
      })
      return NextResponse.json({ success: true })
    }

    // Process: verify user has enough balance
    if (payout.user && Number(payout.user.walletBalance) < Number(payout.amount)) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // Deduct from user wallet
    if (payout.user) {
      await prisma.user.update({
        where: { id: payout.user.id },
        data: {
          walletBalance: { decrement: Number(payout.amount) },
        },
      })
    }

    // Mark payout as completed
    await prisma.payoutRequest.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        processedBy: session.user.id,
        razorpayPayoutId: transactionId ?? null,
      },
    })

    // Record transaction
    if (payout.user) {
      const balanceBefore = Number(payout.user.walletBalance)
      const balanceAfter = balanceBefore - Number(payout.amount)
      await prisma.transaction.create({
        data: {
          userId: payout.user.id,
          type: "PAYOUT",
          amount: Number(payout.amount),
          balanceBefore,
          balanceAfter,
          description: `Payout to UPI ${payout.upiId}`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[PROCESS_PAYOUT]", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

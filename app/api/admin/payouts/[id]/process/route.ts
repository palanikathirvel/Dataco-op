import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

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
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 })
    }

    // Idempotency: prevent double-processing
    if (payout.status !== "PENDING") {
      return NextResponse.json(
        { error: `Payout request already ${payout.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    if (action === "reject") {
      await prisma.payoutRequest.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          rejectReason: reason ?? "Rejected by admin",
        },
      })
      return NextResponse.json({ success: true, status: "REJECTED" })
    }

    if (action !== "approve") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Atomic transaction for approval, wallet deduction, and audit ledger
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch user in transaction with current balance
      const currentUser = await tx.user.findUnique({
        where: { id: payout.userId },
        select: { id: true, walletBalance: true },
      })

      if (!currentUser) {
        throw new Error("User account not found")
      }

      const balanceBefore = Number(currentUser.walletBalance)
      const payoutAmount = Number(payout.amount)

      if (balanceBefore < payoutAmount) {
        throw new Error("Insufficient user balance")
      }

      const balanceAfter = balanceBefore - payoutAmount

      // 1. Deduct from user wallet
      await tx.user.update({
        where: { id: currentUser.id },
        data: {
          walletBalance: { decrement: payoutAmount },
        },
      })

      // 2. Mark payout as completed
      const updatedPayout = await tx.payoutRequest.update({
        where: { id: params.id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          processedBy: session.user.id,
          razorpayPayoutId: transactionId ?? null,
        },
      })

      // 3. Record transaction in ledger
      await tx.transaction.create({
        data: {
          userId: currentUser.id,
          type: "PAYOUT",
          amount: payoutAmount,
          balanceBefore,
          balanceAfter,
          description: `Payout to UPI ${payout.upiId}`,
          metadata: {
            payoutRequestId: payout.id,
            processedBy: session.user.id,
            razorpayPayoutId: transactionId ?? null,
          },
        },
      })

      return updatedPayout
    })

    return NextResponse.json({ success: true, payout: result })
  } catch (err: any) {
    console.error("[PROCESS_PAYOUT]", err)
    return NextResponse.json(
      { error: err.message || "Failed to process payout" },
      { status: 500 }
    )
  }
}


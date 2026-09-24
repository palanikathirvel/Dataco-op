import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/razorpay"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "BRAND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters" },
        { status: 400 }
      )
    }

    if (typeof amount !== "number" || amount < 100000) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      )
    }

    // Verify HMAC-SHA256 signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    if (!isValid) {
      console.error("[PAYMENT_VERIFY] Invalid signature for order:", razorpay_order_id)
      return NextResponse.json(
        { error: "Invalid payment signature verification failed" },
        { status: 400 }
      )
    }

    // Atomic transaction for wallet credit and audit ledger
    const result = await prisma.$transaction(async (tx) => {
      // Check for duplicate processing (idempotency)
      const existing = await tx.transaction.findFirst({
        where: {
          OR: [
            { razorpayOrderId: razorpay_order_id },
            { razorpayPaymentId: razorpay_payment_id },
          ],
        },
      })

      const currentBrand = await tx.brand.findUnique({
        where: { id: session.user.id },
        select: { id: true, walletBalance: true },
      })

      if (!currentBrand) {
        throw new Error("Brand account not found")
      }

      if (existing) {
        return {
          alreadyProcessed: true,
          balance: Number(currentBrand.walletBalance),
        }
      }

      const balanceBefore = Number(currentBrand.walletBalance)
      const depositAmount = Number(amount)
      const balanceAfter = balanceBefore + depositAmount

      // 1. Credit brand wallet balance
      await tx.brand.update({
        where: { id: currentBrand.id },
        data: {
          walletBalance: { increment: depositAmount },
        },
      })

      // 2. Record transaction in ledger
      const transaction = await tx.transaction.create({
        data: {
          brandId: currentBrand.id,
          type: "BRAND_DEPOSIT",
          amount: depositAmount,
          balanceBefore,
          balanceAfter,
          description: `Wallet top-up of ₹${(depositAmount / 100).toLocaleString("en-IN")} via Razorpay`,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          metadata: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            gateway: "razorpay",
            verifiedAt: new Date().toISOString(),
          },
        },
      })

      // 3. Post notification
      await tx.notification.create({
        data: {
          brandId: currentBrand.id,
          type: "SYSTEM_ANNOUNCEMENT",
          title: "Wallet Top-Up Successful",
          message: `₹${(depositAmount / 100).toLocaleString("en-IN")} was added to your wallet. Current balance: ₹${(balanceAfter / 100).toLocaleString("en-IN")}.`,
          actionUrl: "/brand/wallet",
        },
      })

      return {
        alreadyProcessed: false,
        balance: balanceAfter,
        transactionId: transaction.id,
      }
    })

    return NextResponse.json({
      success: true,
      balance: result.balance,
      alreadyProcessed: result.alreadyProcessed,
    })
  } catch (err: any) {
    console.error("[BRAND_WALLET_VERIFY]", err)
    return NextResponse.json(
      { error: err.message || "Failed to verify and process payment" },
      { status: 500 }
    )
  }
}

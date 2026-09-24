import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex")

      if (expectedSignature !== signature) {
        console.warn("[RAZORPAY_WEBHOOK] Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event

    if (event === "payment.captured") {
      const payment = payload.payload?.payment?.entity
      if (payment) {
        const orderId = payment.order_id
        const paymentId = payment.id
        const amount = payment.amount // in paise
        const notes = payment.notes || {}
        const brandId = notes.brandId

        if (orderId && brandId) {
          // Check if already processed
          const existing = await prisma.transaction.findFirst({
            where: {
              OR: [
                { razorpayOrderId: orderId },
                { razorpayPaymentId: paymentId },
              ],
            },
          })

          if (!existing) {
            await prisma.$transaction(async (tx) => {
              const brand = await tx.brand.findUnique({
                where: { id: brandId },
                select: { id: true, walletBalance: true },
              })

              if (brand) {
                const balanceBefore = Number(brand.walletBalance)
                const balanceAfter = balanceBefore + amount

                await tx.brand.update({
                  where: { id: brandId },
                  data: { walletBalance: { increment: amount } },
                })

                await tx.transaction.create({
                  data: {
                    brandId,
                    type: "BRAND_DEPOSIT",
                    amount,
                    balanceBefore,
                    balanceAfter,
                    description: `Wallet deposit of ₹${(amount / 100).toLocaleString("en-IN")} via Razorpay Webhook`,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId,
                    metadata: { orderId, paymentId, source: "webhook" },
                  },
                })
              }
            })
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (err: any) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]", err)
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    )
  }
}

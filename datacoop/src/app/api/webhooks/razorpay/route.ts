import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpay, verifyPaymentSignature } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        const amount = payment.amount / 100;

        const transaction = await prisma.transaction.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (transaction) {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              razorpayPaymentId: paymentId,
            },
          });

          if (transaction.researchRequestId) {
            await prisma.researchRequest.update({
              where: { id: transaction.researchRequestId },
              data: { status: "ACTIVE" },
            });

            await matchUsersToSurvey(transaction.researchRequestId);
          }

          if (transaction.brandId) {
            await prisma.brand.update({
              where: { id: transaction.brandId },
              data: { walletBalance: { increment: amount } },
            });
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;

        const transaction = await prisma.transaction.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (transaction) {
          // Transaction doesn't have status field, could add metadata instead
        }
        break;
      }

      case "payout.processed": {
        const payout = event.payload.payout.entity;
        const payoutId = payout.id;
        const status = payout.status;

        const payoutRequest = await prisma.payoutRequest.findFirst({
          where: { razorpayPayoutId: payoutId },
        });

        if (payoutRequest) {
          const newStatus = status === "processed" ? "COMPLETED" : "FAILED";
          await prisma.payoutRequest.update({
            where: { id: payoutRequest.id },
            data: { status: newStatus as any },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function matchUsersToSurvey(researchRequestId: string) {
  const researchRequest = await prisma.researchRequest.findUnique({
    where: { id: researchRequestId },
    include: { questions: true, brand: { select: { name: true } } },
  });

  if (!researchRequest) return;

  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      cohortTags: { some: { tag: { in: researchRequest.targetCohorts } } },
      NOT: {
        responses: { some: { researchRequestId } },
      },
    },
    take: researchRequest.sampleSize,
    orderBy: { lastActiveAt: "desc" },
  });

  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "NEW_SURVEY",
        title: "New Survey Available",
        message: `${researchRequest.brand?.name || "A brand"} needs your opinion. Earn ₹${researchRequest.pricePerResponse} for ${researchRequest.questions.length * 2} minutes.`,
        data: { researchRequestId },
      },
    });
  }
}
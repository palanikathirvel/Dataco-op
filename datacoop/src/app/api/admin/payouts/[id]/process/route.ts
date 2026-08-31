import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendPayoutProcessedEmail } from "@/lib/email";
import { z } from "zod";

const processSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = processSchema.parse(body);

    const payout = await prisma.payoutRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    if (payout.status !== "PENDING") {
      return NextResponse.json({ error: "Payout already processed" }, { status: 400 });
    }

    if (validated.action === "APPROVE") {
      await prisma.$transaction(async (tx) => {
        await tx.payoutRequest.update({
          where: { id },
          data: {
            status: "PROCESSING",
            processedAt: new Date(),
            processedBy: session.userId,
          },
        });

        await tx.user.update({
          where: { id: payout.userId },
          data: {
            walletBalance: { decrement: payout.amount },
          },
        });

        await tx.transaction.create({
          data: {
            userId: payout.userId,
            type: "PAYOUT",
            amount: payout.amount,
            balanceBefore: payout.user.walletBalance,
            balanceAfter: Number(payout.user.walletBalance) - Number(payout.amount),
            description: `Payout to ${payout.upiId}`,
            metadata: { payoutId: id },
          },
        });

        await tx.notification.create({
          data: {
            userId: payout.userId,
            type: "PAYOUT_PROCESSED",
            title: "Payout Processed",
            message: `₹${payout.amount} has been sent to your UPI ID ${payout.upiId}`,
            data: { payoutId: id, amount: Number(payout.amount) },
          },
        });
      });

      // TODO: Call RazorpayX payout API here
      // await razorpayX.payout({ ... });

      await prisma.payoutRequest.update({
        where: { id },
        data: { status: "COMPLETED" },
      });

      await sendPayoutProcessedEmail(payout.user.email, payout.user.name || "User", Number(payout.amount), payout.upiId);

      return NextResponse.json({ success: true });
    } else {
      await prisma.payoutRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          processedAt: new Date(),
          processedBy: session.userId,
          rejectReason: "Rejected by admin",
        },
      });

      await prisma.notification.create({
        data: {
          userId: payout.userId,
          type: "PAYOUT_PROCESSED",
          title: "Payout Rejected",
          message: `Your payout request for ₹${payout.amount} was rejected. Amount returned to wallet.`,
          data: { payoutId: id },
        },
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Process payout error:", error);
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
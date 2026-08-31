import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const payoutSchema = z.object({
  amount: z.number().min(500, "Minimum withdrawal is ₹500"),
  upiId: z.string().regex(/^[\w.\-]+@[\w.\-]+$/, "Invalid UPI ID format"),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = payoutSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { walletBalance: true, email: true, name: true },
    });

    if (!user || Number(user.walletBalance) < validated.amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (Number(user.walletBalance) < 500) {
      return NextResponse.json({ error: "Minimum balance for withdrawal is ₹500" }, { status: 400 });
    }

    const payout = await prisma.payoutRequest.create({
      data: {
        userId: session.userId,
        amount: validated.amount,
        upiId: validated.upiId,
        status: "PENDING",
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.userId,
        type: "PAYOUT_PROCESSED",
        title: "Payout Request Submitted",
        message: `Your withdrawal request for ${validated.amount} has been submitted and is pending admin approval.`,
        data: { payoutId: payout.id },
      },
    });

    return NextResponse.json({ payout }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Payout request error:", error);
    return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 });
  }
}
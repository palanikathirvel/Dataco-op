import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";
import { z } from "zod";

const addFundsSchema = z.object({
  amount: z.number().min(5000, "Minimum deposit is ₹5,000"),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brandId = session.brandId || session.userId;

  try {
    const body = await request.json();
    const validated = addFundsSchema.parse(body);

    const order = await createOrder({
      amount: validated.amount * 100,
      currency: "INR",
      receipt: `brand_deposit_${brandId}_${Date.now()}`,
      notes: { brandId, type: "wallet_deposit" },
    });

    await prisma.transaction.create({
      data: {
        brandId,
        type: "BRAND_DEPOSIT",
        amount: validated.amount,
        balanceBefore: 0,
        balanceAfter: validated.amount,
        description: `Wallet deposit via Razorpay`,
        razorpayOrderId: order.id,
        metadata: { orderId: order.id },
      },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Add funds error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
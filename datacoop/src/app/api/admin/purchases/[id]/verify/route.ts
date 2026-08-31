import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { applyCohortTags } from "@/lib/cohort-tags";
import { sendPurchaseVerifiedEmail, sendPurchaseRejectedEmail } from "@/lib/email";
import { z } from "zod";

const verifySchema = z.object({
  action: z.enum(["VERIFY", "REJECT"]),
  rejectReason: z.string().optional(),
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
    const validated = verifySchema.parse(body);

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (purchase.status !== "PENDING_VERIFICATION") {
      return NextResponse.json({ error: "Purchase already processed" }, { status: 400 });
    }

    if (validated.action === "VERIFY") {
      const updatedPurchase = await prisma.purchase.update({
        where: { id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy: session.userId,
        },
      });

      await applyCohortTags(purchase.userId, {
        category: purchase.category,
        amount: Number(purchase.amount),
        platform: purchase.platform,
      });

      await prisma.notification.create({
        data: {
          userId: purchase.userId,
          type: "PURCHASE_VERIFIED",
          title: "Purchase Verified",
          message: `Your ${purchase.productName} purchase has been verified! New cohorts unlocked.`,
          data: { purchaseId: purchase.id },
        },
      });

      await sendPurchaseVerifiedEmail(purchase.user.email, purchase.user.name || "User", purchase.productName, purchase.id);

      return NextResponse.json({ purchase: updatedPurchase });
    } else {
      const updatedPurchase = await prisma.purchase.update({
        where: { id },
        data: {
          status: "REJECTED",
          verifiedAt: new Date(),
          verifiedBy: session.userId,
          rejectReason: validated.rejectReason || "Did not meet verification criteria",
        },
      });

      await prisma.notification.create({
        data: {
          userId: purchase.userId,
          type: "PURCHASE_REJECTED",
          title: "Purchase Rejected",
          message: `Your ${purchase.productName} purchase was rejected. Reason: ${validated.rejectReason || "Did not meet verification criteria"}`,
          data: { purchaseId: purchase.id },
        },
      });

      await sendPurchaseRejectedEmail(purchase.user.email, purchase.user.name || "User", purchase.productName, validated.rejectReason || "Did not meet verification criteria");

      return NextResponse.json({ purchase: updatedPurchase });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Verify purchase error:", error);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}
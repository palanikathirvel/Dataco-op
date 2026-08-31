import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const purchaseSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  productName: z.string().min(2, "Product name is required").max(200),
  productCategory: z.string().min(2, "Category is required").max(100),
  brandName: z.string().max(100).optional().nullable(),
  amount: z.number().int().min(100, "Amount must be at least ₹1").max(100000000),
  purchaseDate: z.string().datetime(),
  orderId: z.string().min(3, "Order ID is required").max(100),
  method: z.enum(["SCREENSHOT", "EMAIL_FORWARD", "MANUAL_ENTRY"]),
  screenshotUrl: z.string().optional(),
  exifData: z.any().optional(),
  perceptualHash: z.string().optional(),
  isSuspicious: z.boolean().optional(),
  suspicionReasons: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ purchases });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = purchaseSchema.parse(body);

    // Check for duplicate orderId from a different user
    const existingOrder = await prisma.purchase.findFirst({
      where: {
        orderId: validated.orderId,
        userId: { not: session.userId },
      },
      select: { id: true, userId: true },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: "This order ID has already been submitted by another user" },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: session.userId,
        platform: validated.platform,
        productName: validated.productName,
        category: validated.productCategory,
        brand: validated.brandName || null,
        amount: validated.amount / 100, // convert paise to rupees
        orderId: validated.orderId,
        purchaseDate: new Date(validated.purchaseDate),
        method: validated.method,
        screenshotUrl: validated.screenshotUrl,
        exifData: validated.exifData,
        perceptualHash: validated.perceptualHash,
        status: "PENDING_VERIFICATION",
      },
    });

    await prisma.verificationQueue.create({
      data: { purchaseId: purchase.id },
    });

    if (validated.isSuspicious && validated.suspicionReasons?.length) {
      await prisma.notification.create({
        data: {
          userId: session.userId,
          type: "PURCHASE_REJECTED",
          title: "Purchase Flagged for Review",
          message: `Your purchase submission has been flagged for manual review: ${validated.suspicionReasons.join(", ")}`,
          data: { purchaseId: purchase.id, reasons: validated.suspicionReasons },
        },
      });
    }

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Purchase creation error:", error);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendBrandApprovedEmail } from "@/lib/email";
import { z } from "zod";

const updateBrandSchema = z.object({
  id: z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectReason: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      website: true,
      industry: true,
      contactPerson: true,
      contactPhone: true,
      status: true,
      walletBalance: true,
      totalSpent: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ brands });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action, rejectReason } = updateBrandSchema.parse(body);

    const brand = await prisma.brand.findUnique({ where: { id } });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    if (brand.status !== "PENDING_APPROVAL") {
      return NextResponse.json({ error: "Brand already processed" }, { status: 400 });
    }

    if (action === "APPROVE") {
      const updatedBrand = await prisma.brand.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: session.userId,
        },
      });

      await prisma.notification.create({
        data: {
          brandId: brand.id,
          type: "BRAND_REGISTRATION",
          title: "Brand Approved",
          message: "Your brand account has been approved. You can now create research studies.",
        },
      });

      await sendBrandApprovedEmail(brand.email, brand.name);

      return NextResponse.json({ brand: updatedBrand });
    } else {
      const updatedBrand = await prisma.brand.update({
        where: { id },
        data: {
          status: "REJECTED",
          approvedAt: new Date(),
          approvedBy: session.userId,
        },
      });

      await prisma.notification.create({
        data: {
          brandId: brand.id,
          type: "BRAND_REGISTRATION",
          title: "Brand Rejected",
          message: `Your brand registration was rejected. Reason: ${rejectReason || "Did not meet requirements"}`,
        },
      });

      return NextResponse.json({ brand: updatedBrand });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Update brand error:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}
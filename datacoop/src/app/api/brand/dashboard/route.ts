import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brandId = session.brandId || session.userId;

  const [brand, activeStudies, totalResponses, recentTransactions] = await Promise.all([
    prisma.brand.findUnique({
      where: { id: brandId },
      select: { walletBalance: true, totalSpent: true },
    }),
    prisma.researchRequest.findMany({
      where: { brandId, status: { in: ["ACTIVE", "PENDING_PAYMENT"] } },
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.surveyResponse.count({
      where: { researchRequest: { brandId } },
    }),
    prisma.transaction.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    walletBalance: Number(brand?.walletBalance || 0),
    totalSpent: Number(brand?.totalSpent || 0),
    activeStudies: activeStudies.map((s) => ({
      ...s,
      pricePerResponse: Number(s.pricePerResponse),
    })),
    totalResponses,
    recentTransactions,
  });
}
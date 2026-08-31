import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalBrands,
    totalUsersLastMonth,
    totalBrandsLastMonth,
    revenueToday,
    revenueYesterday,
    pendingVerifications,
    pendingPayoutsCount,
    recentUsers,
    recentBrands,
    pendingPurchases,
    pendingPayoutsList,
    activeResearch,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.brand.count(),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: lastMonth } } }),
    prisma.brand.count({ where: { createdAt: { gte: lastMonth } } }),
    prisma.transaction.aggregate({
      where: { type: "PLATFORM_FEE", createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "PLATFORM_FEE", createdAt: { gte: new Date(yesterday.setHours(0, 0, 0, 0)), lt: new Date(now.setHours(0, 0, 0, 0)) } },
      _sum: { amount: true },
    }),
    prisma.purchase.count({ where: { status: "PENDING_VERIFICATION" } }),
    prisma.payoutRequest.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, city: true, walletBalance: true, status: true, createdAt: true },
    }),
    prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, industry: true, status: true, walletBalance: true, createdAt: true },
    }),
    prisma.purchase.findMany({
      where: { status: "PENDING_VERIFICATION" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.payoutRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.researchRequest.findMany({
      where: { status: { in: ["ACTIVE", "PENDING_PAYMENT"] } },
      include: { brand: { select: { name: true } }, _count: { select: { responses: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const userGrowth = totalUsersLastMonth > 0 ? Math.round(((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100) : 0;
  const brandGrowth = totalBrandsLastMonth > 0 ? Math.round(((totalBrands - totalBrandsLastMonth) / totalBrandsLastMonth) * 100) : 0;
  const revenueGrowth = Number(revenueYesterday._sum.amount || 0) > 0
    ? Math.round(((Number(revenueToday._sum.amount || 0) - Number(revenueYesterday._sum.amount || 0)) / Number(revenueYesterday._sum.amount || 0)) * 100)
    : 0;

  return NextResponse.json({
    totalUsers,
    totalBrands,
    userGrowth,
    brandGrowth,
    revenueToday: Number(revenueToday._sum.amount || 0),
    revenueGrowth,
    pendingVerifications,
    pendingPayouts: pendingPayoutsCount,
    recentUsers,
    recentBrands,
    pendingPurchases,
    pendingPayoutsList,
    activeResearch,
  });
}
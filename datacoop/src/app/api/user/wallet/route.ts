import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, transactions, payoutRequests] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { walletBalance: true, totalEarned: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.payoutRequest.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    balance: Number(user?.walletBalance || 0),
    totalEarned: Number(user?.totalEarned || 0),
    transactions,
    payoutRequests,
  });
}
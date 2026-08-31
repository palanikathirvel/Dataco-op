import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        walletBalance: true,
        totalEarned: true,
        cohortTags: { select: { tag: true } },
      },
    });

    const userCohorts = user?.cohortTags.map((c) => c.tag) || [];

    const [purchases, availableSurveys, recentActivity] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId: session.userId, status: "VERIFIED" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.researchRequest.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { targetCohorts: { hasSome: userCohorts } },
            { targetCohorts: { isEmpty: true } },
          ],
          NOT: {
            responses: { some: { userId: session.userId } },
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          pricePerResponse: true,
          sampleSize: true,
          expiresAt: true,
          createdAt: true,
          brand: { select: { name: true } },
          questions: { select: { id: true } },
          _count: { select: { responses: { where: { userId: session.userId } } } },
        },
        take: 10,
      }),
      prisma.transaction.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const surveys = availableSurveys.map((s) => ({
      ...s,
      pricePerResponse: Number(s.pricePerResponse),
      questionCount: s.questions.length,
      hasResponded: s._count.responses > 0,
    }));

    return NextResponse.json({
      walletBalance: Number(user?.walletBalance || 0),
      totalEarned: Number(user?.totalEarned || 0),
      cohortTags: userCohorts,
      purchases,
      availableSurveys: surveys,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}

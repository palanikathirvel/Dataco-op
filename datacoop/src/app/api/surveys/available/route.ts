import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { cohortTags: { select: { tag: true } } },
  });

  const userCohorts = user?.cohortTags.map((c) => c.tag) || [];

  const surveys = await prisma.researchRequest.findMany({
    where: {
      status: "ACTIVE",
      targetCohorts: { hasSome: userCohorts },
      NOT: {
        responses: { some: { userId: session.userId } },
      },
    },
    include: {
      brand: { select: { name: true } },
      questions: { select: { id: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    surveys: surveys.map((s) => ({
      ...s,
      pricePerResponse: Number(s.pricePerResponse),
      questionCount: s.questions.length,
    })),
  });
}
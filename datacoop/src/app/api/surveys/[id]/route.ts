import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const researchRequest = await prisma.researchRequest.findUnique({
    where: { id },
    include: {
      brand: { select: { name: true } },
      questions: { orderBy: { order: "asc" } },
      _count: { select: { responses: { where: { userId: session.userId } } } },
    },
  });

  if (!researchRequest) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  if (researchRequest.status !== "ACTIVE") {
    return NextResponse.json({ error: "Survey is not active" }, { status: 400 });
  }

  const hasResponded = researchRequest._count.responses > 0;
  if (hasResponded) {
    return NextResponse.json({ error: "You have already responded to this survey" }, { status: 400 });
  }

  return NextResponse.json({
    ...researchRequest,
    pricePerResponse: Number(researchRequest.pricePerResponse),
    hasResponded,
    questions: researchRequest.questions.map((q) => ({
      ...q,
      options: q.options || [],
    })),
  });
}
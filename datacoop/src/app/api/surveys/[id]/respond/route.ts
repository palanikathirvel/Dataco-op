import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendSurveyCompletedEmail } from "@/lib/email";
import { z } from "zod";

const respondSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.string(),
    timeSpent: z.number().optional(),
  })),
  totalTimeSpent: z.number(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = respondSchema.parse(body);

    const researchRequest = await prisma.researchRequest.findUnique({
      where: { id },
      include: { questions: true, brand: { select: { name: true } } },
    });

    if (!researchRequest) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (researchRequest.status !== "ACTIVE") {
      return NextResponse.json({ error: "Survey is not active" }, { status: 400 });
    }

    const existingResponse = await prisma.surveyResponse.findUnique({
      where: { userId_researchRequestId: { userId: session.userId, researchRequestId: id } },
    });

    if (existingResponse) {
      return NextResponse.json({ error: "Already responded" }, { status: 400 });
    }

    if (validated.totalTimeSpent < 180) {
      return NextResponse.json({ error: "Minimum 3 minutes required" }, { status: 400 });
    }

    const payoutAmount = Number(researchRequest.pricePerResponse);

    const [response] = await prisma.$transaction([
      prisma.surveyResponse.create({
        data: {
          userId: session.userId,
          researchRequestId: id,
          status: "SUBMITTED",
          submittedAt: new Date(),
          timeSpent: validated.totalTimeSpent,
          answers: {
            create: validated.answers.map((a) => ({
              questionId: a.questionId,
              value: a.value,
              timeSpent: a.timeSpent,
            })),
          },
        },
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: {
          walletBalance: { increment: payoutAmount },
          totalEarned: { increment: payoutAmount },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: session.userId,
          researchRequestId: id,
          type: "SURVEY_EARNING",
          amount: payoutAmount,
          balanceBefore: 0, // Will be calculated
          balanceAfter: 0, // Will be calculated
          description: `Survey earning: ${researchRequest.title}`,
        },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { walletBalance: true, totalEarned: true },
    });

    await prisma.notification.create({
      data: {
        userId: session.userId,
        type: "SURVEY_COMPLETED",
        title: "Survey Submitted",
        message: `Your response has been submitted. ${payoutAmount} will be added to your wallet after review.`,
        data: { responseId: response.id, researchRequestId: id },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, name: true },
    });

    if (user) {
      await sendSurveyCompletedEmail(user.email, user.name || "User", payoutAmount);
    }

    return NextResponse.json({ response, payoutAmount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Survey response error:", error);
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}
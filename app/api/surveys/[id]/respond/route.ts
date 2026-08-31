import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { answers, timeSpentSeconds } = body

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 })
    }

    // Get the survey
    const survey = await prisma.researchRequest.findUnique({
      where: { id: params.id },
      include: {
        SurveyQuestion: { orderBy: { order: "asc" } },
        brand: { select: { id: true, walletBalance: true } },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }
    if (survey.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Survey is not active" },
        { status: 400 }
      )
    }

    // Check expiry
    if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Survey expired" }, { status: 400 })
    }

    // Check user hasn't already responded
    const existing = await prisma.surveyResponse.findUnique({
      where: {
        userId_researchRequestId: {
          userId: session.user.id,
          researchRequestId: survey.id,
        },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Already responded to this survey" },
        { status: 400 }
      )
    }

    // Validate required questions
    for (const q of survey.SurveyQuestion) {
      if (q.required) {
        const ans = (answers as any)[q.id]
        if (ans === undefined || ans === null || ans === "") {
          return NextResponse.json(
            { error: `Question "${q.question}" is required` },
            { status: 400 }
          )
        }
      }
    }

    // Create the response (and survey answers if model exists)
    const response = await prisma.surveyResponse.create({
      data: {
        userId: session.user.id,
        researchRequestId: survey.id,
        status: "SUBMITTED",
        timeSpent: typeof timeSpentSeconds === "number" ? timeSpentSeconds : null,
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Save individual answers (if SurveyAnswer model exists)
    if ((prisma as any).surveyAnswer) {
      for (const q of survey.SurveyQuestion) {
        const ans = (answers as any)[q.id]
        if (ans !== undefined) {
          const valueStr = Array.isArray(ans) ? ans.join(",") : String(ans)
          try {
            await (prisma as any).surveyAnswer.create({
              data: {
                responseId: response.id,
                questionId: q.id,
                value: valueStr,
              },
            })
          } catch (e) {
            // Best-effort, don't fail the whole submission
            console.warn("[SURVEY_ANSWER]", e)
          }
        }
      }
    }

    // Credit user wallet
    const payout = Number(survey.pricePerResponse)
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        walletBalance: { increment: payout },
        totalEarned: { increment: payout },
      },
    })

    // Record the transaction (best-effort)
    try {
      const balanceAfter = user.walletBalance
      const balanceBefore = new Decimal(Number(balanceAfter) - payout)
      await prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "SURVEY_EARNING",
          amount: payout,
          balanceBefore,
          balanceAfter,
          description: `Survey: ${survey.title} (${(survey as any).brand?.name ?? "Brand"})`,
          brandId: survey.brandId,
          researchRequestId: survey.id,
        },
      })
    } catch (e) {
      console.warn("[TRANSACTION_RECORD]", e)
    }

    return NextResponse.json({
      success: true,
      payout,
      message: "Survey submitted",
    })
  } catch (err) {
    console.error("[SURVEY_RESPOND]", err)
    return NextResponse.json(
      { error: "Failed to submit survey" },
      { status: 500 }
    )
  }
}

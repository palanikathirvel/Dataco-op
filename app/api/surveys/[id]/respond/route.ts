import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

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
        brand: { select: { id: true, name: true, walletBalance: true } },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }
    if (survey.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Survey is no longer active" },
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
        { error: "You have already responded to this survey" },
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

    const payout = Number(survey.pricePerResponse)

    // Execute atomic transaction for response creation, sample count validation, wallet payout, and audit ledger
    const result = await prisma.$transaction(async (tx) => {
      // 1. Enforce sample size limit under transaction
      const responseCount = await tx.surveyResponse.count({
        where: { researchRequestId: survey.id },
      })

      if (responseCount >= survey.sampleSize) {
        await tx.researchRequest.update({
          where: { id: survey.id },
          data: { status: "COMPLETED" },
        })
        throw new Error("This research project has reached its maximum sample size and is now closed.")
      }

      // 2. Create the survey response
      const response = await tx.surveyResponse.create({
        data: {
          userId: session.user.id,
          researchRequestId: survey.id,
          status: "APPROVED",
          timeSpent: typeof timeSpentSeconds === "number" ? timeSpentSeconds : null,
          submittedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // 3. Save individual answers
      for (const q of survey.SurveyQuestion) {
        const ans = (answers as any)[q.id]
        if (ans !== undefined) {
          const valueStr = Array.isArray(ans) ? ans.join(",") : String(ans)
          await tx.surveyAnswer.create({
            data: {
              id: uuidv4(),
              responseId: response.id,
              questionId: q.id,
              value: valueStr,
              updatedAt: new Date(),
            },
          })
        }
      }

      // 4. Fetch current user balance and credit wallet atomically
      const currentUser = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, walletBalance: true },
      })

      if (!currentUser) {
        throw new Error("User account not found")
      }

      const balanceBefore = Number(currentUser.walletBalance)
      const balanceAfter = balanceBefore + payout

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          walletBalance: { increment: payout },
          totalEarned: { increment: payout },
        },
      })

      // 5. Record transaction in ledger
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: "SURVEY_EARNING",
          amount: payout,
          balanceBefore: new Decimal(balanceBefore),
          balanceAfter: new Decimal(balanceAfter),
          description: `Survey Reward: ${survey.title} (${(survey as any).brand?.name ?? "Brand Partner"})`,
          brandId: survey.brandId,
          researchRequestId: survey.id,
        },
      })

      // 6. If this was the last required response, mark survey as COMPLETED
      if (responseCount + 1 >= survey.sampleSize) {
        await tx.researchRequest.update({
          where: { id: survey.id },
          data: { status: "COMPLETED" },
        })
      }

      return { response, payout }
    })

    return NextResponse.json({
      success: true,
      payout: result.payout,
      message: "Survey submitted successfully! Payout credited to your wallet.",
    })
  } catch (err: any) {
    console.error("[SURVEY_RESPOND]", err)
    const isClientError =
      err.message === "This research project has reached its maximum sample size and is now closed." ||
      err.message === "User account not found"

    return NextResponse.json(
      { error: err.message || "Failed to submit survey" },
      { status: isClientError ? 400 : 500 }
    )
  }
}


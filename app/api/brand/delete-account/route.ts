import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id || session.user?.role !== "BRAND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const brandId = session.user.id
    const brandEmail = session.user.email?.toLowerCase().trim()

    // 1. Verify brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true, email: true },
    })

    if (!brand) {
      return NextResponse.json({ error: "Brand account not found" }, { status: 404 })
    }

    // 2. Cascade delete all brand related data
    await prisma.$transaction(async (tx) => {
      // Find all research requests
      const requests = await tx.researchRequest.findMany({
        where: { brandId },
        select: { id: true },
      })
      const requestIds = requests.map((r) => r.id)

      if (requestIds.length > 0) {
        // Find questions to delete survey answers
        const questions = await tx.surveyQuestion.findMany({
          where: { researchRequestId: { in: requestIds } },
          select: { id: true },
        })
        const questionIds = questions.map((q) => q.id)

        if (questionIds.length > 0) {
          await tx.surveyAnswer.deleteMany({
            where: { questionId: { in: questionIds } },
          })
          await tx.surveyQuestion.deleteMany({
            where: { id: { in: questionIds } },
          })
        }

        // Delete survey responses for these requests
        await tx.surveyResponse.deleteMany({
          where: { researchRequestId: { in: requestIds } },
        })

        // Delete transactions tied to research requests
        await tx.transaction.deleteMany({
          where: { researchRequestId: { in: requestIds } },
        })

        // Delete research requests
        await tx.researchRequest.deleteMany({
          where: { brandId },
        })
      }

      // Delete all brand transactions
      await tx.transaction.deleteMany({ where: { brandId } })

      // Delete notifications
      await tx.notification.deleteMany({ where: { brandId } })

      // Delete verification tokens
      if (brandEmail) {
        await tx.verificationToken.deleteMany({
          where: { identifier: brandEmail },
        })
      }

      // Finally delete Brand record
      await tx.brand.delete({ where: { id: brandId } })
    })

    console.log(`[BRAND_ACCOUNT_DELETED] Permanently purged brand ID: ${brandId} (${brandEmail})`)

    return NextResponse.json({
      success: true,
      message: "Your brand partner account and all project data have been permanently deleted.",
    })
  } catch (error) {
    console.error("[DELETE_BRAND_ACCOUNT_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to delete brand account. Please try again or contact support." },
      { status: 500 }
    )
  }
}

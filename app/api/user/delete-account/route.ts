import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email?.toLowerCase().trim()

    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 })
    }

    // 2. Cascade delete all related data in a safe transaction
    await prisma.$transaction(async (tx) => {
      // Find all purchases to remove from VerificationQueue
      const purchases = await tx.purchase.findMany({
        where: { userId },
        select: { id: true },
      })
      const purchaseIds = purchases.map((p) => p.id)

      if (purchaseIds.length > 0) {
        await tx.verificationQueue.deleteMany({
          where: { purchaseId: { in: purchaseIds } },
        })
      }

      // Find user survey responses to remove survey answers
      const responses = await tx.surveyResponse.findMany({
        where: { userId },
        select: { id: true },
      })
      const responseIds = responses.map((r) => r.id)

      if (responseIds.length > 0) {
        await tx.surveyAnswer.deleteMany({
          where: { responseId: { in: responseIds } },
        })
      }

      // Delete survey responses
      await tx.surveyResponse.deleteMany({ where: { userId } })

      // Delete purchases
      await tx.purchase.deleteMany({ where: { userId } })

      // Delete transactions
      await tx.transaction.deleteMany({ where: { userId } })

      // Delete payouts
      await tx.payoutRequest.deleteMany({ where: { userId } })

      // Delete notifications
      await tx.notification.deleteMany({ where: { userId } })

      // Delete cohort tags
      await tx.cohortTag.deleteMany({ where: { userId } })

      // Delete email forwarding if any
      await tx.emailForwarding.deleteMany({ where: { userId } })

      // Delete NextAuth sessions and accounts
      await tx.session.deleteMany({ where: { userId } })
      await tx.account.deleteMany({ where: { userId } })

      // Delete verification tokens
      if (userEmail) {
        await tx.verificationToken.deleteMany({
          where: { identifier: userEmail },
        })
      }

      // Finally delete User record
      await tx.user.delete({ where: { id: userId } })
    })

    console.log(`[USER_ACCOUNT_DELETED] Permanently purged user ID: ${userId} (${userEmail})`)

    return NextResponse.json({
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
    })
  } catch (error) {
    console.error("[DELETE_USER_ACCOUNT_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "BRAND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const requests = await prisma.researchRequest.findMany({
      where: { brandId: session.user.id },
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ requests })
  } catch (err) {
    console.error("[BRAND_RESEARCH_GET]", err)
    return NextResponse.json({ error: "Failed to fetch research" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "BRAND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      targetCohorts,
      sampleSize,
      pricePerResponse,
      totalBudget,
      expiresAt,
      questions,
    } = body

    // Validate
    if (!title || title.length < 5) {
      return NextResponse.json({ error: "Title must be at least 5 characters" }, { status: 400 })
    }
    if (!description || description.length < 20) {
      return NextResponse.json({ error: "Description must be at least 20 characters" }, { status: 400 })
    }
    if (!Array.isArray(targetCohorts) || targetCohorts.length === 0) {
      return NextResponse.json({ error: "Select at least one target cohort" }, { status: 400 })
    }
    if (typeof sampleSize !== "number" || sampleSize < 50 || sampleSize > 5000) {
      return NextResponse.json({ error: "Sample size must be 50-5000" }, { status: 400 })
    }
    if (typeof pricePerResponse !== "number" || pricePerResponse < 10000) {
      return NextResponse.json({ error: "Price must be at least ₹100 (10000 paise)" }, { status: 400 })
    }
    if (typeof totalBudget !== "number" || totalBudget <= 0) {
      return NextResponse.json({ error: "Total budget invalid" }, { status: 400 })
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "At least one question required" }, { status: 400 })
    }
    for (const q of questions) {
      if (!q.type || !q.question) {
        return NextResponse.json({ error: "Invalid question" }, { status: 400 })
      }
      if ((q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") && (!Array.isArray(q.options) || q.options.length < 2)) {
        return NextResponse.json({ error: `${q.type} questions need at least 2 options` }, { status: 400 })
      }
    }

    // Atomic transaction: verify balance, deduct wallet, create research, write ledger
    const research = await prisma.$transaction(async (tx) => {
      const brand = await tx.brand.findUnique({
        where: { id: session.user.id },
        select: { id: true, walletBalance: true, status: true },
      })

      if (!brand) {
        throw new Error("Brand not found")
      }
      if (brand.status !== "APPROVED") {
        throw new Error("Your brand account is not approved yet")
      }

      const balanceBefore = Number(brand.walletBalance)
      if (balanceBefore < totalBudget) {
        throw new Error("Insufficient wallet balance. Please add funds.")
      }

      const balanceAfter = balanceBefore - totalBudget

      // Deduct from wallet
      await tx.brand.update({
        where: { id: session.user.id },
        data: {
          walletBalance: { decrement: totalBudget },
          totalSpent: { increment: totalBudget },
        },
      })

      // Create research request with questions
      const newResearch = await tx.researchRequest.create({
        data: {
          brandId: session.user.id,
          title,
          description,
          targetCohorts,
          sampleSize,
          pricePerResponse,
          totalBudget,
          status: "ACTIVE",
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          updatedAt: new Date(),
          SurveyQuestion: {
            create: questions.map((q: any) => ({
              id: q.id || uuidv4(),
              type: q.type,
              question: q.question,
              options: q.options || [],
              required: q.required ?? true,
              order: q.order ?? 0,
              updatedAt: new Date(),
            })),
          },
        },
      })

      // Record transaction ledger
      await tx.transaction.create({
        data: {
          brandId: session.user.id,
          researchRequestId: newResearch.id,
          type: "BRAND_SPEND",
          amount: totalBudget,
          balanceBefore,
          balanceAfter,
          description: `Research budget allocated: "${title}"`,
        },
      })

      return newResearch
    })

    return NextResponse.json({ research }, { status: 201 })
  } catch (err: any) {
    console.error("[BRAND_RESEARCH_POST]", err)
    const isClientError =
      err.message === "Your brand account is not approved yet" ||
      err.message === "Insufficient wallet balance. Please add funds." ||
      err.message === "Brand not found"

    return NextResponse.json(
      { error: err.message || "Failed to create research" },
      { status: isClientError ? 400 : 500 }
    )
  }
}


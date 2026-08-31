import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
      if (!q.id || !q.type || !q.question) {
        return NextResponse.json({ error: "Invalid question" }, { status: 400 })
      }
      if ((q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") && (!Array.isArray(q.options) || q.options.length < 2)) {
        return NextResponse.json({ error: `${q.type} questions need at least 2 options` }, { status: 400 })
      }
    }

    // Check brand status
    const brand = await prisma.brand.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, status: true },
    })
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }
    if (brand.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Your brand account is not approved yet" },
        { status: 403 }
      )
    }
    if (Number(brand.walletBalance) < totalBudget) {
      return NextResponse.json(
        { error: "Insufficient wallet balance. Please add funds." },
        { status: 400 }
      )
    }

    // Deduct from wallet
    await prisma.brand.update({
      where: { id: session.user.id },
      data: { walletBalance: { decrement: totalBudget } },
    })

    // Create research request with questions
    const research = await prisma.researchRequest.create({
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
            id: q.id,
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

    return NextResponse.json({ research }, { status: 201 })
  } catch (err) {
    console.error("[BRAND_RESEARCH_POST]", err)
    return NextResponse.json({ error: "Failed to create research" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const researchSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  targetCohorts: z.array(z.string()).min(1, "Select at least one cohort"),
  sampleSize: z.number().min(50, "Minimum 50").max(5000, "Maximum 5000"),
  pricePerResponse: z.number().min(100, "Minimum ₹100").max(1000, "Maximum ₹1000"),
  questions: z.array(z.object({
    type: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "RATING", "TEXT", "NPS"]),
    question: z.string().min(5, "Question too short"),
    options: z.array(z.string()),
    required: z.boolean(),
  })).min(1, "At least one question required"),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brandId = session.brandId || session.userId;

  try {
    const body = await request.json();
    const validated = researchSchema.parse(body);

    const platformFee = 0.3;
    const subtotal = validated.sampleSize * validated.pricePerResponse;
    const totalBudget = subtotal + (subtotal * platformFee);

    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand || Number(brand.walletBalance) < totalBudget) {
      return NextResponse.json({ error: "Insufficient wallet balance. Add funds first." }, { status: 400 });
    }

    const researchRequest = await prisma.researchRequest.create({
      data: {
        brandId,
        title: validated.title,
        description: validated.description,
        targetCohorts: validated.targetCohorts,
        sampleSize: validated.sampleSize,
        pricePerResponse: validated.pricePerResponse,
        platformFee,
        totalBudget,
        status: "PENDING_PAYMENT",
        questions: {
          create: validated.questions.map((q, i) => ({
            type: q.type,
            question: q.question,
            options: q.options,
            required: q.required,
            order: i,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ researchRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Create research error:", error);
    return NextResponse.json({ error: "Failed to create research" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brandId = session.brandId || session.userId;

  const research = await prisma.researchRequest.findMany({
    where: { brandId },
    include: {
      _count: { select: { responses: true } },
      questions: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    research: research.map((r) => ({
      ...r,
      pricePerResponse: Number(r.pricePerResponse),
      platformFee: Number(r.platformFee),
      totalBudget: Number(r.totalBudget),
    })),
  });
}
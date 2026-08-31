import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { z } from "zod";

const brandRegisterSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  industry: z.string().min(2, "Industry is required").optional(),
  contactPerson: z.string().min(2, "Contact person name is required").optional(),
  contactPhone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = brandRegisterSchema.parse(body);

    const existingBrand = await prisma.brand.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(validated.password);

    const brand = await prisma.brand.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        passwordHash,
        website: validated.website || null,
        industry: validated.industry || null,
        contactPerson: validated.contactPerson || null,
        contactPhone: validated.contactPhone || null,
        status: "PENDING_APPROVAL",
      },
    });

    const token = await createToken({
      userId: brand.id,
      email: brand.email,
      role: "BRAND",
      brandId: brand.id,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      brand: {
        id: brand.id,
        name: brand.name,
        email: brand.email,
        status: brand.status,
        role: "BRAND",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Brand registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
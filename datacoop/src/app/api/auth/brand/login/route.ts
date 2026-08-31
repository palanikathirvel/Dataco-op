import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const brand = await prisma.brand.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (!brand || !brand.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (brand.status !== "APPROVED") {
      return NextResponse.json(
        { error: brand.status === "PENDING_APPROVAL" ? "Account pending approval" : "Account not active" },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(validated.password, brand.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

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
    console.error("Brand login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
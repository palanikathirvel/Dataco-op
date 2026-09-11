import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, companyName, website, industry } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }
    if (!companyName || companyName.trim().length < 2) {
      return NextResponse.json({ error: "Company name required" }, { status: 400 })
    }
    if (!industry) {
      return NextResponse.json({ error: "Industry required" }, { status: 400 })
    }
    if (website && !/^https?:\/\//.test(website)) {
      return NextResponse.json({ error: "Website must start with http:// or https://" }, { status: 400 })
    }

    const existing = await prisma.brand.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const brand = await prisma.brand.create({
      data: {
        email,
        passwordHash,
        name: companyName.trim(),
        website: website ?? null,
        industry,
        status: "PENDING_APPROVAL",
        updatedAt: new Date(),
      },
      select: { id: true, email: true, name: true },
    })

    // Send welcome email asynchronously
    try {
      const { sendWelcomeEmail } = await import("@/lib/email")
      await sendWelcomeEmail(email, companyName.trim(), "BRAND")
    } catch (emailErr) {
      console.error("[BRAND_WELCOME_EMAIL_ERROR]", emailErr)
    }

    return NextResponse.json({ brand }, { status: 201 })
  } catch (err) {
    console.error("[BRAND_REGISTER_ERROR]", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

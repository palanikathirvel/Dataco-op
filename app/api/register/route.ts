import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { rateLimit, getClientIp } from "@/lib/ratelimit"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const body = await req.json()
    const { email, password, name, phone, age, gender, city, pincode } = body

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Rate limiting: 5 registrations per hour per IP
    const limit = rateLimit(`register:ip:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 })
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 })
    }
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json({ error: "Phone must be 10 digits" }, { status: 400 })
    }
    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json({ error: "Pincode must be 6 digits" }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        phone: phone ?? null,
        age: age ? parseInt(age, 10) : null,
        gender: gender ?? null,
        city: city ?? null,
        pincode: pincode ?? null,
        emailVerified: new Date(),
        kycStatus: "PENDING",
        role: "USER",
      },
      select: { id: true, email: true, name: true },
    })

    // Send welcome email asynchronously
    try {
      const { sendWelcomeEmail } = await import("@/lib/email")
      await sendWelcomeEmail(cleanEmail, name.trim(), "USER")
    } catch (emailErr) {
      console.error("[WELCOME_EMAIL_ERROR]", emailErr)
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error("[REGISTER_ERROR]", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}


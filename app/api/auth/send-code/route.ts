import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendVerificationCodeEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email, type = "register" } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // If registering, check if account already exists
    if (type === "register") {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      })
      const existingBrand = await prisma.brand.findUnique({
        where: { email: cleanEmail },
      })

      if (existingUser || existingBrand) {
        return NextResponse.json(
          { error: "This email is already registered. Please login instead." },
          { status: 409 }
        )
      }
    }

    // Generate secure 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Clean up any existing tokens for this email and save new one
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    })

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token: code,
        expires,
      },
    })

    // Send email using Resend
    const result = await sendVerificationCodeEmail(cleanEmail, code)

    console.log(`[VERIFICATION_OTP] Code generated for ${cleanEmail}: ${code}`)

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      // For local testing convenience if Resend API key is not yet set
      devPreview: !process.env.RESEND_API_KEY ? code : undefined,
    })
  } catch (error) {
    console.error("[SEND_CODE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    )
  }
}

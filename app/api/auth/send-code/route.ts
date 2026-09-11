import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import {
  sendVerificationCodeEmail,
  sendLoginOtpEmail,
  sendPasswordResetEmail,
} from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email, type = "register" } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // 1. Check existing accounts in database
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })
    const existingBrand = await prisma.brand.findUnique({
      where: { email: cleanEmail },
    })
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    })
    const accountExists = Boolean(existingUser || existingBrand || existingAdmin)

    // Registration check: don't allow duplicate registration
    if (type === "register" && accountExists) {
      return NextResponse.json(
        { error: "This email is already registered. Please log in instead." },
        { status: 409 }
      )
    }

    // Login or Password Reset check: account must exist
    if ((type === "login" || type === "reset-password") && !accountExists) {
      return NextResponse.json(
        { error: "No account found with this email. Please create an account first." },
        { status: 404 }
      )
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

    // Send corresponding email template
    if (type === "login") {
      await sendLoginOtpEmail(cleanEmail, code)
    } else if (type === "reset-password") {
      await sendPasswordResetEmail(cleanEmail, code)
    } else {
      await sendVerificationCodeEmail(cleanEmail, code)
    }

    console.log(`[AUTH_OTP_SENT] Type: ${type} | Email: ${cleanEmail} | Code: ${code}`)

    return NextResponse.json({
      success: true,
      message:
        type === "login"
          ? `One-time login code sent to ${cleanEmail}`
          : type === "reset-password"
          ? `Password reset code sent to ${cleanEmail}`
          : `Verification code sent to ${cleanEmail}`,
      // For local testing convenience if mail credentials are in preview mode
      devPreview:
        !process.env.GMAIL_APP_PASSWORD && !process.env.RESEND_API_KEY ? code : undefined,
    })
  } catch (error) {
    console.error("[SEND_CODE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    )
  }
}


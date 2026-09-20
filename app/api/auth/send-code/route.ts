import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import {
  sendVerificationCodeEmail,
  sendLoginOtpEmail,
  sendPasswordResetEmail,
} from "@/lib/email"
import { rateLimit, getClientIp } from "@/lib/ratelimit"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const body = await req.json()
    const { email, type = "register" } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Rate limiting: 5 requests per 10 minutes per IP & email
    const ipLimit = rateLimit(`send-code:ip:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 })
    const emailLimit = rateLimit(`send-code:email:${cleanEmail}`, { limit: 5, windowMs: 10 * 60 * 1000 })

    if (!ipLimit.success || !emailLimit.success) {
      return NextResponse.json(
        { error: "Too many verification requests. Please wait a few minutes before trying again." },
        { status: 429 }
      )
    }

    // 1. Check existing accounts in database
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    })
    const existingBrand = await prisma.brand.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    })
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
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
    let emailResult: { success: boolean; messageId?: string; error?: any } = { success: true }
    if (type === "login") {
      emailResult = await sendLoginOtpEmail(cleanEmail, code)
    } else if (type === "reset-password") {
      emailResult = await sendPasswordResetEmail(cleanEmail, code)
    } else {
      emailResult = await sendVerificationCodeEmail(cleanEmail, code)
    }

    // Never log raw OTP codes in server logs
    console.log(
      `[AUTH_OTP_SENT] Type: ${type} | Email: ${cleanEmail} | Delivered: ${emailResult.success}`
    )

    if (!emailResult.success) {
      console.warn(`[EMAIL_NOT_DELIVERED] Email sending failed:`, emailResult.error)
    }

    const isProduction = process.env.NODE_ENV === "production"

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? type === "login"
          ? `One-time login code sent to ${cleanEmail}`
          : type === "reset-password"
          ? `Password reset code sent to ${cleanEmail}`
          : `Verification code sent to ${cleanEmail}`
        : `Verification code generated for ${cleanEmail}. (If email takes time to arrive, check spam folder)`,
      // NEVER leak devPreview in production
      devPreview: !isProduction && (!emailResult.success || (!process.env.GMAIL_APP_PASSWORD && !process.env.RESEND_API_KEY))
        ? code
        : undefined,
    })
  } catch (error) {
    console.error("[SEND_CODE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    )
  }
}



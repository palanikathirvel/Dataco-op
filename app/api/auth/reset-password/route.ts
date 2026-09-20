import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { sendPasswordChangedEmail } from "@/lib/email"
import { rateLimit, getClientIp } from "@/lib/ratelimit"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const { email, code, password } = await req.json()

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, reset code, and new password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanCode = code.toString().trim()

    // Rate limiting: max 5 reset attempts per 10 minutes per IP/email
    const limit = rateLimit(`reset-pass:${cleanEmail}:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please wait 10 minutes before trying again." },
        { status: 429 }
      )
    }

    // 1. Verify token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: cleanEmail,

        token: cleanCode,
      },
    })

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid reset code. Please check and try again." },
        { status: 400 }
      )
    }

    if (new Date() > new Date(tokenRecord.expires)) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: cleanEmail },
      })
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Delete token after successful verification
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    })

    // 2. Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    let updated = false
    let userName = ""

    // 3. Update User, Brand, or Admin
    const user = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    })
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      })
      updated = true
      userName = user.name || "Member"
    } else {
      const brand = await prisma.brand.findFirst({
        where: { email: { equals: cleanEmail, mode: "insensitive" } },
      })
      if (brand) {
        await prisma.brand.update({
          where: { id: brand.id },
          data: { passwordHash },
        })
        updated = true
        userName = brand.name
      } else {
        const admin = await prisma.admin.findFirst({
          where: { email: { equals: cleanEmail, mode: "insensitive" } },
        })
        if (admin) {
          await prisma.admin.update({
            where: { id: admin.id },
            data: { passwordHash },
          })
          updated = true
          userName = admin.name || "Admin"
        }
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: "No account found associated with this email address." },
        { status: 404 }
      )
    }

    // 4. Send confirmation alert email
    try {
      await sendPasswordChangedEmail(cleanEmail, userName)
    } catch (emailErr) {
      console.error("[PASSWORD_CHANGED_EMAIL_ERROR]", emailErr)
    }

    return NextResponse.json({
      success: true,
      message: "Password successfully updated! You can now log in with your new password.",
    })
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}

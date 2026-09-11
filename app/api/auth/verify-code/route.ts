import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanCode = code.toString().trim()

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: cleanEmail,
        token: cleanCode,
      },
    })

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check and try again." },
        { status: 400 }
      )
    }

    if (new Date() > new Date(tokenRecord.expires)) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: cleanEmail },
      })
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Delete token after successful validation
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    })

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("[VERIFY_CODE_ERROR]", error)
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    )
  }
}

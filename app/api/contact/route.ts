import { NextResponse } from "next/server"
import { sendContactInquiryEmail, sendContactConfirmationEmail } from "@/lib/email"
import { rateLimit, getClientIp } from "@/lib/ratelimit"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const body = await req.json()
    const { name, email, phone, topic, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    // Rate limiting: 5 contact submissions per 15 minutes
    const limit = rateLimit(`contact:${cleanEmail}:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 })
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many messages sent. Please wait a few minutes before contacting us again." },
        { status: 429 }
      )
    }


    // 1. Dispatch notification email to create.pk.123@gmail.com
    await sendContactInquiryEmail({
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : undefined,
      topic: topic || "general",
      message: String(message).trim(),
    })

    // 2. Dispatch auto-confirmation receipt to sender
    try {
      await sendContactConfirmationEmail({
        name: String(name).trim(),
        email: cleanEmail,
        topic: topic || "general",
      })
    } catch (confError) {
      console.warn("[CONTACT_CONFIRMATION_NOTICE]", confError)
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been transmitted to create.pk.123@gmail.com. We will respond promptly!",
    })
  } catch (error) {
    console.error("[CONTACT_API_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to dispatch message. Please try again or email create.pk.123@gmail.com directly." },
      { status: 500 }
    )
  }
}

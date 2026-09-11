import { NextResponse } from "next/server"
import { sendContactInquiryEmail, sendContactConfirmationEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
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

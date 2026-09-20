import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAllFeedbacks, addFeedback, getFeedbackStats } from "@/lib/feedbackStore"
import { sendEmail } from "@/lib/email"
import { rateLimit, getClientIp } from "@/lib/ratelimit"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userType = searchParams.get("userType") as "customer" | "brand" | null
    const myOnly = searchParams.get("myOnly") === "true"

    let userIdFilter: string | undefined = undefined
    if (myOnly) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        userIdFilter = session.user.id
      }
    }

    const feedbacks = await getAllFeedbacks(userType || undefined, userIdFilter)
    const stats = await getFeedbackStats(userType || undefined)
    return NextResponse.json({ success: true, feedbacks, stats })
  } catch (error) {
    console.error("[GET_FEEDBACK_ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to submit feedback." },
        { status: 401 }
      )
    }

    // Rate limit: 5 feedback submissions per hour per user
    const limit = rateLimit(`feedback:${session.user.id}:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please try again later." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { name, role, companyOrLocation, category, rating, comment, userType } = body

    if (!comment || !rating) {
      return NextResponse.json(
        { error: "Rating and feedback comments are required." },
        { status: 400 }
      )
    }

    const parsedRating = parseInt(rating, 10)
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars." },
        { status: 400 }
      )
    }

    const isBrand = session.user.role === "BRAND"
    const finalUserType = isBrand ? "brand" : (userType === "brand" ? "brand" : "customer")
    const finalName = name?.trim() || session.user.name || (isBrand ? "Verified Brand Partner" : "Verified Customer")
    const userEmail = session.user.email || undefined
    const userId = session.user.id

    const newFeedback = await addFeedback({
      name: finalName,
      role: role?.trim() || (isBrand ? "Brand Partner" : "Verified Consumer"),
      companyOrLocation: companyOrLocation?.trim() || (isBrand ? "Partner Brand" : "India"),
      category: category?.trim() || "General Experience",
      rating: parsedRating,
      comment: String(comment).trim(),
      userType: finalUserType,
      userId,
      userEmail,
    })

    // Notify admin
    try {
      const stars = "★".repeat(parsedRating) + "☆".repeat(5 - parsedRating)
      await sendEmail({
        to: "create.pk.123@gmail.com",
        subject: `[New Feedback] ${stars} (${parsedRating}/5) from ${finalName} [${finalUserType.toUpperCase()}]`,
        text: `NEW PLATFORM FEEDBACK RECEIVED\n\nRating: ${parsedRating}/5 (${stars})\nUser: ${finalName} (${userEmail || "No email"})\nRole: ${newFeedback.role}\nCategory: ${newFeedback.category}\nLocation/Company: ${newFeedback.companyOrLocation}\n\nComment:\n${newFeedback.comment}\n\nTime: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #F4F1E9; color: #1B3A5C;">
            <div style="max-width: 520px; margin: auto; background: #ffffff; border: 3px solid #1B3A5C; border-radius: 8px; padding: 24px; box-shadow: 4px 4px 0 #1B3A5C;">
              <div style="font-size: 11px; font-weight: 800; color: #E3474F; text-transform: uppercase; font-family: monospace;">
                ★ New Review & Rating Received
              </div>
              <h2 style="color: #1B3A5C; margin: 6px 0 14px 0;">${stars} (${parsedRating} of 5 Stars)</h2>
              
              <div style="background: #F8F6F0; border-left: 4px solid #1B3A5C; padding: 12px 16px; margin: 12px 0; font-size: 13px;">
                <strong>Sender:</strong> ${finalName} (${userEmail || "Session ID: " + userId})<br>
                <strong>User Type:</strong> <span style="background: #1B3A5C; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-family: monospace;">${finalUserType.toUpperCase()}</span><br>
                <strong>Category:</strong> ${newFeedback.category}<br>
                <strong>Location/Company:</strong> ${newFeedback.companyOrLocation}
              </div>

              <div style="margin: 16px 0;">
                <div style="font-size: 12px; font-weight: bold; color: #5B6472; text-transform: uppercase; font-family: monospace;">Feedback Review:</div>
                <div style="background: #ffffff; border: 1px solid #EDE7DA; padding: 14px; font-size: 14px; line-height: 1.6; color: #1B3A5C; margin-top: 4px; border-radius: 4px;">
                  "${newFeedback.comment}"
                </div>
              </div>

              <p style="font-size: 11px; color: #8C98A4; margin-top: 18px; font-family: monospace;">
                Saved to DataCo-op Feedback Feed &bull; Recorded on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
              </p>
            </div>
          </div>
        `,
        replyTo: userEmail,
      })
    } catch (mailError) {
      console.warn("[FEEDBACK_EMAIL_NOTICE]", mailError)
    }

    const stats = await getFeedbackStats(finalUserType)

    return NextResponse.json(
      { success: true, feedback: newFeedback, stats, message: "Thank you for sharing your feedback!" },
      { status: 201 }
    )
  } catch (err) {
    console.error("[FEEDBACK_POST_ERROR]", err)
    return NextResponse.json(
      { error: "Failed to process feedback submission." },
      { status: 500 }
    )
  }
}


import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAllFeedbacks, addFeedback, getFeedbackStats } from "@/lib/feedbackStore"

export async function GET() {
  const feedbacks = getAllFeedbacks()
  const stats = getFeedbackStats()
  return NextResponse.json({ feedbacks, stats })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in as a user or brand to share feedback." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, role, companyOrLocation, rating, comment, userType } = body

    if (!name || !comment || !rating) {
      return NextResponse.json(
        { error: "Name, rating, and feedback comment are required." },
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

    const sessionRole = session.user.role
    const finalUserType = sessionRole === "BRAND" ? "brand" : (userType === "brand" ? "brand" : "customer")
    const finalName = name || session.user.name || "Verified Member"

    const newFeedback = addFeedback({
      name: finalName,
      role: role || (finalUserType === "brand" ? "Brand Partner" : "Verified Customer"),
      companyOrLocation: companyOrLocation || (finalUserType === "brand" ? "Brand Partner" : "India"),
      rating: parsedRating,
      comment,
      userType: finalUserType,
    })

    const stats = getFeedbackStats()

    return NextResponse.json(
      { success: true, feedback: newFeedback, stats },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process feedback submission." },
      { status: 500 }
    )
  }
}

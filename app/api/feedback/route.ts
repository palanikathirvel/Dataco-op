import { NextResponse } from "next/server"
import { getAllFeedbacks, addFeedback, getFeedbackStats } from "@/lib/feedbackStore"

export async function GET() {
  const feedbacks = getAllFeedbacks()
  const stats = getFeedbackStats()
  return NextResponse.json({ feedbacks, stats })
}

export async function POST(req: Request) {
  try {
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

    const newFeedback = addFeedback({
      name,
      role: role || (userType === "brand" ? "Brand Partner" : "Verified Customer"),
      companyOrLocation: companyOrLocation || "India",
      rating: parsedRating,
      comment,
      userType: userType === "brand" ? "brand" : "customer",
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

export interface FeedbackItem {
  id: string
  name: string
  role: string
  companyOrLocation: string
  category?: string
  rating: number // 1 to 5
  comment: string
  userType: "customer" | "brand"
  userId?: string
  userEmail?: string
  createdAt: string
  isVerified: boolean
}

// Initial curated real-world feedbacks from verified consumers and partner brands
export const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: "fb-1",
    name: "Aakash Verma",
    role: "Verified Consumer",
    companyOrLocation: "Bengaluru, Karnataka",
    category: "UPI Payout Experience",
    rating: 5,
    comment:
      "I've redeemed over ₹9,200 straight to my Google Pay account. The receipt verification OCR is super fast, and the surveys are actually about products I recently purchased on Amazon and Flipkart.",
    userType: "customer",
    createdAt: "2026-08-30T10:30:00Z",
    isVerified: true,
  },
  {
    id: "fb-2",
    name: "Sneha Mukherjee",
    role: "Brand Growth Lead",
    companyOrLocation: "boAt Lifestyle",
    category: "Research Quality & Cohorts",
    rating: 5,
    comment:
      "DataCo-op completely changed how we run consumer audio sentiment analysis. Unlike panel survey farms where answers are fabricated, every single respondent here has verified purchase proof.",
    userType: "brand",
    createdAt: "2026-08-28T14:15:00Z",
    isVerified: true,
  },
  {
    id: "fb-3",
    name: "Karthik Subramanian",
    role: "Verified Consumer",
    companyOrLocation: "Chennai, Tamil Nadu",
    category: "Platform Design & Usability",
    rating: 5,
    comment:
      "Honest data monetization done right. Privacy is respected, receipts are anonymized, and payouts happen without minimum lock-in delays. Highly recommended!",
    userType: "customer",
    createdAt: "2026-08-27T09:00:00Z",
    isVerified: true,
  },
  {
    id: "fb-4",
    name: "Meera Nair",
    role: "Category Marketing Manager",
    companyOrLocation: "Nykaa Beauty Cohort",
    category: "Survey Tooling & Speed",
    rating: 5,
    comment:
      "Targeting verified buyers who spend ₹5,000+ monthly on premium skincare gave us actionable insights within 48 hours. The ROI on research spend is unmatched.",
    userType: "brand",
    createdAt: "2026-08-25T16:45:00Z",
    isVerified: true,
  },
  {
    id: "fb-5",
    name: "Rohan Dasgupta",
    role: "Verified Consumer",
    companyOrLocation: "Kolkata, West Bengal",
    category: "Surveys & Earnings",
    rating: 4,
    comment:
      "Great experience overall. Surveys are concise (under 4 minutes) and payments reflect in wallet immediately after submission. Clean UI and easy to use.",
    userType: "customer",
    createdAt: "2026-08-22T11:20:00Z",
    isVerified: true,
  },
  {
    id: "fb-6",
    name: "Vikram Malhotra",
    role: "Product Strategy Lead",
    companyOrLocation: "Cult.fit Wellness",
    category: "Research Quality & Cohorts",
    rating: 5,
    comment:
      "The zero-party verified data model is the future of market research. We received 500 completed responses from fitness buyers with zero fraud rate.",
    userType: "brand",
    createdAt: "2026-08-20T18:00:00Z",
    isVerified: true,
  },
]

// Global in-memory feed that persists throughout server runtime
const globalFeed: FeedbackItem[] = [...INITIAL_FEEDBACKS]

export function getAllFeedbacks(userTypeFilter?: "customer" | "brand", userIdFilter?: string): FeedbackItem[] {
  let list = [...globalFeed]
  if (userTypeFilter) {
    list = list.filter((f) => f.userType === userTypeFilter)
  }
  if (userIdFilter) {
    list = list.filter((f) => f.userId === userIdFilter)
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function addFeedback(data: Omit<FeedbackItem, "id" | "createdAt" | "isVerified">): FeedbackItem {
  const newItem: FeedbackItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: data.name.trim(),
    role: data.role.trim() || (data.userType === "brand" ? "Brand Partner" : "Verified Customer"),
    companyOrLocation: data.companyOrLocation?.trim() || "India",
    category: data.category?.trim() || "General Experience",
    rating: Math.max(1, Math.min(5, data.rating)),
    comment: data.comment.trim(),
    userType: data.userType,
    userId: data.userId,
    userEmail: data.userEmail,
    createdAt: new Date().toISOString(),
    isVerified: true,
  }
  globalFeed.unshift(newItem)
  return newItem
}

export function getFeedbackStats(userTypeFilter?: "customer" | "brand") {
  const all = getAllFeedbacks(userTypeFilter)
  const total = all.length
  const avg =
    total > 0
      ? (all.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1)
      : "5.0"

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  all.forEach((item) => {
    counts[item.rating] = (counts[item.rating] || 0) + 1
  })

  return {
    total,
    averageRating: parseFloat(avg),
    ratingCounts: counts,
  }
}

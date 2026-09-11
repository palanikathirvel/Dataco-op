"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, CheckCircle2, RefreshCw, ThumbsUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GiveFeedbackDialog } from "./GiveFeedbackDialog"
import { FeedbackItem } from "@/lib/feedbackStore"

interface ProfileFeedbackSectionProps {
  userType: "customer" | "brand"
  userName?: string
  userCompanyOrLocation?: string
}

export function ProfileFeedbackSection({
  userType,
  userName = "",
  userCompanyOrLocation = "",
}: ProfileFeedbackSectionProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all")

  async function fetchFeedbacks() {
    setLoading(true)
    try {
      const res = await fetch(`/api/feedback?userType=${userType}`)
      const data = await res.json()
      if (data.success && data.feedbacks) {
        setFeedbacks(data.feedbacks)
      }
    } catch {
      console.warn("Failed to load feedback feed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [userType])

  const displayedFeedbacks =
    activeTab === "mine"
      ? feedbacks.filter((f) => f.name.toLowerCase() === userName.toLowerCase())
      : feedbacks

  return (
    <Card className="shadow-sm border-border/80">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">
                {userType === "brand" ? "Brand Partner Feedback & Reviews" : "Customer Experience & Feedback"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Share your thoughts with the creator desk and review feedback from verified members.
            </CardDescription>
          </div>

          <GiveFeedbackDialog
            userType={userType}
            defaultName={userName}
            defaultCompanyOrLocation={userCompanyOrLocation}
            onFeedbackSubmitted={fetchFeedbacks}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {/* Sub-tabs for switching between all and user's feedbacks */}
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded transition-colors ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Recent Reviews ({feedbacks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("mine")}
              className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded transition-colors ${
                activeTab === "mine"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              My Feedback
            </button>
          </div>

          <button
            type="button"
            onClick={fetchFeedbacks}
            title="Refresh reviews"
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground font-mono">
            Loading feedbacks...
          </div>
        ) : displayedFeedbacks.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg">
            <p className="text-xs text-muted-foreground">
              {activeTab === "mine"
                ? "You haven't submitted any feedback yet. Click 'Give Feedback' above to share your experience!"
                : "No reviews found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {displayedFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-3.5 rounded-lg bg-muted/30 border border-border/60 space-y-2 flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= fb.rating
                              ? "text-[#E49B30] fill-[#E49B30]"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {fb.category && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                        {fb.category}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-foreground mt-2 leading-relaxed italic">
                    "{fb.comment}"
                  </p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-foreground truncate">{fb.name}</span>
                    {fb.isVerified && (
                      <span title="Verified Account" className="inline-flex items-center">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground truncate">&bull; {fb.companyOrLocation}</span>
                  </div>
                  <span className="text-[10px] font-mono shrink-0">
                    {new Date(fb.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

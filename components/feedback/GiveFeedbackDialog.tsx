"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Star, MessageSquare, Loader2, CheckCircle2, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GiveFeedbackDialogProps {
  userType: "customer" | "brand"
  defaultName?: string
  defaultCompanyOrLocation?: string
  onFeedbackSubmitted?: () => void
  triggerButton?: React.ReactNode
}

export function GiveFeedbackDialog({
  userType,
  defaultName = "",
  defaultCompanyOrLocation = "",
  onFeedbackSubmitted,
  triggerButton,
}: GiveFeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState(
    userType === "brand" ? "Research Quality & Cohorts" : "Surveys & Earnings"
  )
  const [name, setName] = useState(defaultName)
  const [companyOrLocation, setCompanyOrLocation] = useState(defaultCompanyOrLocation)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const customerCategories = [
    "Surveys & Earnings",
    "Receipt Verification Speed",
    "UPI Payout Experience",
    "Platform Design & Usability",
    "Customer Support",
    "General Suggestion",
  ]

  const brandCategories = [
    "Research Quality & Cohorts",
    "Survey Tooling & Speed",
    "Billing & Wallet Funding",
    "Analytics & Export Tools",
    "Customer Support",
    "General Feedback",
  ]

  const categories = userType === "brand" ? brandCategories : customerCategories

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) {
      toast.error("Please write a short review or comment.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || defaultName,
          companyOrLocation: companyOrLocation.trim() || defaultCompanyOrLocation,
          category,
          rating,
          comment: comment.trim(),
          userType,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to submit feedback.")
        setLoading(false)
        return
      }

      toast.success("Thank you! Your feedback has been recorded.")
      setComment("")
      setOpen(false)
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted()
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            size="sm"
            className="gap-2 font-bold bg-[#E3474F] hover:bg-[#c9363e] text-white border border-[#1B3A5C] shadow-xs"
          >
            <Star className="h-4 w-4 fill-current" /> Give Feedback
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-2 border-[#1B3A5C]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center mb-1">
            <Award className="h-6 w-6 text-[#E3474F]" />
          </div>
          <DialogTitle className="text-center text-lg sm:text-xl font-bold text-[#1B3A5C]">
            {userType === "brand" ? "Brand Partner Review" : "Share Your Consumer Experience"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Your feedback directly shapes DataCo-op feature roadmaps and helps maintain fair-data standards.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Star Rating Picker */}
          <div className="text-center space-y-1.5 p-3 bg-muted/40 rounded-lg border border-border/50">
            <Label className="text-xs font-bold text-[#1B3A5C] uppercase tracking-wider font-mono">
              Your Overall Rating
            </Label>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      (hoverRating || rating) >= star
                        ? "text-[#E49B30] fill-[#E49B30]"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] font-mono font-semibold text-[#1B3A5C]">
              {rating === 5
                ? "⭐⭐⭐⭐⭐ Outstanding Experience"
                : rating === 4
                ? "⭐⭐⭐⭐ Great & Reliable"
                : rating === 3
                ? "⭐⭐⭐ Good, with room to improve"
                : rating === 2
                ? "⭐⭐ Needs Improvement"
                : "⭐ Disappointed"}
            </p>
          </div>

          {/* Feedback Category */}
          <div className="space-y-1.5">
            <Label htmlFor="fb-cat" className="text-xs font-semibold">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="fb-cat" className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name & Location (Optional edit) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="fb-name" className="text-[11px] text-muted-foreground">
                Display Name
              </Label>
              <Input
                id="fb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fb-loc" className="text-[11px] text-muted-foreground">
                {userType === "brand" ? "Company / Brand" : "City / Location"}
              </Label>
              <Input
                id="fb-loc"
                value={companyOrLocation}
                onChange={(e) => setCompanyOrLocation(e.target.value)}
                placeholder={userType === "brand" ? "e.g. Acme Corp" : "e.g. Mumbai, MH"}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <Label htmlFor="fb-comment" className="text-xs font-semibold">
              Your Review / Suggestions *
            </Label>
            <Textarea
              id="fb-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                userType === "brand"
                  ? "Tell us how the respondent data quality and research velocity worked for your campaign..."
                  : "Tell us about your experience with receipt verification, survey rewards, and UPI payouts..."
              }
              className="text-xs resize-none"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !comment.trim()}
              className="bg-[#1B3A5C] hover:bg-[#142C46] text-white font-bold gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                "Publish Feedback"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

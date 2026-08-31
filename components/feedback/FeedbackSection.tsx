"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Star,
  MessageSquarePlus,
  CheckCircle2,
  Users,
  Building2,
  ShieldCheck,
  Send,
  X,
  Lock,
  ArrowRight,
  Quote,
  LogIn,
} from "lucide-react"
import { INITIAL_FEEDBACKS, FeedbackItem } from "@/lib/feedbackStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function FeedbackSection() {
  const { data: session, status } = useSession()
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACKS)
  const [filter, setFilter] = useState<"all" | "customer" | "brand">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [authRequiredOpen, setAuthRequiredOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formName, setFormName] = useState("")
  const [formUserType, setFormUserType] = useState<"customer" | "brand">("customer")
  const [formCompanyOrLocation, setFormCompanyOrLocation] = useState("")
  const [formRating, setFormRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [formComment, setFormComment] = useState("")

  // Populate from active session if logged in
  useEffect(() => {
    if (session?.user) {
      setFormName(session.user.name ?? "")
      if (session.user.role === "BRAND") {
        setFormUserType("brand")
      }
    }
  }, [session])

  // Fetch latest live feedback on mount
  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const res = await fetch("/api/feedback")
        if (res.ok) {
          const data = await res.json()
          if (data.feedbacks && Array.isArray(data.feedbacks)) {
            setFeedbacks(data.feedbacks)
          }
        }
      } catch (err) {
        // Fallback to initial
      }
    }
    loadFeedbacks()
  }, [])

  function handleOpenFeedbackModal() {
    if (!session) {
      setAuthRequiredOpen(true)
      return
    }
    setModalOpen(true)
  }

  // Calculate stats
  const totalReviews = feedbacks.length
  const avgRating =
    totalReviews > 0
      ? (feedbacks.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
      : "5.0"

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (filter === "all") return true
    return item.userType === filter
  })

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!session) {
      setModalOpen(false)
      setAuthRequiredOpen(true)
      return
    }

    if (!formName.trim() || !formComment.trim()) {
      toast.error("Please enter your name and review comment.")
      return
    }

    setSubmitting(true)

    const isBrand = session.user.role === "BRAND" || formUserType === "brand"
    const payload = {
      name: formName.trim() || session.user.name || "Verified Member",
      role: isBrand ? "Brand Partner" : "Verified Consumer",
      companyOrLocation: formCompanyOrLocation.trim() || (isBrand ? "Brand Partner" : "India"),
      rating: formRating,
      comment: formComment.trim(),
      userType: isBrand ? "brand" : "customer",
    }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.feedback) {
          setFeedbacks((prev) => [data.feedback, ...prev])
        }
        toast.success("Thank you! Your verified feedback has been published in real-time.")
        setModalOpen(false)
        setFormComment("")
        setFormRating(5)
      } else if (res.status === 401) {
        toast.error("Authentication required. Please sign in to submit feedback.")
        setModalOpen(false)
        setAuthRequiredOpen(true)
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "Failed to submit feedback.")
      }
    } catch (err) {
      toast.error("Failed to transmit feedback. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="feedback" className="section-parchment py-16 md:py-24 border-t-2 border-dashed border-[#E3474F]/60">
      <div className="container-vintage">

        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="badge-bubble font-mono text-xs uppercase tracking-wider text-[#E3474F] bg-[#1B3A5C]/5 border border-[#E3474F]/40 px-3 py-1 font-bold">
            Real-Time Community Voice
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1B3A5C] mt-4 font-display">
            <span className="heading-center-underline">What Customers & Brands Are Saying</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6472] max-w-xl mx-auto mt-4 leading-relaxed font-mono">
            Direct, authenticated reviews from verified consumer data earners and research enterprise partners.
          </p>
        </div>

        {/* Real-time Rating Summary Banner (Vintage Card) */}
        <div className="card-plaque p-6 sm:p-8 bg-white border-4 border-[#1B3A5C] shadow-[8px_8px_0_0_rgba(27,58,92,0.16)] mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">

            {/* Overall Rating Score */}
            <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-dashed border-[#1B3A5C]/20 pb-6 md:pb-0 md:pr-6">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <span className="font-display text-5xl sm:text-6xl font-bold text-[#1B3A5C] leading-none">
                  {avgRating}
                </span>
                <div>
                  <div className="flex gap-1 text-[#E49B30]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.round(Number(avgRating))
                            ? "fill-[#E49B30] text-[#E49B30]"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs font-mono text-[#5B6472] mt-1">
                    Based on <strong>{totalReviews}</strong> verified ratings
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-[11px] font-mono text-[#1B3A5C] font-semibold">
                <ShieldCheck size={15} className="text-[#E3474F]" />
                <span>100% Verified Community Feedback</span>
              </div>
            </div>

            {/* Quick Metrics & Filter Tabs */}
            <div className="md:col-span-5 flex flex-col justify-center space-y-3">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-all border-2 ${
                    filter === "all"
                      ? "bg-[#1B3A5C] text-[#F4F1E9] border-[#1B3A5C] shadow-[2px_2px_0_0_#E3474F]"
                      : "bg-[#F4F1E9] text-[#1B3A5C] border-[#1B3A5C]/30 hover:border-[#1B3A5C]"
                  }`}
                >
                  All ({feedbacks.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("customer")}
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-all border-2 flex items-center gap-1.5 ${
                    filter === "customer"
                      ? "bg-[#1B3A5C] text-[#F4F1E9] border-[#1B3A5C] shadow-[2px_2px_0_0_#E3474F]"
                      : "bg-[#F4F1E9] text-[#1B3A5C] border-[#1B3A5C]/30 hover:border-[#1B3A5C]"
                  }`}
                >
                  <Users size={13} /> Customers ({feedbacks.filter((f) => f.userType === "customer").length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("brand")}
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-all border-2 flex items-center gap-1.5 ${
                    filter === "brand"
                      ? "bg-[#1B3A5C] text-[#F4F1E9] border-[#1B3A5C] shadow-[2px_2px_0_0_#E3474F]"
                      : "bg-[#F4F1E9] text-[#1B3A5C] border-[#1B3A5C]/30 hover:border-[#1B3A5C]"
                  }`}
                >
                  <Building2 size={13} /> Brands ({feedbacks.filter((f) => f.userType === "brand").length})
                </button>
              </div>

              <p className="text-[11px] text-[#5B6472] font-mono text-center md:text-left">
                Every rating is authenticated against signed-in platform accounts.
              </p>
            </div>

            {/* Action CTA Button */}
            <div className="md:col-span-3 flex justify-center md:justify-end">
              <button
                type="button"
                onClick={handleOpenFeedbackModal}
                className="btn-primary w-full sm:w-auto py-3.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0_0_#1B3A5C] bg-[#E3474F] text-white hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              >
                <MessageSquarePlus size={16} /> Share Your Feedback
              </button>
            </div>

          </div>
        </div>

        {/* Real-time Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedbacks.map((item) => {
            const isBrand = item.userType === "brand"
            return (
              <div
                key={item.id}
                className="card-plaque p-6 bg-white border-3 border-[#1B3A5C] relative shadow-[5px_5px_0_0_rgba(27,58,92,0.12)] flex flex-col justify-between hover:shadow-[7px_7px_0_0_rgba(27,58,92,0.2)] transition-shadow"
              >
                {/* Header: User Type Badge & Star Rating */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3 pb-2.5 border-b border-dashed border-[#1B3A5C]/15">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 border ${
                        isBrand
                          ? "bg-[#1B3A5C] text-[#F4F1E9] border-[#1B3A5C]"
                          : "bg-[#E3474F]/10 text-[#E3474F] border-[#E3474F]/30"
                      }`}
                    >
                      {isBrand ? "Brand Partner" : "Verified Customer"}
                    </span>

                    {/* Star Rating */}
                    <div className="flex gap-0.5 text-[#E49B30]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < item.rating
                              ? "fill-[#E49B30] text-[#E49B30]"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="relative mb-5">
                    <Quote className="h-5 w-5 text-[#E3474F]/20 absolute -top-1 -left-1 pointer-events-none" />
                    <p className="text-xs sm:text-sm text-[#1B3A5C] leading-relaxed relative pl-4 italic">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Reviewer Details Footer */}
                <div className="pt-3 border-t border-dashed border-[#1B3A5C]/15 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-display font-bold text-[#1B3A5C] text-sm uppercase tracking-wide">
                      {item.name}
                    </div>
                    <div className="text-[11px] font-mono text-[#5B6472]">
                      {item.companyOrLocation}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-green-700 font-semibold shrink-0">
                    <CheckCircle2 size={13} />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* ══════════════════════════════════════════════════
          SIGN-IN REQUIRED MODAL (Auth Gate Before Action)
      ══════════════════════════════════════════════════ */}
      {authRequiredOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-[#EDE7DA] border-4 sm:border-6 border-[#1B3A5C] shadow-[12px_12px_0_0_rgba(27,58,92,0.3)] max-w-md w-full p-6 sm:p-8 relative text-center"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M24 0H0v24' fill='none' stroke='%231B3A5C' stroke-opacity='0.06'/%3E%3C/svg%3E\")",
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setAuthRequiredOpen(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-[#1B3A5C] bg-[#1B3A5C] text-[#F4F1E9] hover:bg-[#E3474F] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Lock Icon Emblem */}
            <div className="w-14 h-14 bg-[#1B3A5C] text-[#F4F1E9] border-2 border-[#E3474F] flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0_0_#E3474F]">
              <Lock size={26} className="text-[#EF6A6E]" />
            </div>

            <span className="font-mono text-xs uppercase tracking-widest text-[#E3474F] font-bold">
              Sign In Required
            </span>
            <h3 className="font-display text-2xl font-bold uppercase text-[#1B3A5C] mt-1 mb-3">
              Authentication Gate
            </h3>

            <div className="w-16 border-t-2 border-dashed border-[#E3474F] mx-auto mb-4" />

            <p className="text-xs sm:text-sm text-[#5B6472] font-mono leading-relaxed mb-6">
              To keep our community ratings 100% verified and free of bots, all feedback submissions require you to sign in to an active DataCo-op account.
            </p>

            {/* Auth Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/login?callbackUrl=/#feedback"
                className="btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[2px_2px_0_0_#1B3A5C] bg-[#E3474F] text-white"
              >
                <LogIn size={15} /> Sign In as Consumer
              </Link>

              <Link
                href="/brand/login?callbackUrl=/#feedback"
                className="btn-ghost w-full py-3 text-xs font-bold uppercase tracking-widest border-2 border-[#1B3A5C] text-[#1B3A5C] bg-white flex items-center justify-center gap-2 hover:bg-[#1B3A5C] hover:text-white transition-colors"
              >
                <Building2 size={15} /> Sign In as Brand Partner
              </Link>

              <div className="pt-2 border-t border-dashed border-[#1B3A5C]/20">
                <Link
                  href="/register"
                  className="text-xs font-mono font-bold text-[#1B3A5C] hover:text-[#E3474F] underline flex items-center justify-center gap-1"
                >
                  Don&apos;t have an account? Create Free Account <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          FEEDBACK SUBMISSION MODAL (For Authenticated Users)
      ══════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-[#EDE7DA] border-4 sm:border-6 border-[#1B3A5C] shadow-[12px_12px_0_0_rgba(27,58,92,0.3)] max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M24 0H0v24' fill='none' stroke='%231B3A5C' stroke-opacity='0.06'/%3E%3C/svg%3E\")",
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-[#1B3A5C] bg-[#1B3A5C] text-[#F4F1E9] hover:bg-[#E3474F] transition-colors"
              aria-label="Close Modal"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="mb-6 pb-3 border-b-2 border-dashed border-[#E3474F]/50">
              <span className="font-mono text-xs uppercase tracking-widest text-[#E3474F] font-bold">
                Authenticated Feedback
              </span>
              <h3 className="font-display text-2xl font-bold uppercase text-[#1B3A5C] mt-0.5">
                Share Your Experience
              </h3>
              <p className="text-xs text-[#5B6472] font-mono mt-1">
                Posting as: <strong>{session?.user?.email}</strong> ({session?.user?.role === "BRAND" ? "Brand" : "Consumer"})
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5 p-3.5 bg-white border-2 border-[#1B3A5C]">
                <Label className="font-mono text-xs uppercase font-bold text-[#1B3A5C] block mb-1">
                  Overall Platform Rating * ({hoverRating ?? formRating} Stars)
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating ?? formRating)
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-[#E49B30] hover:scale-125 transition-transform"
                      >
                        <Star
                          size={26}
                          className={active ? "fill-[#E49B30] text-[#E49B30]" : "text-gray-300"}
                        />
                      </button>
                    )
                  })}
                  <span className="text-xs font-mono font-bold text-[#1B3A5C] ml-2">
                    {formRating === 5
                      ? "★★★★★ Exceptional"
                      : formRating === 4
                      ? "★★★★☆ Great"
                      : formRating === 3
                      ? "★★★☆☆ Good"
                      : "★★☆☆☆ Fair"}
                  </span>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <Label htmlFor="fb-name" className="font-mono text-xs uppercase font-bold text-[#1B3A5C]">
                  Your Display Name *
                </Label>
                <Input
                  id="fb-name"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="rounded-none border-2 border-[#1B3A5C] bg-white h-11 text-xs sm:text-sm"
                />
              </div>

              {/* Location or Company */}
              <div className="space-y-1">
                <Label htmlFor="fb-company" className="font-mono text-xs uppercase font-bold text-[#1B3A5C]">
                  {session?.user?.role === "BRAND" ? "Company / Brand Name *" : "City & State (Location)"}
                </Label>
                <Input
                  id="fb-company"
                  placeholder={session?.user?.role === "BRAND" ? "e.g. Tata Consumer Products" : "e.g. Hyderabad, Telangana"}
                  value={formCompanyOrLocation}
                  onChange={(e) => setFormCompanyOrLocation(e.target.value)}
                  className="rounded-none border-2 border-[#1B3A5C] bg-white h-11 text-xs sm:text-sm"
                />
              </div>

              {/* Feedback Comment */}
              <div className="space-y-1">
                <Label htmlFor="fb-comment" className="font-mono text-xs uppercase font-bold text-[#1B3A5C]">
                  Your Feedback / Review *
                </Label>
                <Textarea
                  id="fb-comment"
                  required
                  rows={4}
                  placeholder="Tell us about your experience with DataCo-op, survey rewards, or brand research cohorts..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="rounded-none border-2 border-[#1B3A5C] bg-white text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-[#E3474F] text-white border-2 border-[#1B3A5C] shadow-[3px_3px_0_0_#1B3A5C] active:translate-y-0.5 transition-transform"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin mr-1">⚙</span> Publishing Review...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Publish Verified Feedback
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default FeedbackSection

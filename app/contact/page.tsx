"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  Mail,
  Phone,
  User,
  Send,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Award,
  Globe,
  Menu,
  X,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "general",
    message: "",
  })

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(`Copied ${text} to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to dispatch message. Please try again.")
        setSubmitting(false)
        return
      }

      toast.success("Message dispatched to create.pk.123@gmail.com! Palani Kathirvel / P.K Creative Agency will respond promptly.")
      setForm({
        name: "",
        email: "",
        phone: "",
        topic: "general",
        message: "",
      })
    } catch {
      toast.error("Network error. Please try again or email create.pk.123@gmail.com directly.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-200 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          NAVIGATION — Sticky vintage cream bar with mobile menu
      ══════════════════════════════════════════════════ */}
      <header className="header-vintage sticky top-0 z-50 bg-[#EDE7DA]/95 backdrop-blur-md border-b-2 md:border-b-[3px] border-[#1B3A5C]">
        <div className="container-vintage h-20 md:h-[88px] flex items-center justify-between">
          {/* Animated DataCo-op Logo */}
          <Logo href="/" animated size="md" subtitle="Est. 2024" textVariant="dark" />

          {/* Navigation links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-0">
            {[
              { label: "Home", href: "/" },
              { label: "How it Works", href: "/#how-it-works" },
              { label: "For Users", href: "/#for-users" },
              { label: "For Brands", href: "/#for-brands" },
              { label: "Contact Us", href: "/contact", active: true },
            ].map((item, i) => (
              <span key={item.href} className="flex items-center">
                {i > 0 && <span className="nav-divider mx-4 xl:mx-5" />}
                <Link
                  href={item.href}
                  className={`text-xs xl:text-sm font-bold tracking-wider uppercase transition-colors ${
                    item.active ? "text-[#E3474F] font-black" : "text-[#1B3A5C] hover:text-[#E3474F]"
                  }`}
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>

          {/* Actions (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="btn-ghost px-4 py-2 text-xs uppercase tracking-wider font-bold text-[#1B3A5C] hover:text-[#E3474F]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0_0_#1B3A5C]"
            >
              Begin Journey <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-[#1B3A5C] bg-[#1B3A5C] text-[#F4F1E9]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-dashed border-[#E3474F]/40 bg-[#EDE7DA] px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "How it Works", href: "/#how-it-works" },
                { label: "For Users", href: "/#for-users" },
                { label: "For Brands", href: "/#for-brands" },
                { label: "Contact Us", href: "/contact" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-mono text-sm uppercase tracking-wider font-bold text-[#1B3A5C] py-2 border-b border-[#1B3A5C]/10 flex items-center justify-between"
                >
                  {item.label}
                  <ArrowRight size={14} className="text-[#E3474F]" />
                </Link>
              ))}
            </nav>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full py-3 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[2px_2px_0_0_#1B3A5C]"
              >
                Begin Journey <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════
          HERO BANNER — Deep vintage navy with ticket stamp
      ══════════════════════════════════════════════════ */}
      <section className="section-espresso py-14 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-[#E3474F]/70" />

        <div className="container-vintage">
          <div className="max-w-3xl">
            <span className="badge-bubble inline-flex items-center gap-1.5 mb-5 text-xs font-mono tracking-wider font-bold text-[#EF6A6E] bg-[#142C46] border border-[#E3474F]/50 px-3 py-1.5">
              <ShieldCheck size={13} /> Official Communications & Creator Dispatch
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[#F4F1E9] my-5 font-display">
              Get In Touch With <span className="text-[#EF6A6E]">DataCo-op</span> &{" "}
              <span className="text-[#E49B30]">P.K Creative Agency</span>
            </h1>

            <div className="w-28 md:w-36 border-t-2 border-dashed border-[#E3474F] mb-5" />

            <p className="text-sm sm:text-base leading-relaxed text-[#F4F1E9]/75">
              Whether you are a verified consumer looking for earnings assistance, a brand seeking custom
              research cohorts, or interested in collaborating with the original platform creators, our team is ready to connect.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-[#E3474F]/70" />
      </section>

      {/* Barber pole stripe transition strip */}
      <div
        className="h-2.5"
        style={{
          background:
            "repeating-linear-gradient(90deg, #E3474F 0 12px, #FFFFFF 12px 24px, #1B3A5C 24px 36px, #FFFFFF 36px 48px)",
        }}
      />

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT — 2-Column Responsive Grid
      ══════════════════════════════════════════════════ */}
      <section className="section-parchment py-12 md:py-20 lg:py-24">
        <div className="container-vintage">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* LEFT COLUMN (5 cols on lg) — Creator Spotlight & Contact Details */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">

              {/* 1. ORIGINAL CREATOR CARD — P.K Creative Agency Spotlight */}
              <div className="card-framed relative overflow-hidden p-6 sm:p-8 bg-white border-4 md:border-6 border-[#1B3A5C] shadow-[6px_6px_0_0_rgba(27,58,92,0.18)]">
                {/* Decorative header tag */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-dashed border-[#E3474F]/40 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-[#E3474F]" />
                    <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest font-bold text-[#1B3A5C]">
                      Platform Architecture
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#1B3A5C] text-[#F4F1E9] px-2 py-0.5 font-bold tracking-wider">
                    Original Creator
                  </span>
                </div>

                {/* Agency Eagle/Falcon Emblem Logo with subtle hover animation */}
                <div className="flex flex-col items-center text-center mb-5">
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 my-2 p-2 bg-white rounded-xl border-2 border-[#1B3A5C]/15 shadow-md transition-transform duration-300 hover:scale-105">
                    <Image
                      src="/pk-agency-logo.png"
                      alt="P.K Creative Agency Official Logo"
                      fill
                      className="object-contain p-1 filter drop-shadow-[0_4px_12px_rgba(27,58,92,0.18)]"
                      priority
                    />
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-[#1B3A5C] tracking-wide mt-2">
                    P.K Creative Agency
                  </h3>
                  <p className="font-mono text-[11px] sm:text-xs text-[#E3474F] tracking-widest uppercase font-semibold mt-0.5">
                    Design · Architecture · Engineering
                  </p>
                </div>

                {/* Creator Contact Items */}
                <div className="space-y-3.5 pt-2 border-t-2 border-dashed border-[#1B3A5C]/15">
                  {/* Lead Creator Name */}
                  <div className="flex items-start gap-3 p-3 bg-[#F4F1E9] border border-[#1B3A5C]/10">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#1B3A5C] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#5B6472]">
                        Founder & Lead Architect
                      </div>
                      <div className="font-bold text-[#1B3A5C] text-sm sm:text-base">
                        Palani Kathirvel
                      </div>
                    </div>
                  </div>

                  {/* Creator Personal Email */}
                  <div className="flex items-center justify-between p-3 bg-[#F4F1E9] border border-[#1B3A5C]/10">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#E3474F] shrink-0" />
                      <div className="truncate">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-[#5B6472]">
                          Creator Email
                        </div>
                        <a
                          href="mailto:create.pk.123@gmail.com"
                          className="font-bold text-[#1B3A5C] text-xs sm:text-sm hover:underline truncate block"
                        >
                          create.pk.123@gmail.com
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("create.pk.123@gmail.com", "creator-email")}
                      className="p-1.5 hover:bg-white text-[#1B3A5C] transition-colors shrink-0 ml-1"
                      title="Copy Email"
                    >
                      {copiedField === "creator-email" ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* Creator Phone */}
                  <div className="flex items-center justify-between p-3 bg-[#F4F1E9] border border-[#1B3A5C]/10">
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#1B3A5C] shrink-0" />
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-[#5B6472]">
                          Direct Phone / WhatsApp
                        </div>
                        <a
                          href="tel:9342785176"
                          className="font-bold text-[#1B3A5C] text-xs sm:text-sm hover:underline block"
                        >
                          +91 9342785176
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("9342785176", "phone")}
                      className="p-1.5 hover:bg-white text-[#1B3A5C] transition-colors shrink-0 ml-1"
                      title="Copy Phone"
                    >
                      {copiedField === "phone" ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. PRODUCT & PLATFORM DIRECT CHANNELS */}
              <div className="card-framed p-6 sm:p-7 bg-[#1B3A5C] text-[#F4F1E9] border-4 border-[#142C46]">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-[#E49B30]" />
                  <h4 className="font-display text-base sm:text-lg font-bold uppercase text-[#F4F1E9]">
                    DataCo-op Platform Support
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-[#142C46] border border-[#F4F1E9]/10">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#9BB4CC]">
                      Official Product Desk
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <a
                        href="mailto:create.pk.123@gmail.com"
                        className="font-bold text-[#E49B30] text-xs sm:text-sm hover:underline"
                      >
                        create.pk.123@gmail.com
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("create.pk.123@gmail.com", "product-email")}
                        className="p-1 hover:bg-[#1B3A5C] text-[#F4F1E9] transition-colors ml-1"
                        title="Copy Product Email"
                      >
                        {copiedField === "product-email" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[#F4F1E9]/80 pt-1 font-mono">
                    <Clock size={15} className="text-[#EF6A6E] shrink-0" />
                    <span>Response SLA: Under 4 business hours</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (7 cols on lg) — Interactive Dispatch Form */}
            <div className="lg:col-span-7">
              <div className="card-framed relative p-6 sm:p-8 md:p-10 bg-white border-4 md:border-6 border-[#1B3A5C] shadow-[8px_8px_0_0_rgba(27,58,92,0.18)]">
                {/* Form header */}
                <div className="mb-6 sm:mb-8 pb-4 border-b-2 border-dashed border-[#E3474F]/40">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#E3474F] font-bold">
                    Official Dispatch Form
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[#1B3A5C] mt-1">
                    Transmit Your Message
                  </h2>
                  <p className="text-xs text-[#5B6472] mt-1 font-mono">
                    Direct routing to Palani Kathirvel & the DataCo-op technical executive desk.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name" className="font-mono text-xs uppercase tracking-wider font-bold text-[#1B3A5C]">
                        Your Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6472]" />
                        <Input
                          id="contact-name"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="pl-9 h-11 sm:h-12 rounded-none border-2 border-[#1B3A5C] focus-visible:ring-[#E3474F] bg-[#FBF9F4] text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email" className="font-mono text-xs uppercase tracking-wider font-bold text-[#1B3A5C]">
                        Your Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6472]" />
                        <Input
                          id="contact-email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="you@company.com"
                          className="pl-9 h-11 sm:h-12 rounded-none border-2 border-[#1B3A5C] focus-visible:ring-[#E3474F] bg-[#FBF9F4] text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Inquiry Topic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-phone" className="font-mono text-xs uppercase tracking-wider font-bold text-[#1B3A5C]">
                        Phone Number (Optional)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B6472]" />
                        <Input
                          id="contact-phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          className="pl-9 h-11 sm:h-12 rounded-none border-2 border-[#1B3A5C] focus-visible:ring-[#E3474F] bg-[#FBF9F4] text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs uppercase tracking-wider font-bold text-[#1B3A5C]">
                        Inquiry Category *
                      </Label>
                      <Select
                        value={form.topic}
                        onValueChange={(val) => setForm({ ...form, topic: val })}
                      >
                        <SelectTrigger className="h-11 sm:h-12 rounded-none border-2 border-[#1B3A5C] bg-[#FBF9F4] focus:ring-[#E3474F] text-xs sm:text-sm">
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Platform Inquiry</SelectItem>
                          <SelectItem value="brand">Brand Research & Cohorts</SelectItem>
                          <SelectItem value="user">User Earnings & Verified Payouts</SelectItem>
                          <SelectItem value="agency">P.K Creative Agency Collaboration</SelectItem>
                          <SelectItem value="security">Security & Privacy Protocol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message" className="font-mono text-xs uppercase tracking-wider font-bold text-[#1B3A5C]">
                      Your Message or Specification *
                    </Label>
                    <Textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Detail your inquiry, project scope, or technical question..."
                      className="rounded-none border-2 border-[#1B3A5C] focus-visible:ring-[#E3474F] bg-[#FBF9F4] resize-none text-xs sm:text-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-transform active:translate-y-0.5 bg-[#E3474F] text-white border-2 border-[#1B3A5C] shadow-[3px_3px_0_0_#1B3A5C]"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin inline-block mr-2">⚙</span>
                        Transmitting Message...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Transmit Message to P.K Agency
                      </>
                    )}
                  </button>

                  <p className="text-center font-mono text-[10px] sm:text-[11px] text-[#5B6472] mt-2">
                    🔒 Transmissions encrypted under 256-bit AES protocol.
                  </p>
                </form>
              </div>

              {/* Quick FAQ Strip */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border-2 border-[#1B3A5C] border-dashed">
                  <div className="font-bold text-[#1B3A5C] text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#E3474F] shrink-0" />
                    <span>Consumer Verification SLA</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#5B6472] mt-1">
                    Receipt verification and survey payouts processed in &lt; 24h via UPI / Direct Bank Transfer.
                  </p>
                </div>

                <div className="p-4 bg-white border-2 border-[#1B3A5C] border-dashed">
                  <div className="font-bold text-[#1B3A5C] text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#E3474F] shrink-0" />
                    <span>Brand Research Access</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#5B6472] mt-1">
                    Custom query builders, zero-party survey cohorts, and demographic analytics on-demand.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Barber stripe */}
      <div
        className="h-2.5"
        style={{
          background:
            "repeating-linear-gradient(90deg, #E3474F 0 12px, #FFFFFF 12px 24px, #1B3A5C 24px 36px, #FFFFFF 36px 48px)",
        }}
      />

      {/* ══════════════════════════════════════════════════
          FOOTER — Responsive grid
      ══════════════════════════════════════════════════ */}
      <footer className="bg-[#0D1E31]">
        <div className="container-vintage py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b-2 border-dashed border-[#F4F1E9]/15">
            <div className="sm:col-span-2">
              <div className="mb-4">
                <Logo href="/" animated size="md" subtitle="Est. 2024" textVariant="light" />
              </div>
              <p className="text-xs text-[#F4F1E9]/50 leading-relaxed max-w-sm">
                A verified consumer data marketplace where purchase history becomes purchasing power.
                Built & crafted by P.K Creative Agency.
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  ["How It Works", "/#how-it-works"],
                  ["For Users", "/#for-users"],
                  ["For Brands", "/#for-brands"],
                  ["Register", "/register"],
                ],
              },
              {
                title: "Brands & Team",
                links: [
                  ["Brand Login", "/brand/login"],
                  ["Brand Register", "/brand/register"],
                  ["Admin Portal", "/admin/login"],
                  ["Contact Agency", "/contact"],
                ],
              },
              {
                title: "Agency & Direct",
                links: [
                  ["Palani Kathirvel", "mailto:create.pk.123@gmail.com"],
                  ["Call: 9342785176", "tel:9342785176"],
                  ["Platform Desk", "mailto:create.pk.123@gmail.com"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-xs font-mono uppercase tracking-widest text-[#F4F1E9] font-bold mb-4 pb-2 border-b-2 border-dashed border-[#E3474F]/55">
                  {col.title}
                </div>
                <div className="space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <div key={label}>
                      <Link
                        href={href}
                        className="text-xs text-[#F4F1E9]/55 hover:text-[#EF6A6E] transition-colors"
                      >
                        {label}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-3 text-center sm:text-left">
            <p className="text-[11px] text-[#F4F1E9]/35 font-mono">
              © 2026 DataCo-op · Handcrafted by P.K Creative Agency (Palani Kathirvel).
            </p>
            <span className="text-[10px] sm:text-[11px] text-[#F4F1E9]/35 font-mono uppercase tracking-wider">
              Est. 2024 // Verified Data. Real Earnings.
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}

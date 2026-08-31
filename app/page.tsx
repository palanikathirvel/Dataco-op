"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ShieldCheck,
  Wallet,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Star,
  Menu,
  X,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream-200 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          NAVIGATION — sticky cream bar, navy frame, responsive
      ══════════════════════════════════════════════════ */}
      <header className="header-vintage sticky top-0 z-50 bg-[#EDE7DA]/95 backdrop-blur-md border-b-2 md:border-b-[3px] border-[#1B3A5C]">
        <div className="container-vintage h-20 md:h-[88px] flex items-center justify-between">

          {/* Logo */}
          <Logo href="/" animated size="md" subtitle="Est. 2024" textVariant="dark" />

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex items-center gap-0">
            {[
              { label: "How it Works", href: "#how-it-works" },
              { label: "For Users",    href: "#for-users" },
              { label: "For Brands",   href: "#for-brands" },
              { label: "Contact Us",   href: "/contact" },
            ].map((item, i) => (
              <span key={item.href} className="flex items-center">
                {i > 0 && <span className="nav-divider mx-4 xl:mx-5" />}
                <Link href={item.href} className="nav-link text-xs xl:text-sm font-bold tracking-wider uppercase text-[#1B3A5C] hover:text-[#E3474F] transition-colors">
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>

          {/* Desktop CTA buttons */}
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

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 border border-[#1B3A5C] text-[#1B3A5C]"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-[#1B3A5C] bg-[#1B3A5C] text-[#F4F1E9] focus:outline-none"
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
                { label: "How it Works", href: "#how-it-works" },
                { label: "For Users",    href: "#for-users" },
                { label: "For Brands",   href: "#for-brands" },
                { label: "Contact Us",   href: "/contact" },
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
              <Link
                href="/brand/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-ghost w-full py-2.5 text-center text-xs font-bold uppercase tracking-widest border border-[#1B3A5C] text-[#1B3A5C]"
              >
                Brand Portal Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════
          HERO — full-bleed navy, ticket CTA, stamp panel (Responsive Grid)
      ══════════════════════════════════════════════════ */}
      <section className="section-espresso py-16 md:py-24 lg:py-28 relative overflow-hidden">
        {/* Red dashed hairlines top & bottom */}
        <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-[#E3474F]/70" />

        <div className="container-vintage">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* Left — Text block */}
            <div className="lg:col-span-7 relative">
              <span className="badge-bubble inline-flex items-center gap-1.5 mb-6 text-xs font-mono tracking-wider font-bold text-[#EF6A6E] bg-[#142C46] border border-[#E3474F]/50 px-3 py-1.5">
                <ShieldCheck size={13} /> Transaction-Verified Data
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] text-[#F4F1E9] my-6 font-display">
                Your verified purchase data,{" "}
                <span className="text-[#EF6A6E]">finally worth something</span>
              </h1>

              {/* Dashed red rule */}
              <div className="w-28 md:w-36 border-t-2 border-dashed border-[#E3474F] mb-6" />

              <p className="text-sm sm:text-base leading-relaxed text-[#F4F1E9]/75 mb-8 max-w-xl">
                Upload your order receipts. Get matched with brands that care about what
                you actually buy. Earn money for the opinions only you can give.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
                <Link href="/register" className="btn-embossed btn-embossed-primary btn-ticket py-3.5 px-7 text-xs sm:text-sm font-bold uppercase text-center flex items-center justify-center gap-2">
                  Start Earning <ArrowRight size={16} />
                </Link>
                <Link href="/brand/register" className="btn-embossed btn-embossed-outline py-3.5 px-7 text-xs sm:text-sm font-bold uppercase text-center flex items-center justify-center gap-2 border border-[#F4F1E9]/30 text-[#F4F1E9]">
                  <Building2 size={16} /> I&apos;m a Brand
                </Link>
              </div>

              <p className="mt-6 text-[11px] sm:text-xs text-[#F4F1E9]/50 tracking-wider font-mono uppercase">
                Free to join &nbsp;//&nbsp; ₹100+ per survey &nbsp;//&nbsp; Withdraw via UPI
              </p>
            </div>

            {/* Right — Live survey stamp panel */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="badge-circle hidden sm:block absolute -top-6 -right-3 z-10 text-center font-mono font-bold text-[10px] leading-tight bg-[#E3474F] text-white p-3 rounded-full border-2 border-[#1B3A5C] shadow-md">
                Est.<br />2024<br />Live
              </div>

              <div className="card-leather p-5 sm:p-7 bg-[#142C46] border-4 border-[#0D1E31] relative">
                <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-dashed border-[#E3474F]/60">
                  <span className="font-display text-[#F4F1E9] text-xs sm:text-sm tracking-wider uppercase font-bold">
                    Available Surveys
                  </span>
                  <span className="text-[11px] text-[#EF6A6E] font-mono tracking-widest">
                    ● LIVE
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { brand: "Nike India", amount: "₹180", time: "4 min", desc: "Running shoe feedback, Q3 2026" },
                    { brand: "boAt Audio",  amount: "₹150", time: "5 min", desc: "Audio preferences, age 25–34" },
                    { brand: "Cult.fit",   amount: "₹120", time: "3 min", desc: "Gym membership perception" },
                  ].map((s, i) => (
                    <div
                      key={s.brand}
                      className={`p-3.5 flex justify-between items-center transition-colors ${
                        i === 0 ? "bg-[#E3474F]/10 border border-[#E3474F]/40" : "bg-[#F4F1E9]/5 border border-[#F4F1E9]/15"
                      }`}
                    >
                      <div className="pr-2">
                        <div className="font-display text-[#F4F1E9] text-sm sm:text-base font-bold uppercase tracking-wide">
                          {s.brand}
                        </div>
                        <div className="text-[#F4F1E9]/60 text-xs mt-0.5">{s.desc}</div>
                        <div className="text-[#F4F1E9]/40 text-[10px] font-mono mt-1">~{s.time}</div>
                      </div>
                      <div className="bg-[#E3474F] text-white px-3 py-1.5 text-xs sm:text-sm font-bold font-display shrink-0">
                        {s.amount}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t-2 border-dashed border-[#F4F1E9]/20 flex justify-between items-center">
                  <span className="text-[#F4F1E9]/60 text-xs uppercase tracking-wider font-mono">Potential today</span>
                  <span className="font-display text-[#EF6A6E] text-xl font-bold">₹450</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-[#E3474F]/70" />
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAND — Responsive 2-col to 4-col
      ══════════════════════════════════════════════════ */}
      <div className="bg-[#142C46] border-y-2 border-[#E3474F]/60">
        <div className="container-vintage py-8 md:py-11">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 text-center">
            {[
              { value: "12,400+", label: "Verified Users" },
              { value: "₹48L+",   label: "Paid Out" },
              { value: "120+",    label: "Brand Partners" },
              { value: "₹180",    label: "Avg. Survey Reward" },
            ].map((s, i) => (
              <div key={s.label} className="relative px-3 sm:px-6">
                {i > 0 && (
                  <div className="hidden md:block absolute left-0 top-[10%] bottom-[10%] w-0 border-l-2 border-dashed border-[#F4F1E9]/20" />
                )}
                <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#EF6A6E] leading-tight">
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#F4F1E9]/50 mt-1.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — Responsive 1-col to 3-col
      ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="section-parchment py-16 md:py-24">
        <div className="container-vintage">

          <div className="text-center mb-12 md:mb-16">
            <span className="badge-bubble font-mono text-xs uppercase tracking-wider text-[#E3474F] bg-[#1B3A5C]/5 border border-[#E3474F]/40 px-3 py-1 font-bold">
              The Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1B3A5C] mt-4 font-display">
              <span className="heading-center-underline">Three steps from receipt to rupee</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-9">
            {[
              { num: "I", title: "Upload Your Purchases", desc: "Take a screenshot of any order email or receipt. We extract product, brand, and price automatically — no manual entry required.", icon: <Wallet size={22} color="#E3474F" /> },
              { num: "II", title: "Get Matched", desc: "Our algorithm tags you into cohorts like 'premium skincare buyer' or 'frequent foodie' — only with verified purchase proof. No fabrication.", icon: <Users size={22} color="#E3474F" /> },
              { num: "III", title: "Earn for Opinions", desc: "Brands pay to hear from people like you. Complete a 3–5 minute survey, money lands in your wallet instantly.", icon: <TrendingUp size={22} color="#E3474F" /> },
            ].map((step) => (
              <div key={step.num} className="card-plaque hover-lift p-6 sm:p-8 bg-white border-4 border-[#1B3A5C] relative shadow-[6px_6px_0_0_rgba(27,58,92,0.14)]">
                <div className="font-display text-4xl sm:text-5xl font-bold text-[#1B3A5C]/10 absolute top-5 right-6 leading-none select-none">
                  {step.num}
                </div>

                <div className="w-12 h-12 bg-[#E3474F]/10 border-2 border-[#E3474F] flex items-center justify-center mb-5 relative">
                  {step.icon}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#1B3A5C] mb-2.5 font-display tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-[#5B6472] relative">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOR USERS — Responsive 1-col to 2-col
      ══════════════════════════════════════════════════ */}
      <section id="for-users" className="section-espresso py-16 md:py-24 border-t-2 border-dashed border-[#E3474F]/60">
        <div className="container-vintage">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-7">
              <span className="badge-bubble font-mono text-xs uppercase tracking-wider text-[#EF6A6E] bg-[#142C46] border border-[#E3474F]/50 px-3 py-1 font-bold">
                For Consumers
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F1E9] mt-5 mb-4 leading-tight font-display">
                Your data has value.{" "}
                <span className="text-[#EF6A6E]">Claim it.</span>
              </h2>
              <div className="w-24 border-t-2 border-dashed border-[#E3474F] mb-6" />
              <p className="text-sm sm:text-base leading-relaxed text-[#F4F1E9]/75 mb-6">
                We don&apos;t sell your raw data to anyone. We connect you with brands
                who want your <span className="text-[#EF6A6E] font-bold">verified</span> perspective — and you decide which surveys to take.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Every purchase is verified — no bots, no fakes",
                  "You choose which surveys to take",
                  "UPI withdrawals, no minimum hold time",
                  "Your personal info stays personal",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="text-[#E3474F] mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm text-[#F4F1E9]/80">{b}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="btn-embossed btn-embossed-primary inline-flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-bold uppercase">
                Create Free Account <ArrowRight size={16} />
              </Link>
            </div>

            <div className="lg:col-span-5">
              <div className="card-leather p-6 sm:p-8 bg-[#142C46] border-4 border-[#0D1E31]">
                <div className="font-display text-[#F4F1E9] text-xs sm:text-sm tracking-wider uppercase font-bold mb-5 pb-3 border-b-2 border-dashed border-[#E3474F]/60">
                  Your Wallet
                </div>

                <div className="text-center my-6">
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#F4F1E9]/50 mb-1.5">
                    Available Balance
                  </div>
                  <div className="font-display text-4xl sm:text-5xl font-bold text-[#EF6A6E] leading-none">
                    ₹2,340
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { brand: "Nike", amount: "₹180", desc: "Running shoe feedback" },
                    { brand: "boAt",  amount: "₹150", desc: "Audio preferences" },
                    { brand: "Cult",  amount: "₹120", desc: "Gym perception study" },
                  ].map((s) => (
                    <div key={s.brand} className="flex justify-between items-center py-2.5 border-b border-dashed border-[#F4F1E9]/15">
                      <div>
                        <div className="font-display text-[#F4F1E9] text-xs sm:text-sm uppercase font-bold tracking-wide">{s.brand}</div>
                        <div className="text-[#F4F1E9]/50 text-[11px] mt-0.5">{s.desc}</div>
                      </div>
                      <span className="font-display text-[#EF6A6E] font-bold text-sm">+{s.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOR BRANDS — Responsive 1-col to 2-col
      ══════════════════════════════════════════════════ */}
      <section id="for-brands" className="section-parchment py-16 md:py-24">
        <div className="container-vintage">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="card-plaque p-6 sm:p-8 bg-white border-4 border-[#1B3A5C] shadow-[6px_6px_0_0_rgba(27,58,92,0.14)]">
                <div className="text-xs font-mono uppercase tracking-widest text-[#1B3A5C] font-bold mb-4 pb-3 border-b-2 border-dashed border-[#E3474F]/60">
                  Research Overview — Premium Skincare
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Premium skincare buyers in Mumbai",  value: "2,140" },
                    { label: "Avg. spend on skincare (6 months)", value: "₹8,400" },
                    { label: "Also buy electronics premium",       value: "34%" },
                    { label: "Survey completion rate",             value: "91%" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-dashed border-[#1B3A5C]/20 text-xs sm:text-sm">
                      <span className="text-[#5B6472]">{r.label}</span>
                      <span className="font-display font-bold text-[#1B3A5C]">{r.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-3.5 bg-[#E3474F]/10 border-2 border-[#1B3A5C]">
                  <div className="flex justify-between flex-wrap gap-2 text-xs">
                    <span className="text-[#5B6472]">Sample: <strong className="text-[#1B3A5C]">500</strong></span>
                    <span className="text-[#5B6472]">Per response: <strong className="text-[#1B3A5C]">₹100</strong></span>
                    <span className="text-[#E3474F] font-bold">Total: ₹65,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <span className="badge-bubble font-mono text-xs uppercase tracking-wider text-[#E3474F] bg-[#1B3A5C]/5 border border-[#E3474F]/40 px-3 py-1 font-bold">
                For Brands
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1B3A5C] mt-5 mb-4 leading-tight font-display">
                Stop guessing.{" "}
                <span className="text-[#E3474F]">Start knowing.</span>
              </h2>
              <div className="w-24 border-t-2 border-dashed border-[#E3474F] mb-6" />
              <p className="text-sm sm:text-base leading-relaxed text-[#5B6472] mb-6">
                Reach consumers who&apos;ve actually bought in your category. Every response is backed by a real
                transaction — no fabricated answers, no panel-farm nonsense. Real buyers. Real opinions.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Cohort targeting on 20+ verified purchase tags",
                  "Pay only for completed, verified responses",
                  "Anonymized demographics, never PII exposed",
                  "Export results to CSV in one click",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="text-[#E3474F] mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm text-[#5B6472]">{b}</span>
                  </li>
                ))}
              </ul>

              <Link href="/brand/register" className="btn-embossed btn-embossed-primary inline-flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-bold uppercase">
                <Building2 size={16} /> Register Your Brand
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIAL — navy plate
      ══════════════════════════════════════════════════ */}
      <section className="section-slate py-16 md:py-24 border-t-2 border-dashed border-[#E3474F]/60">
        <div className="container-vintage text-center max-w-3xl mx-auto">
          <div className="flex justify-center gap-1.5 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className="text-[#E3474F] fill-[#E3474F]" />
            ))}
          </div>
          <div className="testimonial-frame p-6 sm:p-10 bg-[#142C46] border-4 border-[#0D1E31]">
            <p className="text-base sm:text-lg md:text-xl text-[#F4F1E9] italic font-serif leading-relaxed">
              &ldquo;I&apos;ve earned ₹12,000 in three months just from surveys about things I already buy.
              The purchases are real, the questions are relevant, and the money shows up instantly.&rdquo;
            </p>
            <div className="w-16 border-t-2 border-dashed border-[#E3474F] mx-auto my-5" />
            <div className="font-display font-bold text-[#F4F1E9] uppercase tracking-wider text-base sm:text-lg">Rahul Sharma</div>
            <div className="text-xs text-[#EF6A6E] font-mono tracking-widest mt-1">Mumbai // Premium Electronics Buyer</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA BAND — responsive bottom CTA
      ══════════════════════════════════════════════════ */}
      <section className="section-espresso py-16 md:py-24 relative text-center">
        <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-[#E3474F]/70" />
        <div className="container-story max-w-2xl mx-auto px-4">
          <span className="badge-bubble font-mono text-xs uppercase tracking-wider text-[#EF6A6E] bg-[#142C46] border border-[#E3474F]/50 px-3 py-1 font-bold">
            Begin Today
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F1E9] my-6 leading-tight font-display">
            Ready to put your data to work?
          </h2>
          <div className="w-24 border-t-2 border-dashed border-[#E3474F] mx-auto mb-6" />
          <p className="text-xs sm:text-sm text-[#F4F1E9]/70 leading-relaxed mb-8">
            Join thousands of Indians earning from their verified purchase data.
            Free to join. No commitment. Withdraw any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-embossed btn-embossed-primary btn-ticket py-3.5 px-8 text-xs sm:text-sm font-bold uppercase flex items-center justify-center gap-2">
              Get Started — It&apos;s Free <ArrowRight size={16} />
            </Link>
            <Link href="/brand/register" className="btn-embossed btn-embossed-outline py-3.5 px-8 text-xs sm:text-sm font-bold uppercase flex items-center justify-center gap-2 border border-[#F4F1E9]/30 text-[#F4F1E9]">
              Register a Brand
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-[#E3474F]/70" />
      </section>

      {/* Barber stripe transition strip */}
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
                Handcrafted by P.K Creative Agency.
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  ["How It Works", "#how-it-works"],
                  ["For Users", "#for-users"],
                  ["For Brands", "#for-brands"],
                  ["Register", "/register"],
                ],
              },
              {
                title: "Brands",
                links: [
                  ["Brand Login", "/brand/login"],
                  ["Brand Register", "/brand/register"],
                  ["Admin Portal", "/admin/login"],
                ],
              },
              {
                title: "Legal & Contact",
                links: [
                  ["Contact Us", "/contact"],
                  ["Privacy Policy", "/privacy"],
                  ["Terms of Service", "/terms"],
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
              © 2026 DataCo-op. All rights reserved.
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

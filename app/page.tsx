import Link from "next/link"
import {
  ShieldCheck,
  Wallet,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Scissors,
  Star,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-200">

      {/* ══════════════════════════════════════════════════
          NAVIGATION — sticky cream bar, navy frame, mono links
      ══════════════════════════════════════════════════ */}
      <header className="header-vintage">
        <div className="container-vintage" style={{ height: "88px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{
              width: "44px", height: "44px",
              background: "#1B3A5C",
              border: "2px solid #1B3A5C",
              boxShadow: "inset 0 0 0 2px #EDE7DA, inset 0 0 0 3px #E3474F",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Scissors size={20} color="#EDE7DA" />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1B3A5C", lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.02em" }}>DataCo-op</div>
              <div className="font-mono" style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#E3474F", lineHeight: 1, marginTop: "4px" }}>Est. 2024</div>
            </div>
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0" }}>
            {[
              { label: "How it Works", href: "#how-it-works" },
              { label: "For Users",    href: "#for-users" },
              { label: "For Brands",   href: "#for-brands" },
            ].map((item, i) => (
              <span key={item.href} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <span className="nav-divider" style={{ margin: "0 18px" }} />}
                <a href={item.href} className="nav-link">{item.label}</a>
              </span>
            ))}
          </nav>

          {/* CTA buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/login" className="btn-ghost" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Sign In
            </Link>
            <Link href="/register" className="btn-primary" style={{ padding: "10px 24px", fontSize: "0.75rem" }}>
              Begin Journey <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          HERO — full-bleed navy, ticket CTA, stamp panel
      ══════════════════════════════════════════════════ */}
      <section className="section-espresso" style={{ padding: "96px 0 110px", position: "relative", overflow: "hidden" }}>
        {/* red dashed hairlines top & bottom */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, borderTop: "2px dashed rgba(227,71,79,0.7)" }} />

        <div className="container-vintage">
          <div style={{ display: "grid", gridTemplateColumns: "60fr 40fr", gap: "72px", alignItems: "center" }}>

            {/* Left — text block */}
            <div style={{ position: "relative" }}>
              <span className="badge-bubble" style={{ marginBottom: "28px" }}>
                <ShieldCheck size={13} /> Transaction-Verified Data
              </span>

              <h1 style={{
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                color: "#F4F1E9",
                margin: "36px 0 24px",
              }}>
                Your verified purchase data,{" "}
                <span style={{ color: "#EF6A6E" }}>finally worth something</span>
              </h1>

              {/* dashed red rule */}
              <div style={{ width: "140px", borderTop: "2px dashed #E3474F", marginBottom: "28px" }} />

              <p style={{
                fontSize: "0.95rem",
                lineHeight: 1.8,
                color: "rgba(244,241,233,0.72)",
                marginBottom: "40px",
                maxWidth: "540px",
              }}>
                Upload your order receipts. Get matched with brands that care about what
                you actually buy. Earn money for the opinions only you can give.
              </p>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/register" className="btn-embossed btn-embossed-primary btn-ticket">
                  Start Earning <ArrowRight size={16} />
                </Link>
                <Link href="/brand/register" className="btn-embossed btn-embossed-outline">
                  <Building2 size={16} /> I&apos;m a Brand
                </Link>
              </div>

              <p style={{ marginTop: "24px", fontSize: "0.72rem", color: "rgba(244,241,233,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Free to join &nbsp;//&nbsp; ₹100+ per survey &nbsp;//&nbsp; Withdraw via UPI
              </p>
            </div>

            {/* Right — live survey stamp panel */}
            <div style={{ position: "relative" }}>
              <div className="badge-circle" style={{ position: "absolute", top: "-26px", right: "-14px", zIndex: 2 }}>
                Est.<br />2024<br />Live
              </div>

              <div className="card-leather">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", paddingBottom: "14px", borderBottom: "2px dashed rgba(227,71,79,0.6)", position: "relative" }}>
                  <span className="font-display" style={{ color: "#F4F1E9", fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Available Surveys</span>
                  <span style={{ fontSize: "0.65rem", color: "#EF6A6E", letterSpacing: "0.14em", marginRight: "56px" }}>● LIVE</span>
                </div>

                {[
                  { brand: "Nike India", amount: "₹180", time: "4 min", desc: "Running shoe feedback, Q3 2026" },
                  { brand: "boAt Audio",  amount: "₹150", time: "5 min", desc: "Audio preferences, age 25–34" },
                  { brand: "Cult.fit",   amount: "₹120", time: "3 min", desc: "Gym membership perception" },
                ].map((s, i) => (
                  <div
                    key={s.brand}
                    style={{
                      background: i === 0 ? "rgba(227,71,79,0.1)" : "rgba(244,241,233,0.04)",
                      border: `1px solid ${i === 0 ? "rgba(227,71,79,0.45)" : "rgba(244,241,233,0.15)"}`,
                      padding: "14px 16px",
                      marginBottom: i < 2 ? "12px" : 0,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "border-color 180ms ease",
                    }}
                  >
                    <div>
                      <div className="font-display" style={{ color: "#F4F1E9", fontSize: "0.95rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{s.brand}</div>
                      <div style={{ color: "rgba(244,241,233,0.55)", fontSize: "0.72rem", marginTop: "3px" }}>{s.desc}</div>
                      <div style={{ color: "rgba(244,241,233,0.4)", fontSize: "0.65rem", marginTop: "4px", letterSpacing: "0.1em" }}>~{s.time}</div>
                    </div>
                    <div style={{
                      background: "#E3474F",
                      color: "#ffffff",
                      padding: "6px 14px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-oswald), 'Oswald', sans-serif",
                    }}>{s.amount}</div>
                  </div>
                ))}

                <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "2px dashed rgba(244,241,233,0.2)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(244,241,233,0.55)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Potential today</span>
                  <span className="font-display" style={{ color: "#EF6A6E", fontSize: "1.2rem", fontWeight: 700 }}>₹450</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "2px dashed rgba(227,71,79,0.7)" }} />
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAND — deep navy, dashed dividers
      ══════════════════════════════════════════════════ */}
      <div style={{ background: "#142C46", borderTop: "2px solid rgba(227,71,79,0.6)", borderBottom: "2px solid rgba(227,71,79,0.6)" }}>
        <div className="container-vintage" style={{ padding: "44px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", textAlign: "center" }}>
            {[
              { value: "12,400+", label: "Verified Users" },
              { value: "₹48L+",   label: "Paid Out" },
              { value: "120+",    label: "Brand Partners" },
              { value: "₹180",    label: "Avg. Survey Reward" },
            ].map((s, i) => (
              <div key={s.label} style={{ position: "relative", padding: "0 24px" }}>
                {i > 0 && (
                  <div style={{ position: "absolute", left: 0, top: "10%", bottom: "10%", width: 0, borderLeft: "2px dashed rgba(244,241,233,0.18)" }} />
                )}
                <div className="font-display" style={{ fontSize: "2.3rem", fontWeight: 700, color: "#EF6A6E", lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(244,241,233,0.5)", marginTop: "8px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — cream grid paper, stamp cards
      ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="section-parchment" style={{ padding: "110px 0" }}>
        <div className="container-vintage">

          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <span className="badge-bubble">The Process</span>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.9rem)", margin: "32px 0 0" }}>
              <span className="heading-center-underline">Three steps from receipt to rupee</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "36px" }}>
            {[
              { num: "I", title: "Upload Your Purchases", desc: "Take a screenshot of any order email or receipt. We extract product, brand, and price automatically — no manual entry required.", icon: <Wallet size={22} color="#E3474F" /> },
              { num: "II", title: "Get Matched", desc: "Our algorithm tags you into cohorts like 'premium skincare buyer' or 'frequent foodie' — only with verified purchase proof. No fabrication.", icon: <Users size={22} color="#E3474F" /> },
              { num: "III", title: "Earn for Opinions", desc: "Brands pay to hear from people like you. Complete a 3–5 minute survey, money lands in your wallet instantly.", icon: <TrendingUp size={22} color="#E3474F" /> },
            ].map((step) => (
              <div key={step.num} className="card-plaque hover-lift">
                <div className="font-display" style={{
                  fontSize: "3.4rem",
                  fontWeight: 700,
                  color: "rgba(27,58,92,0.1)",
                  position: "absolute",
                  top: "20px",
                  right: "26px",
                  lineHeight: 1,
                }}>{step.num}</div>

                <div style={{ width: "52px", height: "52px", background: "rgba(227,71,79,0.08)", border: "2px solid #E3474F", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "22px", position: "relative" }}>
                  {step.icon}
                </div>

                <h3 style={{ fontSize: "1.2rem", marginBottom: "12px", letterSpacing: "0.02em" }}>{step.title}</h3>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#5B6472", position: "relative" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOR USERS — full-bleed navy, wallet stamp card
      ══════════════════════════════════════════════════ */}
      <section id="for-users" className="section-espresso" style={{ padding: "110px 0", borderTop: "2px dashed rgba(227,71,79,0.6)" }}>
        <div className="container-vintage">
          <div style={{ display: "grid", gridTemplateColumns: "55fr 45fr", gap: "72px", alignItems: "center" }}>

            <div>
              <span className="badge-bubble">For Consumers</span>
              <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.6rem)", color: "#F4F1E9", margin: "30px 0 20px", lineHeight: 1.15 }}>
                Your data has value.{" "}
                <span style={{ color: "#EF6A6E" }}>Claim it.</span>
              </h2>
              <div style={{ width: "100px", borderTop: "2px dashed #E3474F", marginBottom: "26px" }} />
              <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "rgba(244,241,233,0.72)", marginBottom: "34px" }}>
                We don&apos;t sell your raw data to anyone. We connect you with brands
                who want your <em style={{ color: "#EF6A6E", fontStyle: "normal", fontWeight: 700 }}>verified</em> perspective — and you decide which surveys to take.
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 38px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "Every purchase is verified — no bots, no fakes",
                  "You choose which surveys to take",
                  "UPI withdrawals, no minimum hold time",
                  "Your personal info stays personal",
                ].map((b) => (
                  <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <CheckCircle2 size={17} color="#E3474F" style={{ marginTop: "3px", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem", color: "rgba(244,241,233,0.8)" }}>{b}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="btn-embossed btn-embossed-primary">
                Create Free Account <ArrowRight size={16} />
              </Link>
            </div>

            <div className="card-leather">
              <div className="font-display" style={{ color: "#F4F1E9", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "22px", paddingBottom: "14px", borderBottom: "2px dashed rgba(227,71,79,0.6)", position: "relative" }}>
                Your Wallet
              </div>

              <div style={{ textAlign: "center", margin: "24px 0 30px", position: "relative" }}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(244,241,233,0.5)", marginBottom: "8px" }}>Available Balance</div>
                <div className="font-display" style={{ fontSize: "3rem", fontWeight: 700, color: "#EF6A6E", lineHeight: 1.1 }}>₹2,340</div>
              </div>

              {[
                { brand: "Nike", amount: "₹180", desc: "Running shoe feedback" },
                { brand: "boAt",  amount: "₹150", desc: "Audio preferences" },
                { brand: "Cult",  amount: "₹120", desc: "Gym perception study" },
              ].map((s, i, arr) => (
                <div key={s.brand} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px dashed rgba(244,241,233,0.15)" : "none", position: "relative" }}>
                  <div>
                    <div className="font-display" style={{ color: "#F4F1E9", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>{s.brand}</div>
                    <div style={{ color: "rgba(244,241,233,0.45)", fontSize: "0.7rem", marginTop: "2px" }}>{s.desc}</div>
                  </div>
                  <span className="font-display" style={{ color: "#EF6A6E", fontWeight: 700 }}>+{s.amount}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOR BRANDS — cream, research overview stamp card
      ══════════════════════════════════════════════════ */}
      <section id="for-brands" className="section-parchment" style={{ padding: "110px 0" }}>
        <div className="container-vintage">
          <div style={{ display: "grid", gridTemplateColumns: "45fr 55fr", gap: "72px", alignItems: "center" }}>

            <div className="card-plaque">
              <div style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#1B3A5C", fontWeight: 700, marginBottom: "18px", paddingBottom: "14px", borderBottom: "2px dashed rgba(227,71,79,0.6)", position: "relative" }}>
                Research Overview — Premium Skincare
              </div>

              {[
                { label: "Premium skincare buyers in Mumbai",  value: "2,140" },
                { label: "Avg. spend on skincare (6 months)", value: "₹8,400" },
                { label: "Also buy electronics premium",       value: "34%" },
                { label: "Survey completion rate",             value: "91%" },
              ].map((r, i, arr) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px dashed rgba(27,58,92,0.2)" : "none", position: "relative" }}>
                  <span style={{ fontSize: "0.78rem", color: "#5B6472" }}>{r.label}</span>
                  <span className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1B3A5C" }}>{r.value}</span>
                </div>
              ))}

              <div style={{ marginTop: "20px", padding: "16px", background: "rgba(227,71,79,0.06)", border: "2px solid #1B3A5C", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "0.72rem" }}>
                  <span style={{ color: "#5B6472" }}>Sample: <strong style={{ color: "#1B3A5C" }}>500</strong></span>
                  <span style={{ color: "#5B6472" }}>Per response: <strong style={{ color: "#1B3A5C" }}>₹100</strong></span>
                  <span style={{ color: "#E3474F", fontWeight: 700 }}>Total: ₹65,000</span>
                </div>
              </div>
            </div>

            <div>
              <span className="badge-bubble">For Brands</span>
              <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.6rem)", margin: "30px 0 20px", lineHeight: 1.15 }}>
                Stop guessing.{" "}
                <span style={{ color: "#E3474F" }}>Start knowing.</span>
              </h2>
              <div style={{ width: "100px", borderTop: "2px dashed #E3474F", marginBottom: "26px" }} />
              <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "#5B6472", marginBottom: "34px" }}>
                Reach consumers who&apos;ve actually bought in your category. Every response is backed by a real
                transaction — no fabricated answers, no panel-farm nonsense. Real buyers. Real opinions.
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 38px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "Cohort targeting on 20+ verified purchase tags",
                  "Pay only for completed, verified responses",
                  "Anonymized demographics, never PII exposed",
                  "Export results to CSV in one click",
                ].map((b) => (
                  <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <CheckCircle2 size={17} color="#E3474F" style={{ marginTop: "3px", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem", color: "#5B6472" }}>{b}</span>
                  </li>
                ))}
              </ul>

              <Link href="/brand/register" className="btn-embossed btn-embossed-primary">
                <Building2 size={16} /> Register Your Brand
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIAL — navy plate, red stars, mono voice
      ══════════════════════════════════════════════════ */}
      <section className="section-slate" style={{ padding: "96px 0", borderTop: "2px dashed rgba(227,71,79,0.6)" }}>
        <div className="container-vintage" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "28px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} color="#E3474F" fill="#E3474F" />
            ))}
          </div>
          <div className="testimonial-frame">
            <p className="testimonial-text">
              &ldquo;I&apos;ve earned ₹12,000 in three months just from surveys about things I already buy.
              The purchases are real, the questions are relevant, and the money shows up instantly.&rdquo;
            </p>
            <div className="testimonial-divider" />
            <div className="testimonial-attribution">Rahul Sharma</div>
            <div className="testimonial-role">Mumbai // Premium Electronics Buyer</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          GALLERY — scrapbook navy frames, rotated stacking
      ══════════════════════════════════════════════════ */}
      <section className="section-parchment" style={{ padding: "110px 0", borderTop: "2px dashed rgba(227,71,79,0.6)" }}>
        <div className="container-vintage">
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <span className="badge-bubble">Verified Moments</span>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.9rem)", margin: "32px 0 0" }}>
              <span className="heading-center-underline">Real people. Real earnings. Real stories.</span>
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
            gridAutoFlow: "dense"
          }}>
            {[
              {
                img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=500&fit=crop",
                caption: "Priya — ₹8,400 earned",
                rotation: "-2deg",
                span: { row: 2 }
              },
              {
                img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
                caption: "Arjun — Mumbai foodie",
                rotation: "1.5deg"
              },
              {
                img: "https://images.unsplash.com/photo-1491553895876-5746a5c3e6e9?w=400&h=400&fit=crop",
                caption: "Sneha — Tech enthusiast",
                rotation: "-1deg"
              },
              {
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=350&fit=crop",
                caption: "Rohan — Fitness first",
                rotation: "2deg"
              },
              {
                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=450&fit=crop",
                caption: "Kavya — Skincare lover",
                rotation: "-1.5deg",
                span: { row: 2 }
              },
              {
                img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop",
                caption: "Amit — Gamer",
                rotation: "1deg"
              },
            ].map((item, i) => (
              <div
                key={i}
                className="frame-polaroid img-zoom"
                data-caption={item.caption}
                style={{
                  "--polaroid-rot": item.rotation,
                  gridRow: item.span?.row ? `span ${item.span.row}` : "auto",
                } as React.CSSProperties & Record<string, string>}
              >
                <img
                  src={item.img}
                  alt={item.caption}
                  style={{ width: "100%", height: "100%", minHeight: "220px", objectFit: "cover", display: "block", filter: "saturate(0.9)" }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA BAND — deep navy, ticket CTA
      ══════════════════════════════════════════════════ */}
      <section className="section-espresso" style={{ padding: "110px 0", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, borderTop: "2px dashed rgba(227,71,79,0.7)" }} />
        <div className="container-story" style={{ textAlign: "center" }}>
          <span className="badge-bubble">Begin Today</span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.9rem)", color: "#F4F1E9", margin: "32px 0 20px", lineHeight: 1.15 }}>
            Ready to put your data to work?
          </h2>
          <div style={{ width: "120px", borderTop: "2px dashed #E3474F", margin: "0 auto 28px" }} />
          <p style={{ fontSize: "0.92rem", color: "rgba(244,241,233,0.7)", lineHeight: 1.8, marginBottom: "44px" }}>
            Join thousands of Indians earning from their verified purchase data.
            Free to join. No commitment. Withdraw any time.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-embossed btn-embossed-primary btn-ticket">
              Get Started — It&apos;s Free <ArrowRight size={16} />
            </Link>
            <Link href="/brand/register" className="btn-embossed btn-embossed-outline">
              Register a Brand
            </Link>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderTop: "2px dashed rgba(227,71,79,0.7)" }} />
      </section>

      {/* Barber stripe transition strip */}
      <div style={{ height: "10px", background: "repeating-linear-gradient(90deg, #E3474F 0 12px, #FFFFFF 12px 24px, #1B3A5C 24px 36px, #FFFFFF 36px 48px)" }} />

      {/* ══════════════════════════════════════════════════
          FOOTER — navy, red top border, mono links
      ══════════════════════════════════════════════════ */}
      <footer style={{ background: "#0D1E31" }}>
        <div className="container-vintage" style={{ padding: "64px 0 36px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "44px", paddingBottom: "44px", borderBottom: "2px dashed rgba(244,241,233,0.15)" }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                <div style={{ width: "36px", height: "36px", background: "#1B3A5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Scissors size={16} color="#EDE7DA" />
                </div>
                <div>
                  <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F4F1E9", textTransform: "uppercase", letterSpacing: "0.03em" }}>DataCo-op</div>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#EF6A6E", marginTop: "3px" }}>Est. 2024</div>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "rgba(244,241,233,0.5)", lineHeight: 1.8, maxWidth: "300px" }}>
                A verified consumer data marketplace where purchase history becomes purchasing power.
              </p>
            </div>

            {[
              { title: "Platform", links: [["How It Works", "#how-it-works"], ["For Users", "#for-users"], ["For Brands", "#for-brands"], ["Register", "/register"]] },
              { title: "Brands", links: [["Brand Login", "/brand/login"], ["Brand Register", "/brand/register"], ["Admin Portal", "/admin/login"]] },
              { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Contact Us", "/contact"]] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#F4F1E9", fontWeight: 700, marginBottom: "18px", paddingBottom: "10px", borderBottom: "2px dashed rgba(227,71,79,0.55)" }}>{col.title}</div>
                {col.links.map(([label, href]) => (
                  <div key={label} style={{ marginBottom: "10px" }}>
                    <Link href={href} className="footer-link" style={{ fontSize: "0.78rem", color: "rgba(244,241,233,0.55)", textDecoration: "none", transition: "color 180ms ease" }}>{label}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "26px", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "0.7rem", color: "rgba(244,241,233,0.35)", letterSpacing: "0.06em" }}>
              © 2026 DataCo-op. All rights reserved.
            </p>
            <span style={{ fontSize: "0.68rem", color: "rgba(244,241,233,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Est. 2024 // Verified Data. Real Earnings.
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}

import Link from "next/link"
import { ArrowLeft, ShieldCheck, Lock, EyeOff, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy & DPDP Notice | DataCo-op",
  description: "DataCo-op Privacy Policy and DPDP Act compliance disclosures. Learn how your verified consumer data is anonymized and secured.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B3A5C] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-background hover:bg-muted border px-3 py-1.5 rounded-full shadow-xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </Link>
          <Logo href="/" animated size="sm" />
        </div>

        {/* Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Zero-Party Privacy Standard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Privacy Policy & Data Principal Rights Notice
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Digital Personal Data Protection (DPDP) Act Compliance Notice &bull; Validated September 2026
          </p>
        </div>

        {/* Body Content */}
        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed border p-6 sm:p-8 rounded-xl bg-white shadow-xs">
          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> 1. Principles of Data Fiduciary Conduct
            </h2>
            <p>
              Under India&apos;s DPDP Act, 2023, <strong>DataCo-op</strong> acts as a Data Fiduciary. We process personal data solely with your explicit, affirmative, and revocable consent. We reject third-party tracking, cookie scraping, and clandestine data harvesting.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-primary" /> 2. What Data We Collect & Anonymize
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Authentication Data:</strong> Email address, hashed password, and session tokens used strictly to secure your account.</li>
              <li><strong>Demographics:</strong> Self-declared age band, gender, and city tier, used exclusively to match you with eligible consumer cohorts.</li>
              <li><strong>Purchase Verification Proof:</strong> Invoices or screenshots from verified e-commerce platforms. Personal delivery addresses, card numbers, and banking details are redacted during verification.</li>
              <li><strong>Survey Responses:</strong> Aggregated and anonymized before being shared with research sponsors. Brands never receive your real name, email, or phone number.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 3. Your Rights as a Data Principal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 border rounded-lg bg-muted/20">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Right to Access</h4>
                <p className="text-xs text-muted-foreground">You may view all your uploaded receipts, earnings history, and active cohort tags directly in your Dashboard.</p>
              </div>
              <div className="p-3 border rounded-lg bg-muted/20">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Right to Correction</h4>
                <p className="text-xs text-muted-foreground">Update your demographic details, UPI ID, or notification preferences anytime in Profile Settings.</p>
              </div>
              <div className="p-3 border rounded-lg bg-muted/20">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Right to Erasure</h4>
                <p className="text-xs text-muted-foreground">Permanently delete your account with one click, triggering automated purging of all personal and verification records.</p>
              </div>
              <div className="p-3 border rounded-lg bg-muted/20">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Right to Grievance Redressal</h4>
                <p className="text-xs text-muted-foreground">Contact our Data Protection Grievance Officer directly at support@datacoop.in or via the Contact page.</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> 4. Security Infrastructure
            </h2>
            <p>
              All traffic is encrypted in transit using TLS 1.3 with Strict-Transport-Security (HSTS). Passwords are encrypted with salted bcrypt rounds. Production access requires role-based multi-tenant authorization controls with continuous audit logging.
            </p>
          </section>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center pt-4">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild className="bg-[#1B3A5C] text-white">
            <Link href="/terms">View Terms of Service &rarr;</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { ArrowLeft, ShieldCheck, Scale, FileText, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service | DataCo-op",
  description: "Terms and conditions governing consumer data verification, monetization, and brand research agreements on DataCo-op.",
}

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Legal Governance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Terms of Service & Data Co-operative Agreement
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Last Updated: September 2026 &bull; Compliant with Digital Personal Data Protection Act (DPDP), India
          </p>
        </div>

        {/* Body Content */}
        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed border p-6 sm:p-8 rounded-xl bg-white shadow-xs">
          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Overview & Co-operative Model
            </h2>
            <p>
              Welcome to <strong>DataCo-op</strong> (&ldquo;the Platform&rdquo;). DataCo-op operates as a verified zero-party consumer research and data co-operative. By registering as a Consumer Member or Brand Partner, you enter into a binding agreement governed by Indian law and the provisions of the Digital Personal Data Protection Act (DPDP Act, 2023).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> 2. Consumer Member Rights & Monetization
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Zero-Party Verification:</strong> When you upload receipts (Amazon, Flipkart, Swiggy, Zomato), you affirm that the receipts reflect authentic purchases made by you.</li>
              <li><strong>Voluntary Survey Participation:</strong> Completing surveys is entirely voluntary. Every survey explicitly discloses the payout reward before you begin.</li>
              <li><strong>Payouts & UPI Transfers:</strong> Verified earnings reflect in your platform wallet upon survey approval and can be redeemed to your registered UPI ID in accordance with standard RBI digital payment guidelines.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> 3. Brand Partner Commitments
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Ethical Research:</strong> Brand Partners agree to use anonymized cohort data strictly for statistical analysis, market research, and product sentiment.</li>
              <li><strong>No Re-identification:</strong> Brands shall not attempt to de-anonymize, trace, or re-identify individual respondents from research datasets.</li>
              <li><strong>Budget Integrity:</strong> Research project budgets are committed in advance to guarantee payment to participating consumers upon verified survey completion.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 4. Account Termination & Data Erasure
            </h2>
            <p>
              In accordance with your Right to Erasure, both Consumers and Brands may delete their accounts at any time via Settings. Account deletion immediately and permanently purges personal profiles, uploaded receipt data, and transaction histories from active production tables.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" /> 5. Limitation of Liability & Jurisdiction
            </h2>
            <p>
              DataCo-op operates as a technology intermediary. While we enforce automated and manual receipt verification to maximize survey authenticity, research datasets are provided on an &ldquo;as is&rdquo; basis. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, India.
            </p>
          </section>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center pt-4">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild className="bg-[#1B3A5C] text-white">
            <Link href="/privacy">View Privacy Policy &rarr;</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

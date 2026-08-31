import {
  Smartphone,
  Users,
  DollarSign,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import {
  VintageHeader,
  VintageFooter,
  VintageSection,
  VintageSectionHeader,
  VintageCard,
  VintageBenefitList,
  VintageHero,
  VintageStep,
} from "@/components/vintage";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Verify Your Purchases",
    description:
      "Upload screenshots, forward email receipts, or manually enter your purchase details. Our system verifies each purchase.",
    icon: Smartphone,
  },
  {
    number: "02",
    title: "Get Matched to Surveys",
    description:
      "Based on your verified purchases, you'll be matched with relevant brand surveys. No spam, only surveys that match your profile.",
    icon: Users,
  },
  {
    number: "03",
    title: "Earn Real Money",
    description:
      "Complete surveys and earn ₹100-500+ per survey. Withdraw to your UPI once you reach ₹500. Fast, secure payouts.",
    icon: DollarSign,
  },
];

const features = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your personal data is anonymized. Brands only see age range, city tier, gender, and purchase cohorts - never your name, email, or exact location.",
  },
  {
    icon: CheckCircle,
    title: "Verified Purchases Only",
    description:
      "Every purchase is verified by our team. This ensures brands get authentic insights from real customers, and you get paid for genuine data.",
  },
  {
    icon: TrendingUp,
    title: "Higher Payouts",
    description:
      "Because your data is verified and valuable, brands pay premium rates. Earn significantly more than typical survey platforms.",
  },
];

const forUsers = [
  "Turn everyday purchases into passive income",
  "Choose from 3 easy verification methods",
  "Get matched to relevant, high-paying surveys",
  "Withdraw to UPI from ₹500",
  "Full control over your data sharing",
];

const forBrands = [
  "Access verified purchaser audiences only",
  "Build custom cohorts from real purchase data",
  "Design surveys with our intuitive builder",
  "Get responses in hours, not weeks",
  "Export anonymized data for analysis",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col vintage-theme">
      <VintageHeader />

      <main className="flex-1 pt-16">
        <VintageHero
          eyebrow="Launching Soon — Join the Waitlist"
          title="Turn Your Purchases into"
          highlightedText="Real Income"
          subtitle="Verify your purchases, get matched with brands who value your opinion, and earn ₹100-500+ per survey. Your data, your control, your earnings."
          primaryCta={{
            text: "Join as a User",
            href: "/register",
          }}
          secondaryCta={{
            text: "Join as a Brand",
            href: "/register?type=brand",
          }}
        />

        <VintageSection id="how-it-works" background="muted">
          <VintageSectionHeader
            accent="A Time-Honored Process"
            title="How It Works"
            subtitle="Three simple steps to start earning from your purchase data"
          />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mt-8">
            {steps.map((step, index) => (
              <VintageStep
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </VintageSection>

        <VintageSection id="for-users">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="script-accent text-2xl text-primary mb-2">
                For the Modern Consumer
              </p>
              <h2 className="vintage-title text-3xl md:text-4xl mb-4">
                Earn from Your Receipts
              </h2>
              <p className="vintage-body text-muted-foreground text-lg mb-6">
                Every purchase you make has value. Brands want to know what you
                buy, why you buy it, and what you think about it. DataCoop
                makes it easy to monetize your purchase history securely.
              </p>
              <VintageBenefitList items={forUsers} title="The Benefits" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <VintageCard
                icon={Smartphone}
                title="Screenshot Upload"
                description="Snap a photo of your order confirmation or invoice"
              />
              <VintageCard
                icon={Users}
                title="Email Forwarding"
                description="Auto-forward receipts to your unique @datacoop.in address"
              />
              <VintageCard
                icon={TrendingUp}
                title="Manual Entry"
                description="Enter purchase details directly when other methods aren't available"
              />
              <VintageCard
                icon={DollarSign}
                title="Instant Matching"
                description="Get notified when brands need your specific purchase profile"
              />
            </div>
          </div>
        </VintageSection>

        <div className="vintage-decorative-rule" />

        <VintageSection id="for-brands" background="muted">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
              <VintageCard
                icon={Users}
                title="Verified Audiences"
                description="Only real purchasers verified by our team"
              />
              <VintageCard
                icon={TrendingUp}
                title="Custom Cohorts"
                description="Target by category, spend, frequency, platform"
              />
              <VintageCard
                icon={Smartphone}
                title="Fast Insights"
                description="Get responses in hours, not weeks"
              />
              <VintageCard
                icon={DollarSign}
                title="Cost Effective"
                description="Pay per response, no monthly fees"
              />
            </div>

            <div className="order-1 lg:order-2">
              <p className="script-accent text-2xl text-primary mb-2">
                For the Discerning Brand
              </p>
              <h2 className="vintage-title text-3xl md:text-4xl mb-4">
                Real Insights from Real Buyers
              </h2>
              <p className="vintage-body text-muted-foreground text-lg mb-6">
                Stop guessing what customers want. Survey verified purchasers
                who actually bought your products or competitors'. Build cohorts
                from real purchase behavior, not self-reported data.
              </p>
              <VintageBenefitList items={forBrands} title="The Benefits" />
            </div>
          </div>
        </VintageSection>

        <VintageSection id="trust">
          <VintageSectionHeader
            accent="Our Promise"
            title="Built for Trust & Privacy"
            subtitle="We take data protection seriously. Your privacy is our priority."
          />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <VintageCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </VintageSection>

        <VintageSection background="dark">
          <div className="text-center max-w-2xl mx-auto">
            <p className="script-accent text-2xl text-primary mb-2">
              Begin Your Journey
            </p>
            <h2 className="vintage-title text-3xl md:text-4xl mb-4">
              Ready to Start Earning?
            </h2>
            <p className="vintage-body text-lg opacity-80 mb-8">
              Join thousands of users turning their everyday purchases into
              passive income. Free to join, no hidden fees.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto gap-2"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?type=brand">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary-foreground/50 hover:bg-primary-foreground/10"
                >
                  For Brands
                </Button>
              </Link>
            </div>
          </div>
        </VintageSection>
      </main>

      <VintageFooter />
    </div>
  );
}
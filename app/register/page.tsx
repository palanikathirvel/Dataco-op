"use client"

import { useState, useTransition, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Check, Mail, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Logo } from "@/components/ui/logo"
import { LogoLoader } from "@/components/ui/logo-loader"

const STEPS = ["Account", "Verify Email", "About you", "Consent"] as const

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [, startTransition] = useTransition()

  // Form State
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    age: "",
    gender: "",
    city: "",
    pincode: "",
    consent: false,
  })

  // OTP Verification State
  const [otpCode, setOtpCode] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Send OTP to email
  async function handleSendVerificationCode() {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address")
      return false
    }
    if (!form.name || form.name.trim().length < 2) {
      toast.error("Please enter your full name (at least 2 characters)")
      return false
    }
    if (!form.password || form.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return false
    }

    setSendingCode(true)
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, type: "register" }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to send verification code")
        return false
      }

      toast.success(data.message || "Verification code sent to your email!")
      if (data.devPreview) {
        toast.info(`[Dev Mode OTP]: ${data.devPreview}`, { duration: 10000 })
      }
      setResendCooldown(60)
      return true
    } catch (err) {
      toast.error("Network error while sending verification code")
      return false
    } finally {
      setSendingCode(false)
    }
  }

  // Verify OTP code
  async function handleVerifyCode() {
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit verification code")
      return
    }

    setVerifyingCode(true)
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otpCode.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Invalid verification code")
        return
      }

      setIsEmailVerified(true)
      toast.success("Email verified successfully!")
      setStep(2) // Move to 'About you' step
    } catch (err) {
      toast.error("Error verifying code. Please try again.")
    } finally {
      setVerifyingCode(false)
    }
  }

  async function next() {
    if (step === 0) {
      const sent = await handleSendVerificationCode()
      if (sent) {
        setStep(1)
      }
      return
    }

    if (step === 1) {
      if (!isEmailVerified) {
        await handleVerifyCode()
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      const age = parseInt(form.age, 10)
      if (!form.age || isNaN(age) || age < 18) {
        toast.error("You must be 18 or older")
        return
      }
      if (!/^[0-9]{10}$/.test(form.phone)) {
        toast.error("Phone must be 10 digits")
        return
      }
      if (!form.gender || !form.city || !/^[0-9]{6}$/.test(form.pincode)) {
        toast.error("Fill in all profile fields correctly")
        return
      }
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  async function submit() {
    if (!form.consent) {
      toast.error("You must consent to continue")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age, 10),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Registration failed")
        return
      }

      // Auto sign in
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (signInRes?.error) {
        toast.success("Account created! Welcome email sent.")
        router.push("/login")
        return
      }
      toast.success("Welcome to DataCo-op! Welcome email sent.")
      startTransition(() => {
        router.push("/dashboard")
        router.refresh()
      })
    } catch (err) {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4 py-12">
      {loading && (
        <LogoLoader
          fullScreen
          size="lg"
          message="Creating your DataCo-op Account..."
          submessage="Sending welcome package & initializing verified wallet"
        />
      )}

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Logo href="/" animated size="lg" />
        </div>

        <Card className="border-2 border-[#1B3A5C]/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#1B3A5C]">Create your account</CardTitle>
            <CardDescription className="font-medium text-[#5C6B73]">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </CardDescription>
            <div className="flex gap-1 pt-2">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i <= step ? "bg-[#1B3A5C]" : "bg-[#EDE7DA]"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {/* Step 0: Account Details */}
            {step === 0 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full font-bold border-2 border-[#1B3A5C]/30 hover:bg-[#EDE7DA]/50"
                  onClick={handleGoogle}
                >
                  Continue with Google
                </Button>
                <div className="my-6 flex items-center gap-3">
                  <Separator className="flex-1 bg-[#1B3A5C]/20" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B73]">OR</span>
                  <Separator className="flex-1 bg-[#1B3A5C]/20" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Step 1: Email Code Verification */}
            {step === 1 && (
              <div className="space-y-5 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-[#1B3A5C]/10 flex items-center justify-center text-[#1B3A5C]">
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1B3A5C]">Verify your Email Address</h3>
                  <p className="text-sm text-[#5C6B73] mt-1">
                    We sent a 6-digit code to <strong className="text-[#1B3A5C]">{form.email}</strong>.
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="otp" className="text-center block font-bold">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center tracking-[8px] text-2xl font-mono font-bold h-14"
                    autoFocus
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    Code expires in 10 minutes.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[#5C6B73] hover:text-[#1B3A5C] gap-1 px-2"
                    onClick={() => setStep(0)}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Edit email
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={resendCooldown > 0 || sendingCode}
                    onClick={handleSendVerificationCode}
                    className="text-[#1B3A5C] font-bold gap-1 px-2"
                  >
                    {sendingCode ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: About You */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      min="18"
                      max="100"
                      value={form.age}
                      onChange={(e) => update("age", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(v) => update("gender", v)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (UPI Payouts)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="e.g. Bengaluru"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="560001"
                      value={form.pincode}
                      onChange={(e) =>
                        update("pincode", e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Consent */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  By creating an account, you agree to share your verified purchase
                  data with brands via anonymized cohort tags. We never share your name, email,
                  phone, or raw order details with brands.
                </p>
                <ul className="space-y-2 text-sm">
                  <Bullet>Verify purchases with screenshots or email receipts</Bullet>
                  <Bullet>Brands only see aggregated, anonymized insights</Bullet>
                  <Bullet>Opt out of any survey or category anytime</Bullet>
                  <Bullet>Direct cash payouts to your UPI once you hit ₹500</Bullet>
                </ul>
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-[#1B3A5C]/20 bg-[#F3EFE6]/50 cursor-pointer hover:bg-[#F3EFE6]">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#1B3A5C]"
                  />
                  <span className="text-sm text-[#1B3A5C]">
                    I consent to DataCo-op processing my verified purchase data under DPDP Act and
                    matching me with relevant research opportunities. I&apos;ve read
                    the <Link href="/privacy" className="font-bold underline">Privacy Policy</Link>.
                  </span>
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              {step > 0 && step !== 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={loading || sendingCode || verifyingCode}
                >
                  Back
                </Button>
              )}

              {step === 0 && (
                <Button
                  type="button"
                  onClick={next}
                  className="flex-1 bg-[#1B3A5C] text-white hover:bg-[#1B3A5C]/90 font-bold"
                  disabled={sendingCode}
                >
                  {sendingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending Code...
                    </>
                  ) : (
                    "Continue & Send Code"
                  )}
                </Button>
              )}

              {step === 1 && (
                <Button
                  type="button"
                  onClick={handleVerifyCode}
                  className="flex-1 bg-[#1B3A5C] text-white hover:bg-[#1B3A5C]/90 font-bold"
                  disabled={verifyingCode || otpCode.length !== 6}
                >
                  {verifyingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...
                    </>
                  ) : (
                    "Verify Code & Continue"
                  )}
                </Button>
              )}

              {step === 2 && (
                <Button
                  type="button"
                  onClick={next}
                  className="flex-1 bg-[#1B3A5C] text-white hover:bg-[#1B3A5C]/90 font-bold"
                >
                  Continue
                </Button>
              )}

              {step === 3 && (
                <Button
                  type="button"
                  onClick={submit}
                  className="flex-1 bg-[#1B3A5C] text-white hover:bg-[#1B3A5C]/90 font-bold"
                  disabled={loading || !form.consent}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1B3A5C] hover:underline font-bold">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-4 w-4 text-[#1B3A5C] mt-0.5 shrink-0" />
      <span className="text-[#4A4E69]">{children}</span>
    </li>
  )
}

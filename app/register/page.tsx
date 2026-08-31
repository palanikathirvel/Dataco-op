"use client"

import { useState, useTransition } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Check } from "lucide-react"
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

const STEPS = ["Account", "About you", "Consent"] as const

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

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

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function next() {
    if (step === 0) {
      if (!form.email || !form.password || !form.name) {
        toast.error("Fill in all fields")
        return
      }
      if (form.password.length < 8) {
        toast.error("Password must be at least 8 characters")
        return
      }
    }
    if (step === 1) {
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
        toast.error("Fill in all fields correctly")
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
        toast.success("Account created! Please log in.")
        router.push("/login")
        return
      }
      toast.success("Welcome to DataCo-op!")
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      {loading && (
        <LogoLoader
          fullScreen
          size="lg"
          message="Creating your DataCo-op Account..."
          submessage="Initializing verified wallet & data credentials"
        />
      )}

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Logo href="/" animated size="lg" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </CardDescription>
            <div className="flex gap-1 pt-2">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogle}
                >
                  Continue with Google
                </Button>
                <div className="my-6 flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                      Use at least 8 characters with a number and a letter.
                    </p>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
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
                  <Label htmlFor="phone">Phone</Label>
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
                      placeholder="Mumbai"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="400001"
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

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  By creating an account, you agree to share your verified purchase
                  data with brands via cohort tags. We never share your name, email,
                  phone, or order details with brands. You can delete your account and
                  all associated data at any time.
                </p>
                <ul className="space-y-2 text-sm">
                  <Bullet>I verify purchases with screenshots, not bank credentials</Bullet>
                  <Bullet>Brands only see aggregated, anonymized insights</Bullet>
                  <Bullet>You can opt out of any survey or category at any time</Bullet>
                  <Bullet>Withdraw earnings via UPI, no minimum hold</Bullet>
                </ul>
                <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/30">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">
                    I consent to DataCo-op processing my verified purchase data and
                    matching me with relevant research opportunities. I&apos;ve read
                    the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={next} className="flex-1">
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={submit}
                  className="flex-1"
                  disabled={loading || !form.consent}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
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
      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  )
}

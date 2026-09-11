"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Building2, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Logo } from "@/components/ui/logo"
import { LogoLoader } from "@/components/ui/logo-loader"

export default function BrandRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    website: "",
    industry: "",
    contactPerson: "",
    contactPhone: "",
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName || !form.email || !form.password || !form.industry) {
      toast.error("Please fill all required fields")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/brand/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Registration failed")
        return
      }

      // Auto sign-in
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInRes?.error) {
        toast.success("Account created! Please log in.")
        router.push("/brand/login")
        return
      }

      toast.success("Brand account created! Pending approval.")
      router.push("/brand/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      {loading && (
        <LogoLoader
          fullScreen
          size="lg"
          message="Registering Brand Account..."
          submessage="Setting up your brand intelligence dashboard"
        />
      )}

      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-background hover:bg-muted border px-3 py-1.5 rounded-full shadow-xs transition-all hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </Link>
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-2.5 py-0.5 rounded font-bold uppercase border border-primary/20">
            Enterprise Onboarding
          </span>
        </div>

        <div className="flex items-center justify-center mb-6">
          <Logo href="/" animated size="lg" subtitle="BRAND PARTNER" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Brand signup</CardTitle>
            </div>
            <CardDescription>
              Get verified consumer insights from real, transaction-backed buyers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name *</Label>
                <Input
                  id="companyName"
                  placeholder="Nike India"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={form.industry}
                  onValueChange={(v) => update("industry", v)}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FMCG">FMCG / Consumer Goods</SelectItem>
                    <SelectItem value="FASHION">Fashion & Apparel</SelectItem>
                    <SelectItem value="BEAUTY">Beauty & Personal Care</SelectItem>
                    <SelectItem value="ELECTRONICS">Electronics & Tech</SelectItem>
                    <SelectItem value="FOOD">Food & Beverage</SelectItem>
                    <SelectItem value="HEALTH">Health & Wellness</SelectItem>
                    <SelectItem value="FINANCE">Finance & Fintech</SelectItem>
                    <SelectItem value="AUTO">Automotive</SelectItem>
                    <SelectItem value="TRAVEL">Travel & Hospitality</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  "Create brand account"
                )}
              </Button>
            </form>

            <div className="mt-6 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              Your account will be reviewed within 24 hours. You&apos;ll receive an
              email once approved.
            </div>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link href="/brand/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Not a brand?{" "}
              <Link href="/register" className="text-primary hover:underline">
                User signup
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

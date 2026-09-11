"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Building2, Loader2, Mail, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { LogoLoader } from "@/components/ui/logo-loader"

export default function BrandLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error || !res?.ok) {
        toast.error("Invalid email or password")
        return
      }

      // Fetch session with retries to wait for JWT to propagate
      let session = null
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 400))
        const sessionRes = await fetch("/api/auth/session")
        session = await sessionRes.json()
        if (session?.user?.role) break
      }

      if (!session?.user) {
        toast.error("Session error — please try again")
        return
      }

      if (session.user.role !== "BRAND") {
        toast.error("This login is for brand accounts only")
        // Sign out the wrong-role user
        await fetch("/api/auth/signout", { method: "POST" })
        return
      }

      toast.success("Welcome back!")
      router.push("/brand/dashboard")
      router.refresh()
    } catch (err) {
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
          message="Authenticating Brand Account..."
          submessage="Connecting to verified intelligence portal"
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
            Enterprise Portal
          </span>
        </div>

        <div className="flex items-center justify-center mb-6">
          <Logo href="/" animated size="lg" subtitle="BRAND PARTNER" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Brand login</CardTitle>
            </div>
            <CardDescription>Access your research dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="brand-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="brand-password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="brand-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Don&apos;t have a brand account?{" "}
              <Link href="/brand/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Not a brand?{" "}
              <Link href="/login" className="text-primary hover:underline">
                User login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

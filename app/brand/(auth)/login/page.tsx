"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Sparkles, Building2, Loader2, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">DataCo-op</span>
        </Link>

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
                <Label htmlFor="brand-password">Password</Label>
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

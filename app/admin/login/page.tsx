"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { LogoLoader } from "@/components/ui/logo-loader"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await signIn("credentials", { email, password, redirect: false })

      if (res?.error || !res?.ok) {
        toast.error("Invalid credentials")
        return
      }

      // Retry fetching session to allow JWT cookie to propagate
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

      if (session.user.role !== "ADMIN") {
        toast.error("Admin access only")
        await fetch("/api/auth/signout", { method: "POST" })
        return
      }

      toast.success("Welcome, admin!")
      router.push("/admin")
      router.refresh()
    } catch {
      toast.error("Login failed")
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
          message="Authenticating Administrator..."
          submessage="Initializing root security clearance"
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
            Root Admin Portal
          </span>
        </div>

        <div className="flex items-center justify-center mb-6">
          <Logo href="/" animated size="lg" subtitle="ADMIN CONSOLE" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin login</CardTitle>
            <CardDescription>Restricted access — DataCo-op staff only</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    placeholder="admin@datacoop.in"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-0.5"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

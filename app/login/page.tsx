"use client"

import { useState, useTransition, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Mail, Lock, Loader2, KeyRound, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Logo } from "@/components/ui/logo"
import { LogoLoader } from "@/components/ui/logo-loader"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const errorParam = searchParams.get("error")

  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Password Sign-in handler
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        toast.error("Invalid email or password")
      } else {
        toast.success("Welcome back! Login alert sent to your email.")
        startTransition(() => {
          router.push(callbackUrl)
          router.refresh()
        })
      }
    } catch (err) {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  // Send Email OTP Code
  async function handleSendLoginOtp() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setSendingOtp(true)
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "login" }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to send login code")
        return
      }

      setOtpSent(true)
      setResendCooldown(60)
      toast.success(data.message || `Login code sent to ${email}`)
      if (data.devPreview) {
        toast.info(`[Dev Mode Code]: ${data.devPreview}`, { duration: 10000 })
      }
    } catch (err) {
      toast.error("Network error while sending login code")
    } finally {
      setSendingOtp(false)
    }
  }

  // OTP Sign-in handler
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit login code")
      return
    }
    if (loading) return
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        code: otpCode.trim(),
        redirect: false,
      })

      if (res?.error) {
        toast.error("Invalid or expired login code. Please request a new one.")
      } else {
        toast.success("Welcome back! Signed in with Email Code.")
        startTransition(() => {
          router.push(callbackUrl)
          router.refresh()
        })
      }
    } catch (err) {
      toast.error("Sign-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch (err) {
      toast.error("Google sign-in failed")
      setGoogleLoading(false)
    }
  }

  const isSubmitting = loading || isPending || googleLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      {isSubmitting && (
        <LogoLoader
          fullScreen
          size="lg"
          message={
            googleLoading
              ? "Connecting with Google..."
              : loginMethod === "otp"
              ? "Verifying Login Code..."
              : "Signing in to DataCo-op..."
          }
          submessage="Securing your session & sending notification alert..."
        />
      )}

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Logo href="/" animated size="lg" />
        </div>

        <Card className="border-2 border-[#1B3A5C]/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#1B3A5C]">Welcome back</CardTitle>
            <CardDescription className="font-medium text-[#5C6B73]">
              Log in to access your verified dashboard & surveys
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorParam && (
              <div className="mb-4 p-3 text-sm rounded-md bg-destructive/10 text-destructive font-medium">
                {errorParam === "CredentialsSignin"
                  ? "Invalid email, password, or verification code"
                  : "Sign in failed. Please try again."}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full font-bold border-2 border-[#1B3A5C]/20 hover:bg-[#EDE7DA]/40"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1 bg-[#1B3A5C]/20" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B73]">OR SIGN IN WITH</span>
              <Separator className="flex-1 bg-[#1B3A5C]/20" />
            </div>

            <Tabs
              value={loginMethod}
              onValueChange={(v) => setLoginMethod(v as "password" | "otp")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4 bg-muted/60">
                <TabsTrigger value="password" className="font-bold gap-2">
                  <Lock className="w-3.5 h-3.5" /> Password
                </TabsTrigger>
                <TabsTrigger value="otp" className="font-bold gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" /> Email Code (OTP)
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Password Login */}
              <TabsContent value="password">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
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
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-[#1B3A5C] hover:underline font-bold"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                        required
                        autoComplete="current-password"
                        minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white font-bold h-11"
                    disabled={loading || isPending}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Logging in...
                      </>
                    ) : (
                      "Log in with Password"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Tab 2: Email OTP Login */}
              <TabsContent value="otp">
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp-email">Email address</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                          autoComplete="email"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendLoginOtp}
                        disabled={sendingOtp || resendCooldown > 0 || !email}
                        className="shrink-0 font-bold border-2 border-[#1B3A5C]/30 text-[#1B3A5C]"
                      >
                        {sendingOtp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : resendCooldown > 0 ? (
                          `${resendCooldown}s`
                        ) : otpSent ? (
                          "Resend"
                        ) : (
                          "Send Code"
                        )}
                      </Button>
                    </div>
                    {otpSent && (
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> 6-digit code sent to your email!
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp-code">6-Digit Login Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="pl-9 tracking-[6px] text-lg font-mono font-bold"
                        required
                        disabled={!otpSent}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {otpSent
                        ? "Check your inbox (and spam folder) for the 6-digit code."
                        : "Click 'Send Code' above to receive your login code."}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white font-bold h-11"
                    disabled={loading || isPending || !otpSent || otpCode.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Authenticating...
                      </>
                    ) : (
                      "Sign in with Email Code"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#1B3A5C] hover:underline font-bold">
                Sign up
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Are you a brand?{" "}
              <Link href="/brand/login" className="text-[#1B3A5C] hover:underline font-semibold">
                Brand login
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="hover:text-foreground font-semibold">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="hover:text-foreground font-semibold">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

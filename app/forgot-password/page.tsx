"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Mail, Lock, KeyRound, Loader2, RefreshCw, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { LogoLoader } from "@/components/ui/logo-loader"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [sendingCode, setSendingCode] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Step 1: Send Reset Code to Email
  async function handleSendResetCode(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setSendingCode(true)
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "reset-password" }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to send reset code")
        return
      }

      toast.success(data.message || `Password reset code sent to ${email}`)
      if (data.devPreview) {
        toast.info(`[Dev Mode Code]: ${data.devPreview}`, { duration: 10000 })
      }
      setResendCooldown(60)
      setStep(2)
    } catch {
      toast.error("Network error while sending reset code")
    } finally {
      setSendingCode(false)
    }
  }

  // Step 2: Verify Code and Set New Password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()

    if (!code || code.trim().length !== 6) {
      toast.error("Please enter the 6-digit reset code sent to your email")
      return
    }

    if (!password || password.length < 8) {
      toast.error("New password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setResettingPassword(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: code.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to reset password")
        return
      }

      setSuccess(true)
      toast.success("Password reset successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch {
      toast.error("Network error while resetting password")
    } finally {
      setResettingPassword(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      {(sendingCode || resettingPassword) && (
        <LogoLoader
          fullScreen
          size="lg"
          message={sendingCode ? "Sending Security Code..." : "Updating your password..."}
          submessage="Securing your account credentials & sending confirmation..."
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
            Account Recovery
          </span>
        </div>

        <div className="flex items-center justify-center mb-6">
          <Logo href="/" animated size="lg" />
        </div>

        <Card className="border-2 border-[#1B3A5C]/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-[#1B3A5C]">
              {success
                ? "Password Reset Complete"
                : step === 1
                ? "Forgot Password"
                : "Reset Your Password"}
            </CardTitle>
            <CardDescription className="font-medium text-[#5C6B73]">
              {success
                ? "Your credentials have been securely updated"
                : step === 1
                ? "Enter your account email to receive a 6-digit reset code"
                : `Enter the code sent to ${email} and choose a new password`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <p className="text-sm text-[#4A4E69]">
                  Your password has been changed. A confirmation email has been sent to{" "}
                  <strong>{email}</strong>.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-[#1B3A5C] text-white font-bold"
                >
                  Proceed to Login
                </Button>
              </div>
            ) : step === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
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
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white font-bold h-11"
                  disabled={sendingCode || !email}
                >
                  {sendingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending Code...
                    </>
                  ) : (
                    "Send Password Reset Code"
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-[#1B3A5C] font-semibold hover:underline gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to login
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">6-Digit Reset Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="pl-9 tracking-[6px] text-lg font-mono font-bold"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change email
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || sendingCode}
                      onClick={() => handleSendResetCode()}
                      className="text-[#1B3A5C] font-bold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10"
                      required
                      minLength={8}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-0.5"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white font-bold h-11"
                  disabled={resettingPassword || code.length !== 6 || password.length < 8}
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Resetting password...
                    </>
                  ) : (
                    "Reset Password & Log In"
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-[#1B3A5C] font-semibold hover:underline gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Cancel and back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

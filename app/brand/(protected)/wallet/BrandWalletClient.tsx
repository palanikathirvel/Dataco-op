"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wallet, ShieldCheck, CheckCircle2 } from "lucide-react"

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000]

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function BrandWalletClient() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    loadRazorpayScript().then((ready) => {
      setSdkReady(ready)
    })
  }, [])

  async function addFunds() {
    const rupees = parseFloat(amount)
    if (isNaN(rupees) || rupees < 1000) {
      setError("Minimum top-up is ₹1,000")
      return
    }
    if (rupees > 500000) {
      setError("Maximum top-up per transaction is ₹5,00,000")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isReady = sdkReady || (await loadRazorpayScript())
      if (!isReady) {
        setError("Failed to load Razorpay payment SDK. Please check your internet connection.")
        setLoading(false)
        return
      }

      // 2. Create order on server
      const res = await fetch("/api/brand/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(rupees * 100) }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to initialize payment")
        setLoading(false)
        return
      }

      const { orderId, amount: amountPaise, currency, keyId, brandName, brandEmail } = data

      // 3. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: amountPaise,
        currency: currency || "INR",
        name: "DataCo-op",
        description: `Brand Wallet Top-Up (₹${rupees.toLocaleString("en-IN")})`,
        order_id: orderId,
        prefill: {
          name: brandName || "",
          email: brandEmail || "",
        },
        theme: {
          color: "#2563EB",
        },
        handler: async function (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) {
          setLoading(true)
          try {
            const verifyRes = await fetch("/api/brand/wallet/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amountPaise,
              }),
            })

            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) {
              setError(verifyData.error ?? "Payment verification failed")
              toast.error(verifyData.error ?? "Payment verification failed")
              return
            }

            toast.success(
              `Top-up of ₹${rupees.toLocaleString("en-IN")} credited successfully!`
            )
            setAmount("")
            router.refresh()
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr)
            setError("Failed to verify transaction with server")
            toast.error("Transaction verification failed")
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        setLoading(false)
        const errMsg = response.error?.description || "Payment failed or cancelled"
        setError(errMsg)
        toast.error(errMsg)
      })

      rzp.open()
    } catch (err: any) {
      console.error("Payment error:", err)
      setError("Failed to process payment. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="amount" className="text-xs font-semibold">
            Amount (₹)
          </Label>
          <span className="text-[11px] text-muted-foreground">Min ₹1,000</span>
        </div>
        <Input
          id="amount"
          type="number"
          step="1"
          min="1000"
          max="500000"
          placeholder="e.g. 10000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-11 text-base font-semibold"
        />
      </div>

      {/* Quick Amount Buttons */}
      <div className="space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground">Quick select:</p>
        <div className="grid grid-cols-5 gap-1.5">
          {QUICK_AMOUNTS.map((a) => (
            <Button
              key={a}
              type="button"
              variant={amount === String(a) ? "default" : "outline"}
              size="sm"
              className="text-xs h-8 px-1"
              onClick={() => setAmount(String(a))}
            >
              {a >= 1000 ? `₹${a / 1000}k` : `₹${a}`}
            </Button>
          ))}
        </div>
      </div>

      <Button
        onClick={addFunds}
        disabled={loading}
        className="w-full h-11 text-sm font-semibold tracking-wide gap-2 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing Payment...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" /> Add funds with Razorpay
          </>
        )}
      </Button>

      {/* Trust & payment methods banner */}
      <div className="pt-2 border-t flex flex-col gap-1.5 text-center items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Razorpay 256-bit SSL Secured</span>
        </div>
        <p className="text-[11px]">
          Supports UPI (GPay, PhonePe, Paytm), NetBanking, Credit/Debit Cards & Wallets
        </p>
      </div>
    </div>
  )
}

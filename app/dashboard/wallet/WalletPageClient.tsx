"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowRight, Zap } from "lucide-react"
import { formatINR } from "@/lib/utils"

export function WalletPageClient({
  balance,
  defaultUpiId,
}: {
  balance: number
  defaultUpiId: string
}) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [upiId, setUpiId] = useState(defaultUpiId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const minPaise = 50000 // ₹500
  const maxRupees = balance / 100
  const amountPaise = amount ? Math.round(parseFloat(amount) * 100) : 0
  const canWithdraw = amountPaise >= minPaise && amountPaise <= balance && upiId.trim().length > 0

  function setQuickAmount(val: number) {
    if (val <= maxRupees) {
      setAmount(val.toString())
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading || !canWithdraw) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          upiId: upiId.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Withdrawal failed")
        return
      }
      toast.success("Withdrawal request submitted! Processing via UPI within 24h.")
      setAmount("")
      router.refresh()
    } catch (err) {
      setError("Withdrawal request failed. Please check your network and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="py-2.5 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Amount Input with Quick Preset Chips */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="amount" className="text-xs font-semibold">Withdraw Amount (₹)</Label>
          <span className="text-[11px] text-muted-foreground">
            Max: <strong className="text-foreground">{formatINR(balance)}</strong>
          </span>
        </div>
        <Input
          id="amount"
          type="number"
          step="1"
          min="500"
          max={maxRupees}
          placeholder="Enter ₹ amount (e.g. 500)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-11 text-sm font-semibold"
        />

        {/* Quick presets for mobile touch */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[500, 1000, 2000].map((val) => {
            if (val > maxRupees && maxRupees >= 500) return null
            return (
              <button
                key={val}
                type="button"
                onClick={() => setQuickAmount(val)}
                className="px-2.5 py-1 text-[11px] font-medium rounded border bg-muted/40 hover:bg-muted active:scale-95 transition-all text-muted-foreground hover:text-foreground"
              >
                ₹{val}
              </button>
            )
          })}
          {maxRupees >= 500 && (
            <button
              type="button"
              onClick={() => setQuickAmount(Math.floor(maxRupees))}
              className="px-2.5 py-1 text-[11px] font-medium rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all"
            >
              Full Balance
            </button>
          )}
        </div>
      </div>

      {/* UPI ID input */}
      <div className="space-y-1.5">
        <Label htmlFor="upi" className="text-xs font-semibold">Your UPI ID (VPA)</Label>
        <Input
          id="upi"
          placeholder="username@okhdfcbank / number@paytm"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="h-11 text-sm font-mono"
        />
        <p className="text-[11px] text-muted-foreground">
          Funds are transferred directly to your bank account via UPI.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 text-xs sm:text-sm font-bold uppercase tracking-wider gap-2 shadow-sm"
        disabled={!canWithdraw || loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" /> Request UPI Withdrawal
          </>
        )}
      </Button>

      {balance < minPaise && (
        <div className="p-2.5 rounded-md bg-muted/50 border text-center">
          <p className="text-xs text-muted-foreground">
            Minimum required balance for payout is <strong className="text-foreground">{formatINR(minPaise)}</strong>.
          </p>
        </div>
      )}
    </form>
  )
}

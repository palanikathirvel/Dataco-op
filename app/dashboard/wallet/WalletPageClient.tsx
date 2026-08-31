"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
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
  const amountPaise = amount ? Math.round(parseFloat(amount) * 100) : 0
  const canWithdraw = amountPaise >= minPaise && amountPaise <= balance && upiId

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
          upiId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Withdrawal failed")
        return
      }
      toast.success("Withdrawal request submitted!")
      setAmount("")
      router.refresh()
    } catch (err) {
      setError("Withdrawal failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="500"
          max={balance / 100}
          placeholder="500.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min ₹500</span>
          <span>Max {formatINR(balance)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="upi">UPI ID</Label>
        <Input
          id="upi"
          placeholder="yourname@upi"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          e.g. name@okhdfcbank, name@paytm
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={!canWithdraw || loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          "Request withdrawal"
        )}
      </Button>

      {balance < minPaise && (
        <p className="text-xs text-muted-foreground text-center">
          You need at least {formatINR(minPaise)} to withdraw
        </p>
      )}
    </form>
  )
}

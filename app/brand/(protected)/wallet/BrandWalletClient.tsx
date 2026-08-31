"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wallet } from "lucide-react"

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000]

export function BrandWalletClient() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addFunds() {
    const rupees = parseFloat(amount)
    if (isNaN(rupees) || rupees < 1000) {
      setError("Minimum top-up is ₹1,000")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/brand/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(rupees * 100) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to add funds")
        return
      }
      // In production, this would open Razorpay checkout
      toast.success(
        `Razorpay integration coming soon. For now, contact admin to add ₹${rupees}.`
      )
      setAmount("")
    } catch (err) {
      setError("Failed to process payment")
    } finally {
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
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="1000"
          placeholder="10000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Min ₹1,000</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((a) => (
          <Button
            key={a}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount(String(a))}
          >
            ₹{a / 1000}k
          </Button>
        ))}
      </div>

      <Button onClick={addFunds} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" /> Add funds
          </>
        )}
      </Button>
    </div>
  )
}

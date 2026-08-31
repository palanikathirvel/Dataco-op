"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export function AdminPayoutActions({
  payoutId,
  amount,
}: {
  payoutId: string
  amount: number
}) {
  const router = useRouter()
  const [processOpen, setProcessOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)

  async function process() {
    if (!transactionId.trim()) {
      toast.error("Enter the UPI transaction ID")
      return
    }
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed")
        return
      }
      toast.success("Payout processed!")
      setProcessOpen(false)
      router.refresh()
    } catch {
      toast.error("Failed")
    } finally {
      setProcessing(false)
    }
  }

  async function reject() {
    if (!rejectReason.trim()) {
      toast.error("Enter a reason")
      return
    }
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed")
        return
      }
      toast.success("Payout rejected")
      setRejectOpen(false)
      router.refresh()
    } catch {
      toast.error("Failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="text-green-700 border-green-200 hover:bg-green-50"
          onClick={() => setProcessOpen(true)}
        >
          <CheckCircle2 className="h-4 w-4" /> Process
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-700 border-red-200 hover:bg-red-50"
          onClick={() => setRejectOpen(true)}
        >
          <XCircle className="h-4 w-4" /> Reject
        </Button>
      </div>

      {/* Process dialog */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process payout</DialogTitle>
            <DialogDescription>
              Confirm the UPI payment has been sent. The amount will be deducted
              from the user&apos;s wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-2">
              <Label htmlFor="txnId">UPI Transaction ID *</Label>
              <Input
                id="txnId"
                placeholder="e.g. NPCI123456789"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>
              Cancel
            </Button>
            <Button onClick={process} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payout</DialogTitle>
            <DialogDescription>
              The user&apos;s wallet will NOT be deducted. Enter a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason *</Label>
              <Input
                id="rejectReason"
                placeholder="e.g. Invalid UPI ID"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={reject} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

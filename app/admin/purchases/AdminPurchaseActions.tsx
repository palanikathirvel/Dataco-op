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

interface Props {
  purchaseId: string
}

export function AdminPurchaseActions({ purchaseId }: Props) {
  const router = useRouter()
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectLoading, setRejectLoading] = useState(false)

  async function verify() {
    setVerifyLoading(true)
    try {
      const res = await fetch(`/api/admin/purchases/${purchaseId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed")
        return
      }
      toast.success("Purchase verified! Tags generated.")
      router.refresh()
    } catch {
      toast.error("Failed to verify")
    } finally {
      setVerifyLoading(false)
    }
  }

  async function reject() {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason")
      return
    }
    setRejectLoading(true)
    try {
      const res = await fetch(`/api/admin/purchases/${purchaseId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed")
        return
      }
      toast.success("Purchase rejected")
      setRejectOpen(false)
      router.refresh()
    } catch {
      toast.error("Failed to reject")
    } finally {
      setRejectLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="text-green-700 border-green-200 hover:bg-green-50"
          onClick={verify}
          disabled={verifyLoading}
        >
          {verifyLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Verify
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-700 border-red-200 hover:bg-red-50"
          onClick={() => setRejectOpen(true)}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject purchase</DialogTitle>
            <DialogDescription>
              Provide a reason so the user can resubmit with corrections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection reason</Label>
              <Input
                id="reason"
                placeholder="e.g. Order ID format is incorrect"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={reject}
              disabled={rejectLoading}
            >
              {rejectLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

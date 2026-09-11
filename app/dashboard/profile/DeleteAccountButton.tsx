"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteAccountButton({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState("")
  const [loading, setLoading] = useState(false)

  const isConfirmed = confirmationInput.trim().toUpperCase() === "DELETE"

  async function handleDelete() {
    if (!isConfirmed || loading) return
    setLoading(true)

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to delete account")
        setLoading(false)
        return
      }

      toast.success("Account permanently deleted. Goodbye!")
      setOpen(false)

      // Sign out and redirect
      await signOut({ callbackUrl: "/register" })
    } catch {
      toast.error("Network error while deleting account. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2 shrink-0"
        >
          <Trash2 className="h-4 w-4" /> Delete Account Permanently
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-2 border-destructive/30">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-destructive">
            Delete Account Permanently?
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm text-muted-foreground pt-1">
            This action is <strong>irreversible</strong> and will permanently wipe your profile, verified receipts, wallet balance, and survey history under DPDP Act protocols.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3.5 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive space-y-1">
            <p className="font-bold">⚠️ Warning: The following will be erased:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-muted-foreground">
              <li>All verified receipts and purchase history</li>
              <li>Wallet earnings and pending UPI payouts</li>
              <li>Demographic and survey response cohort tags</li>
              <li>Account credentials and session tokens</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-confirm" className="text-xs font-semibold">
              Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm:
            </Label>
            <Input
              id="delete-confirm"
              placeholder="DELETE"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="font-mono uppercase text-sm border-destructive/30 focus-visible:ring-destructive"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            className="font-bold gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Purging Account...
              </>
            ) : (
              "Permanently Delete Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

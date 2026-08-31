"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Ban } from "lucide-react"

export function AdminBrandActions({
  brandId,
  status,
}: {
  brandId: string
  status: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(action: "approve" | "reject" | "suspend" | "reactivate") {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/brands/${brandId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed")
        return
      }
      toast.success(`Brand ${action}d`)
      router.refresh()
    } catch {
      toast.error("Failed")
    } finally {
      setLoading(false)
    }
  }

  if (status === "PENDING_APPROVAL") {
    return (
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="text-green-700 border-green-200 hover:bg-green-50"
          onClick={() => updateStatus("approve")}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-700 border-red-200 hover:bg-red-50"
          onClick={() => updateStatus("reject")}
          disabled={loading}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
      </div>
    )
  }

  if (status === "APPROVED") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateStatus("suspend")}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
        Suspend
      </Button>
    )
  }

  if (status === "SUSPENDED" || status === "REJECTED") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-green-700 border-green-200 hover:bg-green-50"
        onClick={() => updateStatus("reactivate")}
        disabled={loading}
      >
        <CheckCircle2 className="h-4 w-4" />
        Reactivate
      </Button>
    )
  }

  return null
}

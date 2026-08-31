import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/utils"
import {
  ShoppingBag,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react"

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const counts = {
    all: purchases.length,
    pending: purchases.filter((p) => p.status === "PENDING_VERIFICATION").length,
    verified: purchases.filter((p) => p.status === "VERIFIED").length,
    rejected: purchases.filter((p) => p.status === "REJECTED").length,
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Purchases</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your uploaded purchases and their verification status
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/purchases/new">
            <Plus className="h-4 w-4" /> Add purchase
          </Link>
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryPill label="All" count={counts.all} variant="default" />
        <SummaryPill label="Verified" count={counts.verified} variant="success" />
        <SummaryPill label="Pending" count={counts.pending} variant="pending" />
        <SummaryPill label="Rejected" count={counts.rejected} variant="destructive" />
      </div>

      {/* List */}
      {purchases.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Upload your order receipts to get matched with relevant surveys and earn money.
            </p>
            <Button asChild>
              <Link href="/dashboard/purchases/new">
                <Plus className="h-4 w-4" /> Upload your first purchase
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <PurchaseCard key={p.id} purchase={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryPill({
  label,
  count,
  variant,
}: {
  label: string
  count: number
  variant: "default" | "success" | "pending" | "destructive"
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge
        variant={
          variant === "success"
            ? "success"
            : variant === "pending"
            ? "pending"
            : variant === "destructive"
            ? "destructive"
            : "outline"
        }
      >
        {count}
      </Badge>
    </div>
  )
}

function PurchaseCard({ purchase }: { purchase: any }) {
  const status = purchase.status as string
  const statusConfig = {
    VERIFIED: { icon: CheckCircle2, variant: "success" as const, label: "Verified" },
    PENDING_VERIFICATION: { icon: Clock, variant: "pending" as const, label: "Pending" },
    REJECTED: { icon: XCircle, variant: "destructive" as const, label: "Rejected" },
  }
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.PENDING_VERIFICATION
  const StatusIcon = config.icon

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Screenshot thumbnail */}
          {purchase.screenshotUrl ? (
            <a
              href={purchase.screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 block"
            >
              <img
                src={purchase.screenshotUrl}
                alt={purchase.productName}
                className="h-14 w-14 rounded-lg object-cover border hover:ring-2 hover:ring-primary transition-all"
              />
            </a>
          ) : (
            <div className="h-14 w-14 rounded-lg border bg-muted flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-xs">
                {purchase.platform}
              </Badge>
              <Badge variant={config.variant} className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <h3 className="font-semibold truncate">{purchase.productName}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              {purchase.brand && <span>{purchase.brand}</span>}
              {purchase.category && <span>{purchase.category}</span>}
              <span>{formatINR(purchase.amount)}</span>
              {purchase.orderId && (
                <span className="font-mono">#{purchase.orderId}</span>
              )}
              <span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
            </div>
            {purchase.rejectReason && (
              <p className="text-xs text-destructive mt-2">
                Rejection reason: {purchase.rejectReason}
              </p>
            )}
          </div>

          {/* Actions */}
          {purchase.screenshotUrl && (
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <a href={purchase.screenshotUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

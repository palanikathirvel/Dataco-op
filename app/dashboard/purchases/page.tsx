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
  Calendar,
  Tag,
  Hash,
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
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Header - Responsive Flex */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My Purchases</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Uploaded purchase receipts and automated verification status
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0 shadow-sm">
          <Link href="/dashboard/purchases/new" className="flex items-center justify-center gap-1.5 font-bold">
            <Plus className="h-4 w-4" /> Add Purchase Receipt
          </Link>
        </Button>
      </div>

      {/* Summary Pills - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <SummaryPill label="All Receipts" count={counts.all} variant="default" />
        <SummaryPill label="Verified" count={counts.verified} variant="success" />
        <SummaryPill label="Pending" count={counts.pending} variant="pending" />
        <SummaryPill label="Rejected" count={counts.rejected} variant="destructive" />
      </div>

      {/* Purchases List */}
      {purchases.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-8 sm:p-14 text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-1">No purchase receipts uploaded yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Upload invoices or email confirmation receipts from Amazon, Flipkart, Swiggy, and Zomato to qualify for high-reward surveys and instant cashouts.
            </p>
            <Button asChild size="sm" className="font-bold">
              <Link href="/dashboard/purchases/new">
                <Plus className="h-4 w-4 mr-1.5" /> Upload Your First Purchase
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
    <div className="flex items-center justify-between rounded-lg border bg-card p-3 sm:px-4 sm:py-2.5 shadow-xs">
      <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
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
        className="font-mono text-xs px-2 py-0.5"
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
    PENDING_VERIFICATION: { icon: Clock, variant: "pending" as const, label: "Under Review" },
    REJECTED: { icon: XCircle, variant: "destructive" as const, label: "Rejected" },
  }
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.PENDING_VERIFICATION
  const StatusIcon = config.icon

  return (
    <Card className="shadow-xs hover:border-primary/40 transition-colors">
      <CardContent className="p-3.5 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          
          {/* Top Row on Mobile: Image + Platform + Status */}
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            {/* Screenshot Thumbnail */}
            {purchase.screenshotUrl ? (
              <a
                href={purchase.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 block"
                title="View Receipt Screenshot"
              >
                <img
                  src={purchase.screenshotUrl}
                  alt={purchase.productName}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover border border-border/80 hover:ring-2 hover:ring-primary transition-all bg-muted"
                />
              </a>
            ) : (
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
            )}

            {/* Badges on mobile visible next to image */}
            <div className="flex sm:hidden items-center gap-1.5">
              <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5">
                {purchase.platform}
              </Badge>
              <Badge variant={config.variant} className="text-[10px] font-bold px-1.5 py-0.5 flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Info Details */}
          <div className="flex-1 min-w-0">
            {/* Desktop Badges */}
            <div className="hidden sm:flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="font-mono text-xs uppercase font-bold">
                {purchase.platform}
              </Badge>
              <Badge variant={config.variant} className="text-xs font-bold flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>

            <h3 className="font-bold text-sm sm:text-base text-foreground truncate" title={purchase.productName}>
              {purchase.productName}
            </h3>

            {/* Metadata pills */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-muted-foreground mt-1.5">
              <span className="font-bold text-foreground text-xs sm:text-sm">
                {formatINR(purchase.amount)}
              </span>
              {purchase.brand && (
                <span className="inline-flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">
                  <Tag className="h-3 w-3" /> {purchase.brand}
                </span>
              )}
              {purchase.category && (
                <span className="inline-flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">
                  {purchase.category}
                </span>
              )}
              {purchase.orderId && (
                <span className="font-mono inline-flex items-center gap-0.5 bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">
                  <Hash className="h-3 w-3" /> {purchase.orderId}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px]">
                <Calendar className="h-3 w-3" />
                {new Date(purchase.purchaseDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </span>
            </div>

            {purchase.rejectReason && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2 mt-2">
                <strong>Rejection Reason:</strong> {purchase.rejectReason}
              </div>
            )}
          </div>

          {/* Action Button */}
          {purchase.screenshotUrl && (
            <div className="shrink-0 flex sm:flex-col items-end justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
              <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                <a href={purchase.screenshotUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> View Receipt
                </a>
              </Button>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/utils"
import { AdminPurchaseActions } from "./AdminPurchaseActions"
import { ShoppingBag, ExternalLink } from "lucide-react"

export default async function AdminPurchasesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const purchases = await prisma.purchase.findMany({
    select: {
      id: true,
      platform: true,
      productName: true,
      category: true,
      brand: true,
      amount: true,
      currency: true,
      orderId: true,
      purchaseDate: true,
      status: true,
      method: true,
      screenshotUrl: true,
      verifiedAt: true,
      rejectReason: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })


  const pending = purchases.filter((p) => p.status === "PENDING_VERIFICATION")
  const verified = purchases.filter((p) => p.status === "VERIFIED")
  const rejected = purchases.filter((p) => p.status === "REJECTED")

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Purchase verification</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Review and verify user-submitted purchase receipts
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <SummaryPill label="Pending" count={pending.length} variant="warning" />
        <SummaryPill label="Verified" count={verified.length} variant="success" />
        <SummaryPill label="Rejected" count={rejected.length} variant="destructive" />
      </div>

      {/* Pending queue */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold mb-3">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No pending verifications
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <AdminPurchaseCard key={p.id} purchase={p} />
            ))}
          </div>
        )}
      </section>

      {/* All recent */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold mb-3">All recent</h2>
        <div className="space-y-2">
          {purchases.slice(0, 30).map((p) => (
            <Card key={p.id}>
              <CardContent className="p-3.5 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.screenshotUrl ? (
                      <a
                        href={p.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 block"
                      >
                        <img
                          src={p.screenshotUrl}
                          alt={p.productName}
                          className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover border cursor-pointer hover:ring-2 hover:ring-primary"
                        />
                      </a>
                    ) : (
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <Badge variant="outline" className="text-xs">{p.platform}</Badge>
                        <Badge
                          variant={
                            p.status === "VERIFIED"
                              ? "success"
                              : p.status === "REJECTED"
                              ? "destructive"
                              : "pending"
                          }
                          className="text-xs"
                        >
                          {p.status === "PENDING_VERIFICATION" ? "Pending" : p.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm truncate">{p.productName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.user?.email} • {p.brand ?? "—"} • {formatINR(p.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-dashed">
                    <p>#{p.orderId}</p>
                    <p>{new Date(p.purchaseDate).toLocaleDateString()}</p>
                    {p.rejectReason && (
                      <p className="text-xs text-destructive mt-0.5">
                        Reason: {p.rejectReason}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
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
  variant: "warning" | "success" | "destructive"
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-3.5 sm:px-4 py-2">
      <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
      <Badge
        variant={
          variant === "success"
            ? "success"
            : variant === "warning"
            ? "pending"
            : "destructive"
        }
      >
        {count}
      </Badge>
    </div>
  )
}

function AdminPurchaseCard({ purchase }: { purchase: any }) {
  return (
    <Card className="border-yellow-200 bg-yellow-50/30">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex items-start gap-3 w-full sm:w-auto min-w-0">
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
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-cover border cursor-pointer hover:ring-2 hover:ring-primary"
                />
              </a>
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0 sm:hidden">
              <div className="flex items-center gap-1.5 mb-1">
                <Badge variant="outline" className="text-xs">{purchase.platform}</Badge>
                <Badge variant="pending" className="text-xs">Pending</Badge>
              </div>
              <h3 className="font-semibold text-sm truncate">{purchase.productName}</h3>
              <p className="text-xs font-semibold text-primary">{formatINR(purchase.amount)}</p>
            </div>
          </div>

          <div className="flex-1 min-w-0 hidden sm:block">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{purchase.platform}</Badge>
              <Badge variant="pending">Pending</Badge>
            </div>
            <h3 className="font-semibold text-base">{purchase.productName}</h3>
            <p className="text-sm text-muted-foreground">
              {purchase.user?.email} • {purchase.brand ?? "—"} •{" "}
              {formatINR(purchase.amount)}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Order #{purchase.orderId} • {purchase.category}
            </p>
            <p className="text-xs text-muted-foreground">
              Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}
            </p>
          </div>

          {/* Details on mobile only */}
          <div className="w-full sm:hidden space-y-1 text-xs text-muted-foreground">
            <p className="truncate">User: {purchase.user?.email}</p>
            <p className="font-mono">Order #{purchase.orderId} • {purchase.category}</p>
            <p>Date: {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
          </div>

          <div className="w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-dashed flex justify-end">
            <AdminPurchaseActions purchaseId={purchase.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

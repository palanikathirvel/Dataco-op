import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { AdminBrandActions } from "./AdminBrandActions"
import { Building2 } from "lucide-react"

export default async function AdminBrandsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const brands = await prisma.brand.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      industry: true,
      website: true,
      walletBalance: true,
      totalSpent: true,
      status: true,
      approvedAt: true,
      approvedBy: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })


  const pending = brands.filter((b) => b.status === "PENDING_APPROVAL")
  const approved = brands.filter((b) => b.status === "APPROVED")
  const suspended = brands.filter((b) => b.status === "SUSPENDED" || b.status === "REJECTED")

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Brands</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Approve, suspend, or view brand accounts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <SummaryPill label="Pending" count={pending.length} variant="warning" />
        <SummaryPill label="Approved" count={approved.length} variant="success" />
        <SummaryPill label="Suspended / Rejected" count={suspended.length} variant="destructive" />
      </div>

      {/* Pending queue */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-3">Pending approval ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((b) => (
              <Card key={b.id} className="border-yellow-200">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base truncate">{b.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{b.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.industry} •{" "}
                          {b.website ? (
                            <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {b.website}
                            </a>
                          ) : "No website"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Registered {new Date(b.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 sm:pt-0 border-t sm:border-0 border-dashed">
                      <AdminBrandActions brandId={b.id} status={b.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All brands */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold mb-3">All brands</h2>
        <Card>
          <CardContent className="divide-y p-0">
            {brands.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No brands yet</p>
            ) : (
              brands.map((b) => (
                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-dashed">
                    <span className="text-sm tabular-nums">
                      {formatINR(b.walletBalance)}
                    </span>
                    <Badge
                      variant={
                        b.status === "APPROVED"
                          ? "success"
                          : b.status === "PENDING_APPROVAL"
                          ? "pending"
                          : "destructive"
                      }
                    >
                      {b.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
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
          variant === "success" ? "success" : variant === "warning" ? "pending" : "destructive"
        }
      >
        {count}
      </Badge>
    </div>
  )
}

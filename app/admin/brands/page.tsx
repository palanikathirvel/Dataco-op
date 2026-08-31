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
    orderBy: { createdAt: "desc" },
  })

  const pending = brands.filter((b) => b.status === "PENDING_APPROVAL")
  const approved = brands.filter((b) => b.status === "APPROVED")
  const suspended = brands.filter((b) => b.status === "SUSPENDED" || b.status === "REJECTED")

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brands</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve, suspend, or view brand accounts
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryPill label="Pending" count={pending.length} variant="warning" />
        <SummaryPill label="Approved" count={approved.length} variant="success" />
        <SummaryPill label="Suspended / Rejected" count={suspended.length} variant="destructive" />
      </div>

      {/* Pending queue */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Pending approval ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((b) => (
              <Card key={b.id} className="border-yellow-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{b.name}</p>
                        <p className="text-sm text-muted-foreground">{b.email}</p>
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
                    <AdminBrandActions brandId={b.id} status={b.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All brands */}
      <section>
        <h2 className="text-lg font-semibold mb-3">All brands</h2>
        <Card>
          <CardContent className="divide-y p-0">
            {brands.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No brands yet</p>
            ) : (
              brands.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
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
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
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

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/utils"
import { AdminPayoutActions } from "./AdminPayoutActions"
import { DollarSign } from "lucide-react"

export default async function AdminPayoutsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const payouts = await prisma.payoutRequest.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, walletBalance: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = payouts.filter((p) => p.status === "PENDING")
  const completed = payouts.filter((p) => p.status === "COMPLETED")

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payout approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Process user withdrawal requests via UPI
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryPill label="Pending" count={pending.length} variant="warning" />
        <SummaryPill label="Completed" count={completed.length} variant="success" />
        <SummaryPill
          label="Total approved"
          count={formatINR(
            completed.reduce((sum, p) => sum + Number(p.amount), 0)
          )}
          variant="default"
        />
      </div>

      {/* Pending queue */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No pending payouts
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <Card key={p.id} className="border-yellow-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{p.user?.email}</p>
                        <Badge variant="pending">Pending</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        UPI: <code className="text-xs bg-muted px-1 py-0.5 rounded">{p.upiId}</code>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested {new Date(p.createdAt).toLocaleString()}
                      </p>
                      {p.user && Number(p.user.walletBalance) < Number(p.amount) && (
                        <p className="text-xs text-destructive mt-1">
                          Warning: User balance ({formatINR(Number(p.user.walletBalance))}) is less than payout amount ({formatINR(Number(p.amount))})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatINR(p.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {p.user ? formatINR(Number(p.user.walletBalance)) : "—"}
                        </p>
                      </div>
                      <AdminPayoutActions payoutId={p.id} amount={Number(p.amount)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Completed ({completed.length})</h2>
        <Card>
          <CardContent className="divide-y">
            {completed.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No completed payouts</p>
            ) : (
              completed.slice(0, 20).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{p.user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      UPI {p.upiId} • Processed{" "}
                      {p.processedAt
                        ? new Date(p.processedAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Completed</Badge>
                    <span className="text-sm font-semibold">
                      {formatINR(p.amount)}
                    </span>
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
  count: number | string
  variant: "warning" | "success" | "default"
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge
        variant={
          variant === "success"
            ? "success"
            : variant === "warning"
            ? "pending"
            : "outline"
        }
      >
        {count}
      </Badge>
    </div>
  )
}

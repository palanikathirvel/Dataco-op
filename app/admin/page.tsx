import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import {
  Users,
  Building2,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const [
    totalUsers,
    pendingPurchases,
    pendingPayouts,
    pendingBrands,
    recentUsers,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.purchase.count({ where: { status: "PENDING_VERIFICATION" } }),
    prisma.payoutRequest.count({ where: { status: "PENDING" } }),
    prisma.brand.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, walletBalance: true, createdAt: true },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Overview of your DataCo-op platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          href="/admin/users"
        />
        <StatCard
          label="Pending verifications"
          value={pendingPurchases.toString()}
          icon={ShoppingBag}
          href="/admin/purchases"
          tone="warning"
        />
        <StatCard
          label="Pending payouts"
          value={pendingPayouts.toString()}
          icon={DollarSign}
          href="/admin/payouts"
          tone="warning"
        />
        <StatCard
          label="Pending brands"
          value={pendingBrands.toString()}
          icon={Building2}
          href="/admin/brands"
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent users */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm sm:text-base">Recent signups</h2>
              <Badge variant="outline">{totalUsers} total</Badge>
            </div>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="font-semibold text-sm sm:text-base mb-4">Recent transactions</h2>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((t) => {
                  const incoming = t.type === "BRAND_DEPOSIT"
                  return (
                    <div key={t.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold shrink-0 tabular-nums ${
                          incoming ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {incoming ? "+" : "-"}
                        {formatINR(t.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string
  value: string
  icon: React.ElementType
  href?: string
  tone?: "default" | "warning"
}) {
  const content = (
    <Card className="hover-lift cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              tone === "warning"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
  if (href) return <Link href={href}>{content}</Link>
  return content
}

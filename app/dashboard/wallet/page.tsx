import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WalletPageClient } from "./WalletPageClient"
import { formatINR } from "@/lib/utils"
import { Wallet, TrendingUp, ArrowDownCircle, ArrowUpRight, History } from "lucide-react"

export default async function WalletPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const [user, transactions, payouts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, totalEarned: true, upiId: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.payoutRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  if (!user) redirect("/login")

  // Combine transactions and payouts into unified feed
  const feed = [
    ...transactions.map((t) => ({
      id: t.id,
      type: "transaction" as const,
      amount: Number(t.amount),
      description: t.description,
      status: (t.type as string) ?? "COMPLETED",
      createdAt: t.createdAt,
    })),
    ...payouts.map((p) => ({
      id: p.id,
      type: "payout" as const,
      amount: Number(p.amount),
      description: `Withdrawal to UPI ${p.upiId}`,
      status: p.status,
      createdAt: p.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20)

  const totalWithdrawn = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Wallet & Payouts</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Manage your verified balance and withdraw earnings directly via UPI
        </p>
      </div>

      {/* Stats Cards - Responsive 1 to 3 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <Card className="border-2 border-primary/20 bg-card shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Available Balance</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 text-primary">
                  {formatINR(user.walletBalance)}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Lifetime Earned</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 text-foreground">
                  {formatINR(user.totalEarned)}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Withdrawn</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 text-foreground">
                  {formatINR(totalWithdrawn)}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <ArrowDownCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Withdraw Form & Activity History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Withdraw form (5 cols on lg) */}
        <div className="lg:col-span-5">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Withdraw to UPI</CardTitle>
              </div>
              <CardDescription className="text-xs">Minimum withdrawal amount is ₹500</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <WalletPageClient
                balance={Number(user.walletBalance)}
                defaultUpiId={user.upiId ?? ""}
              />
            </CardContent>
          </Card>
        </div>

        {/* Transaction history (7 cols on lg) */}
        <div className="lg:col-span-7">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Transaction Activity</CardTitle>
              </div>
              <CardDescription className="text-xs">Your recent survey earnings and UPI payout transfers</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {feed.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed rounded-lg">
                  <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">No wallet activity yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Complete surveys and verify receipts to earn real rewards.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {feed.map((item) => {
                    const positive = item.type === "transaction"
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium truncate text-foreground">
                            {item.description}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {new Date(item.createdAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                          <Badge
                            variant={
                              item.status === "COMPLETED" || item.status === "EARNED"
                                ? "success"
                                : item.status === "REJECTED"
                                ? "destructive"
                                : "pending"
                            }
                            className="text-[10px] py-0 px-2 font-mono uppercase"
                          >
                            {item.status}
                          </Badge>
                          <span
                            className={`text-sm sm:text-base font-bold tabular-nums ${
                              positive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {positive ? "+" : "-"}
                            {formatINR(item.amount)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

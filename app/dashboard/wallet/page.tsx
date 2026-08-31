import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WalletPageClient } from "./WalletPageClient"
import { formatINR } from "@/lib/utils"
import { Wallet, TrendingUp, Download } from "lucide-react"

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

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Wallet & Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your balance and withdraw earnings via UPI
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-3xl font-bold mt-1">
                  {formatINR(user.walletBalance)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total earned</p>
            <p className="text-3xl font-bold mt-1">{formatINR(user.totalEarned)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total withdrawn</p>
            <p className="text-3xl font-bold mt-1">
              {formatINR(
                payouts
                  .filter((p) => p.status === "COMPLETED")
                  .reduce((sum, p) => sum + Number(p.amount), 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Withdraw form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw to UPI</CardTitle>
              <CardDescription>Minimum ₹500</CardDescription>
            </CardHeader>
            <CardContent>
              <WalletPageClient
                balance={Number(user.walletBalance)}
                defaultUpiId={user.upiId ?? ""}
              />
            </CardContent>
          </Card>
        </div>

        {/* Transaction history */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Your recent earnings and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              {feed.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity yet
                </p>
              ) : (
                <div className="space-y-2">
                  {feed.map((item) => {
                    const positive = item.type === "transaction"
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {item.status}
                          </Badge>
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              positive ? "text-green-700" : "text-red-700"
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

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { Wallet as WalletIcon, TrendingUp, TrendingDown } from "lucide-react"
import { BrandWalletClient } from "./BrandWalletClient"

export default async function BrandWalletPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BRAND") redirect("/brand/login")

  const [brand, transactions] = await Promise.all([
    prisma.brand.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, totalSpent: true },
    }),
    prisma.transaction.findMany({
      where: { brandId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  if (!brand) redirect("/brand/login")

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add funds and view your spending
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-3xl font-bold mt-1">
                  {formatINR(brand.walletBalance)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <WalletIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total spent</p>
            <p className="text-3xl font-bold mt-1">
              {formatINR(brand.totalSpent)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add funds</CardTitle>
              <CardDescription>Coming soon: Razorpay integration</CardDescription>
            </CardHeader>
            <CardContent>
              <BrandWalletClient />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Your recent wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((t) => {
                    const incoming = t.type === "BRAND_DEPOSIT"
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {t.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(t.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold tabular-nums ${
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
    </div>
  )
}

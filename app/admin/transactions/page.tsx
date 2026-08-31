import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"

export default async function AdminTransactionsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All platform transactions (last 200)
        </p>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {transactions.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No transactions yet</p>
          ) : (
            transactions.map((t) => {
              const incoming = t.type === "BRAND_DEPOSIT"
              return (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()} • {t.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="text-xs">{t.type}</Badge>
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        incoming ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {incoming ? "+" : "-"}
                      {formatINR(t.amount)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}

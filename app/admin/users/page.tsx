import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { Users } from "lucide-react"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      age: true,
      walletBalance: true,
      totalEarned: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })


  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Users</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          All registered users ({users.length} shown)
        </p>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {users.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No users yet</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                    {(u.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{u.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.city && (
                      <p className="text-xs text-muted-foreground">
                        {u.city} • {u.age ?? "—"}y
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-dashed">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatINR(u.walletBalance)}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Earned {formatINR(u.totalEarned)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      u.status === "ACTIVE"
                        ? "success"
                        : u.status === "BANNED"
                        ? "destructive"
                        : "pending"
                    }
                  >
                    {u.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

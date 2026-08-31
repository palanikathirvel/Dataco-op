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
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All registered users ({users.length} shown)
        </p>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {users.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No users yet</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                    {(u.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.city && (
                      <p className="text-xs text-muted-foreground">
                        {u.city} • {u.age ?? "—"}y
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatINR(u.walletBalance)}
                    </p>
                    <p className="text-xs text-muted-foreground">
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

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { ClipboardList } from "lucide-react"

export default async function AdminResearchPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const requests = await prisma.researchRequest.findMany({
    include: {
      brand: { select: { name: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Research requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All research across all brands
        </p>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {requests.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No research yet</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{r.brand.name}</Badge>
                    <Badge
                      variant={r.status === "ACTIVE" ? "success" : r.status === "EXPIRED" ? "destructive" : "pending"}
                      className="text-xs"
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r._count.responses} / {r.sampleSize} responses •{" "}
                    {formatINR(r.totalBudget)} budget
                  </p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

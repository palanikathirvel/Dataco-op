import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { PlusCircle, BarChart3, CheckCircle2, Clock, XCircle } from "lucide-react"

export default async function BrandResearchListPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BRAND") redirect("/brand/login")

  const requests = await prisma.researchRequest.findMany({
    where: { brandId: session.user.id },
    include: { _count: { select: { responses: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Research</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your research requests and their results
          </p>
        </div>
        <Button asChild>
          <Link href="/brand/research/new">
            <PlusCircle className="h-4 w-4" /> New research
          </Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No research yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first study to start collecting insights.
            </p>
            <Button asChild>
              <Link href="/brand/research/new">
                <PlusCircle className="h-4 w-4" /> Create research
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const statusConfig = {
              ACTIVE: { icon: CheckCircle2, variant: "success" as const },
              DRAFT: { icon: Clock, variant: "pending" as const },
              COMPLETED: { icon: CheckCircle2, variant: "default" as const },
              PAUSED: { icon: Clock, variant: "warning" as const },
              EXPIRED: { icon: XCircle, variant: "destructive" as const },
            }
            const cfg = statusConfig[r.status as keyof typeof statusConfig] ?? statusConfig.DRAFT
            const Icon = cfg.icon
            return (
              <Card key={r.id} className="hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={cfg.variant} className="text-xs">
                          <Icon className="h-3 w-3 mr-1" />
                          {r.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{r.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {r.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
                        <span>{r._count.responses} / {r.sampleSize} responses</span>
                        <span>•</span>
                        <span>{formatINR(Number(r.totalBudget))} budget</span>
                        <span>•</span>
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/brand/research/${r.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

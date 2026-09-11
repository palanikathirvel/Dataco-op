import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import {
  BarChart3,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react"

export default async function BrandDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BRAND") redirect("/brand/login")

  const [brand, researchRequests, recentResponses] = await Promise.all([
    prisma.brand.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        walletBalance: true,
        totalSpent: true,
        status: true,
        _count: { select: { researchRequests: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.researchRequest.findMany({
      where: { brandId: session.user.id },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.surveyResponse.findMany({
      where: {
        researchRequest: { brandId: session.user.id },
        status: "PAID",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  if (!brand) redirect("/brand/login")

  const stats = {
    active: researchRequests.filter((r) => r.status === "ACTIVE").length,
    total: researchRequests.length,
    responses: recentResponses.length,
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Brand Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Welcome back, {brand.name}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0 shadow-sm">
          <Link href="/brand/research/new" className="flex items-center justify-center gap-1.5 font-bold">
            <PlusCircle className="h-4 w-4" /> New Research Campaign
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active studies</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Responses collected</p>
                <p className="text-3xl font-bold mt-1">{stats.responses}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wallet balance</p>
                <p className="text-3xl font-bold mt-1">
                  {formatINR(brand.walletBalance)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Research requests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Research requests</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/brand/research">View all</Link>
          </Button>
        </div>

        {researchRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No research requests yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first research request to start collecting insights.
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
            {researchRequests.map((r) => {
              const statusConfig = {
                ACTIVE: { icon: CheckCircle2, variant: "success" as const },
                DRAFT: { icon: Clock, variant: "pending" as const },
                COMPLETED: { icon: CheckCircle2, variant: "default" as const },
                PAUSED: { icon: Clock, variant: "warning" as const },
                EXPIRED: { icon: XCircle, variant: "destructive" as const },
              }
              const cfg = statusConfig[r.status as keyof typeof statusConfig] ?? statusConfig.DRAFT
              const Icon = cfg.icon
              const progress = Math.round((r._count.responses / r.sampleSize) * 100)

              return (
                <Card key={r.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={cfg.variant} className="text-xs">
                            <Icon className="h-3 w-3 mr-1" />
                            {r.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{r.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                          <span>{r._count.responses} / {r.sampleSize} responses</span>
                          <span>•</span>
                          <span>{formatINR(r.pricePerResponse)} / response</span>
                          <span>•</span>
                          <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
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
      </section>
    </div>
  )
}

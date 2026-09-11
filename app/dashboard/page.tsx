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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Wallet,
  TrendingUp,
  ClipboardList,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"
import { formatINR, formatNumber } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const userId = session.user.id

  // Parallel queries
  const [user, availableSurveys, recentPurchases, recentResponses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, walletBalance: true, totalEarned: true },
    }),
    prisma.researchRequest.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
        // User hasn't already responded
        NOT: {
          responses: { some: { userId } },
        },
        // User has at least one matching cohort tag
        AND: [
          {
            brand: {
              is: {
                // Brand must be approved
                status: "APPROVED",
              },
            },
          },
        ],
      },
      include: {
        brand: { select: { name: true } },
        _count: { select: { responses: true } },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.surveyResponse.findMany({
      where: { userId },
      include: {
        researchRequest: { select: { title: true, brand: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  if (!user) redirect("/login")

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Here&apos;s what&apos;s happening with your verified data and survey earnings
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Wallet balance"
          value={formatINR(user.walletBalance)}
          icon={Wallet}
          href="/dashboard/wallet"
          tone="primary"
        />
        <StatCard
          label="Total earned"
          value={formatINR(user.totalEarned)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Available surveys"
          value={formatNumber(availableSurveys.length)}
          icon={ClipboardList}
          tone="muted"
        />
      </div>

      {/* Two columns: Surveys + Purchases */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Surveys */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Available surveys</h2>
              <p className="text-sm text-muted-foreground">
                Matched to your verified purchase data
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/surveys">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {availableSurveys.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No surveys available right now"
              description="Verify more purchases to get matched with relevant surveys."
              action={
                <Button asChild>
                  <Link href="/dashboard/purchases/new">
                    <ShoppingBag className="h-4 w-4" /> Add a purchase
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {availableSurveys.map((s) => (
                <Card key={s.id} className="hover-lift">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {s.brand.name}
                          </Badge>
                          <Badge variant="success">
                            {formatINR(s.pricePerResponse)}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{s.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {s.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                          <span>{s.sampleSize} target</span>
                          <span>•</span>
                          <span>{s._count.responses} responded</span>
                          {s.expiresAt && (
                            <>
                              <span>•</span>
                              <span>Expires {new Date(s.expiresAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/survey/${s.id}`}>Start</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent purchases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent purchases</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/purchases">
                All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentPurchases.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No purchases yet
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/dashboard/purchases/new">Add one</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentPurchases.map((p) => (
                <PurchaseRow key={p.id} purchase={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "muted",
}: {
  label: string
  value: string
  icon: React.ElementType
  href?: string
  tone?: "primary" | "success" | "muted"
}) {
  const content = (
    <Card className="hover-lift">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              tone === "primary"
                ? "bg-primary/10 text-primary"
                : tone === "success"
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

function PurchaseRow({ purchase }: { purchase: any }) {
  const status = purchase.status as string
  const StatusIcon =
    status === "VERIFIED"
      ? CheckCircle2
      : status === "REJECTED"
      ? XCircle
      : Clock
  const variant =
    status === "VERIFIED"
      ? "success"
      : status === "REJECTED"
      ? "destructive"
      : "pending"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {purchase.productName}
            </p>
            <p className="text-xs text-muted-foreground">
              {purchase.brand || purchase.platform} •{" "}
              {formatINR(purchase.amount)}
            </p>
          </div>
          <Badge variant={variant as any} className="shrink-0">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status === "PENDING_VERIFICATION" ? "Pending" : status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}

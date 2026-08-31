import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { formatINR } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
} from "lucide-react"

export default async function ResearchDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BRAND") redirect("/brand/login")

  const research = await prisma.researchRequest.findUnique({
    where: { id: params.id },
    include: {
      SurveyQuestion: { orderBy: { order: "asc" } },
      _count: { select: { responses: true } },
      responses: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          timeSpent: true,
          user: { select: { name: true, city: true, age: true, gender: true } },
        },
      },
    },
  })

  if (!research || research.brandId !== session.user.id) notFound()

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default" | "pending" }> = {
    ACTIVE: { label: "Active", variant: "success" },
    DRAFT: { label: "Draft", variant: "pending" },
    PENDING_PAYMENT: { label: "Pending Payment", variant: "warning" },
    PAUSED: { label: "Paused", variant: "warning" },
    COMPLETED: { label: "Completed", variant: "default" },
    EXPIRED: { label: "Expired", variant: "destructive" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
  }
  const cfg = statusConfig[research.status] ?? statusConfig.DRAFT
  const completion = Math.min(100, Math.round((research._count.responses / research.sampleSize) * 100))

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/brand/research"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Research
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold">{research.title}</h1>
            <p className="text-muted-foreground mt-1">{research.description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Responses</span>
            </div>
            <p className="text-2xl font-bold">{research._count.responses}</p>
            <p className="text-xs text-muted-foreground">of {research.sampleSize} target</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Completion</span>
            </div>
            <p className="text-2xl font-bold">{completion}%</p>
            <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Budget</span>
            </div>
            <p className="text-2xl font-bold">{formatINR(Number(research.totalBudget))}</p>
            <p className="text-xs text-muted-foreground">{formatINR(Number(research.pricePerResponse))} / response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Created</span>
            </div>
            <p className="text-sm font-semibold">{new Date(research.createdAt).toLocaleDateString()}</p>
            {research.expiresAt && (
              <p className="text-xs text-muted-foreground">
                Expires {new Date(research.expiresAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Target cohorts */}
      {research.targetCohorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Target Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {research.targetCohorts.map((c) => (
                <Badge key={c} variant="secondary">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Survey questions */}
      {research.SurveyQuestion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Survey Questions ({research.SurveyQuestion.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {research.SurveyQuestion.map((q, i) => (
              <div key={q.id} className="flex gap-3">
                <span className="text-sm font-mono text-muted-foreground w-6 shrink-0">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{q.question}</p>
                  {q.options.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {q.options.map((opt) => (
                        <span key={opt} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground mt-1 block">{q.type}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent responses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {research.responses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No responses yet.</p>
          ) : (
            <div className="space-y-2">
              {research.responses.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {r.user.name?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.user.name ?? "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">
                        {[r.user.city, r.user.gender, r.user.age ? `${r.user.age}y` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.timeSpent && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(r.timeSpent / 60)}m
                      </span>
                    )}
                    <Badge
                      variant={
                        r.status === "APPROVED" || r.status === "PAID"
                          ? "success"
                          : r.status === "REJECTED"
                          ? "destructive"
                          : "pending"
                      }
                      className="text-xs"
                    >
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

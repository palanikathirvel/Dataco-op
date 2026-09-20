import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, ArrowRight, Sparkles, ShoppingBag } from "lucide-react"
import { formatINR } from "@/lib/utils"

export default async function SurveysPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const [available, completed] = await Promise.all([
    prisma.researchRequest.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
        NOT: { responses: { some: { userId: session.user.id } } },
      },
      include: {
        brand: { select: { name: true } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.surveyResponse.findMany({
      where: { userId: session.user.id },
      include: {
        researchRequest: {
          include: { brand: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Available Surveys</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Complete high-reward verified surveys tailored to your buying habits. Payouts credit instantly.
        </p>
      </div>

      {/* Available */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available ({available.length})</h2>
        </div>

        {available.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No surveys available right now</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Add more verified purchases to get matched with relevant surveys.
              </p>
              <Button asChild>
                <Link href="/dashboard/purchases/new">
                  <ShoppingBag className="h-4 w-4" /> Add a purchase
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {available.map((s) => (
              <Card key={s.id} className="hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{s.brand.name}</Badge>
                        <Badge variant="success">{formatINR(s.pricePerResponse)}</Badge>
                      </div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {s.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
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
                      <Link href={`/survey/${s.id}`}>
                        Start <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Your responses ({completed.length})</h2>

        {completed.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              You haven&apos;t completed any surveys yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {completed.map((r) => {
              const status = r.status as string
              const variant =
                status === "PAID"
                  ? "success"
                  : status === "APPROVED"
                  ? "success"
                  : status === "REJECTED"
                  ? "destructive"
                  : "pending"
              return (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {r.researchRequest.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.researchRequest.brand.name} •{" "}
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={variant as any}>{status.replace("_", " ")}</Badge>
                      </div>
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

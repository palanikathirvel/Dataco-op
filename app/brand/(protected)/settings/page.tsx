import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  User,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { DeleteBrandAccountButton } from "./DeleteBrandAccountButton"

export const metadata = {
  title: "Brand Settings & Profile | DataCo-op",
  description: "Manage your brand account profile, company verification details, and account security.",
}

export default async function BrandSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BRAND") {
    redirect("/brand/login")
  }

  const brand = await prisma.brand.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          researchRequests: true,
          transactions: true,
        },
      },
    },
  })

  if (!brand) redirect("/brand/login")

  const isApproved = brand.status === "APPROVED"
  const isPending = brand.status === "PENDING_APPROVAL"

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Brand Settings & Profile</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Review your organization profile, corporate KYC, and brand account security.
        </p>
      </div>

      {/* Brand Identity Card */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold truncate">
                {brand.name}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Registered on {new Date(brand.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
              </CardDescription>
            </div>
            <Badge
              variant={isApproved ? "success" : isPending ? "pending" : "destructive"}
              className="text-xs py-1 px-2.5 uppercase font-mono tracking-wider flex items-center gap-1.5"
            >
              {isApproved ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approved Brand
                </>
              ) : isPending ? (
                <>
                  <Clock className="h-3.5 w-3.5" /> Pending Approval
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" /> Suspended
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <Field icon={Mail} label="Brand Work Email" value={brand.email} />
            {brand.website && (
              <Field
                icon={Globe}
                label="Company Website"
                value={
                  <a
                    href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {brand.website}
                  </a>
                }
              />
            )}
            {brand.industry && (
              <Field icon={Briefcase} label="Industry / Sector" value={brand.industry} />
            )}
            {brand.contactPerson && (
              <Field icon={User} label="Primary Contact" value={brand.contactPerson} />
            )}
            {brand.contactPhone && (
              <Field icon={Phone} label="Contact Phone" value={brand.contactPhone} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Activity Summary */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Financial & Research Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-medium">Wallet Balance</p>
              <p className="text-2xl font-bold mt-1 text-primary">
                {formatINR(brand.walletBalance)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-medium">Total Research Spent</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                {formatINR(brand.totalSpent)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-medium">Research Campaigns</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                {brand._count.researchRequests} Created
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <CardTitle className="text-base sm:text-lg text-destructive font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-xs text-destructive/80">
            Permanently terminate your brand organization and delete all research assets.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">
              Permanently delete brand account and purge data
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xl">
              Once deleted, all your active and draft research campaigns, survey questions, audience responses, and brand wallet data will be completely wiped. This action cannot be undone.
            </p>
          </div>
          <DeleteBrandAccountButton brandName={brand.name} />
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border/40">
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="text-xs sm:text-sm font-semibold mt-0.5 truncate text-foreground">{value}</div>
      </div>
    </div>
  )
}

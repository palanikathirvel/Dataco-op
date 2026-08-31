import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { formatINR } from "@/lib/utils"
import {
  Building2,
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  Wallet,
  LogOut,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function BrandProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/brand/login")

  // Verify this is a brand
  if (session.user.role !== "BRAND") {
    if (session.user.role === "ADMIN") redirect("/admin")
    redirect("/login")
  }

  const brand = await prisma.brand.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, status: true, walletBalance: true },
  })

  if (!brand) redirect("/brand/login")

  const isApproved = brand.status === "APPROVED"

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">DataCo-op</span>
          </Link>
        </div>

        {/* Approval notice */}
        {!isApproved && (
          <div className="mx-3 mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <XCircle className="h-3.5 w-3.5" />
              Account under review
            </div>
            <p>Your account is pending approval. You can create research but cannot publish until approved.</p>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1">
          <BrandNavItem href="/brand/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <BrandNavItem href="/brand/research" icon={BarChart3} label="Research" />
          <BrandNavItem href="/brand/research/new" icon={PlusCircle} label="New research" />
          <BrandNavItem href="/brand/wallet" icon={Wallet} label="Wallet" />
        </nav>

        {/* Brand info */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{brand.name}</p>
              <Badge
                variant={isApproved ? "success" : "warning"}
                className="mt-1 text-xs"
              >
                {brand.status === "APPROVED" ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Approved</>
                ) : (
                  brand.status
                )}
              </Badge>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full mt-3"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}

function BrandNavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ElementType
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

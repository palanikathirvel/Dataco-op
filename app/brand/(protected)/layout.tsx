import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import {
  Building2,
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  Wallet,
  LogOut,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"

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

  const navItems = [
    { href: "/brand/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/brand/research", icon: BarChart3, label: "Research" },
    { href: "/brand/research/new", icon: PlusCircle, label: "New Project" },
    { href: "/brand/wallet", icon: Wallet, label: "Wallet" },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-background border-b sticky top-0 z-40">
        <Logo href="/" animated size="xs" subtitle="BRAND" />
        <div className="flex items-center gap-2">
          <Badge
            variant={isApproved ? "success" : "warning"}
            className="text-[10px] py-0 px-1.5"
          >
            {isApproved ? "Approved" : "Review"}
          </Badge>
          <span className="text-xs font-semibold truncate max-w-[100px]">{brand.name}</span>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg flex justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-1 text-[10px] font-medium text-muted-foreground hover:text-primary active:text-primary"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Logo href="/" animated size="sm" subtitle="BRAND" />
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
          {navItems.map((item) => (
            <BrandNavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
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

      <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
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

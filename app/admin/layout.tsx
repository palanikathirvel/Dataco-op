import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Building2,
  ShoppingBag,
  ClipboardList,
  DollarSign,
  ArrowLeftRight,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/brands", icon: Building2, label: "Brands" },
    { href: "/admin/purchases", icon: ShoppingBag, label: "Purchases" },
    { href: "/admin/research", icon: ClipboardList, label: "Research" },
    { href: "/admin/payouts", icon: DollarSign, label: "Payouts" },
    { href: "/admin/transactions", icon: ArrowLeftRight, label: "Transactions" },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-background border-b sticky top-0 z-40 shadow-sm">
        <Logo href="/" animated size="xs" subtitle="ADMIN CONSOLE" />
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2.5 py-0.5 rounded font-bold uppercase border border-primary/20">
          Root Access
        </span>
      </div>

      {/* Mobile Horizontal Navigation Scroll */}
      <div className="md:hidden overflow-x-auto no-scrollbar whitespace-nowrap px-3 py-2 bg-background/95 backdrop-blur border-b flex gap-1.5 sticky top-[49px] z-30 shadow-xs">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all shrink-0"
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Logo href="/" animated size="sm" subtitle="ADMIN" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <AdminNavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}

function AdminNavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
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

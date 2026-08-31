import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, LayoutDashboard, Users, Building2, ShoppingBag, ClipboardList, DollarSign, ArrowLeftRight } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  // Admin role check — use the admin-specific login
  // Check if this is the admin user (by email or role)
  if (session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 shrink-0 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">DataCo-op</span>
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <AdminNavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
          <AdminNavItem href="/admin/users" icon={Users} label="Users" />
          <AdminNavItem href="/admin/brands" icon={Building2} label="Brands" />
          <AdminNavItem href="/admin/purchases" icon={ShoppingBag} label="Purchase verification" />
          <AdminNavItem href="/admin/research" icon={ClipboardList} label="Research requests" />
          <AdminNavItem href="/admin/payouts" icon={DollarSign} label="Payout approvals" />
          <AdminNavItem href="/admin/transactions" icon={ArrowLeftRight} label="Transactions" />
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

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SignOutButton } from "./SignOutButton"
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Wallet,
  User,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if (session.user.role === "BRAND") redirect("/brand/dashboard")
  if (session.user.role === "ADMIN") redirect("/admin")

  const name = session.user.name ?? "User"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/purchases", icon: ShoppingBag, label: "Purchases" },
    { href: "/dashboard/surveys", icon: ClipboardList, label: "Surveys" },
    { href: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-background border-b sticky top-0 z-40">
        <Logo href="/" animated size="xs" />
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <Link href="/dashboard/profile" className="text-xs font-medium text-foreground">
            {name.split(" ")[0]}
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar for quick thumb access */}
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
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <Logo href="/" animated size="sm" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content with bottom padding on mobile for the bottom bar */}
      <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
    </div>
  )
}

function NavItem({
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
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

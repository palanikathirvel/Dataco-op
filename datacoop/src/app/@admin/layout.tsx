import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogOut, LayoutDashboard, Users, Building2, FileText, DollarSign, CreditCard, Receipt, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatCurrency, getInitials } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Brands", href: "/admin/brands", icon: Building2 },
  { name: "Purchases", href: "/admin/purchases", icon: Receipt },
  { name: "Research", href: "/admin/research", icon: BarChart3 },
  { name: "Payouts", href: "/admin/payouts", icon: CreditCard },
  { name: "Transactions", href: "/admin/transactions", icon: DollarSign },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r bg-muted/30 h-screen sticky top-0">
        <div className="p-4 border-b">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-destructive-foreground" />
            </div>
            <span className="font-semibold text-xl">DataCoop Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(admin?.name || admin?.email || "A")}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium">{admin?.name}</p>
                    <p className="text-xs text-muted-foreground">{admin?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action="/api/auth/logout" method="POST">
                      <button type="submit" className="flex w-full items-center gap-2 text-red-600">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
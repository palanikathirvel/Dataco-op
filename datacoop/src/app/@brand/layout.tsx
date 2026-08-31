import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Wallet, BarChart3, PlusCircle, CreditCard, LogOut, LayoutDashboard, Settings, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatCurrency, getInitials } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/brand/dashboard", icon: LayoutDashboard },
  { name: "Research", href: "/brand/research", icon: BarChart3 },
  { name: "Create Research", href: "/brand/research/new", icon: PlusCircle },
  { name: "Wallet", href: "/brand/wallet", icon: CreditCard },
];

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "BRAND") {
    redirect("/login");
  }

  const brand = await prisma.brand.findUnique({
    where: { id: session.brandId || session.userId },
    select: { name: true, email: true, walletBalance: true, status: true },
  });

  if (brand?.status !== "APPROVED") {
    redirect("/brand/pending-approval");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/brand/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-xl">DataCoop</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              <Wallet className="h-4 w-4" />
              {formatCurrency(Number(brand?.walletBalance || 0))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(brand?.name || brand?.email || "B")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="px-2 py-1">
                  <p className="text-sm font-medium">{brand?.name}</p>
                  <p className="text-xs text-muted-foreground">{brand?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/brand/settings" className="flex items-center gap-2">
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
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
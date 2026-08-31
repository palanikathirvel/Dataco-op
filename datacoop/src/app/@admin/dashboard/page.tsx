import { Suspense } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Building2, DollarSign, Receipt, TrendingUp, CreditCard, FileText } from "lucide-react";

async function DashboardContent() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = cookieStore.get("auth-token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/stats`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: "no-store",
  });
  const data = await res.json();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={data.totalUsers} icon={<Users className="h-5 w-5" />} trend={{ value: data.userGrowth, label: "vs last month", positive: data.userGrowth >= 0 }} />
        <StatsCard title="Total Brands" value={data.totalBrands} icon={<Building2 className="h-5 w-5" />} trend={{ value: data.brandGrowth, label: "vs last month", positive: data.brandGrowth >= 0 }} />
        <StatsCard title="Revenue Today" value={formatCurrency(data.revenueToday)} icon={<DollarSign className="h-5 w-5" />} trend={{ value: data.revenueGrowth, label: "vs yesterday", positive: data.revenueGrowth >= 0 }} />
        <StatsCard title="Pending Verifications" value={data.pendingVerifications} icon={<Receipt className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentUsers?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "name", header: "Name" },
                  { accessorKey: "email", header: "Email" },
                  { accessorKey: "city", header: "City" },
                  { accessorKey: "walletBalance", header: "Wallet", cell: (info) => formatCurrency(info.getValue()) },
                  { accessorKey: "status", header: "Status" },
                  { accessorKey: "createdAt", header: "Joined", cell: (info) => formatDate(info.getValue()) },
                ]}
                data={data.recentUsers}
                pageSize={5}
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">No users yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Brands</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentBrands?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "name", header: "Brand" },
                  { accessorKey: "email", header: "Email" },
                  { accessorKey: "industry", header: "Industry" },
                  { accessorKey: "status", header: "Status" },
                  { accessorKey: "walletBalance", header: "Wallet", cell: (info) => formatCurrency(info.getValue()) },
                  { accessorKey: "createdAt", header: "Registered", cell: (info) => formatDate(info.getValue()) },
                ]}
                data={data.recentBrands}
                pageSize={5}
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">No brands yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingPurchases?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "productName", header: "Product" },
                  { accessorKey: "user.name", header: "User", cell: (info) => info.getValue() },
                  { accessorKey: "category", header: "Category" },
                  { accessorKey: "amount", header: "Amount", cell: (info) => formatCurrency(info.getValue()) },
                  { accessorKey: "method", header: "Method" },
                  { accessorKey: "createdAt", header: "Submitted", cell: (info) => formatDate(info.getValue()) },
                ]}
                data={data.pendingPurchases}
                pageSize={5}
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">No pending verifications</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingPayouts?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "user.name", header: "User", cell: (info) => info.getValue() },
                  { accessorKey: "amount", header: "Amount", cell: (info) => formatCurrency(info.getValue()) },
                  { accessorKey: "upiId", header: "UPI" },
                  { accessorKey: "createdAt", header: "Requested", cell: (info) => formatDate(info.getValue()) },
                ]}
                data={data.pendingPayouts}
                pageSize={5}
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">No pending payouts</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Research</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activeResearch?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "title", header: "Study" },
                  { accessorKey: "brand.name", header: "Brand", cell: (info) => info.getValue() },
                  { accessorKey: "status", header: "Status" },
                  { accessorKey: "_count.responses", header: "Responses" },
                  { accessorKey: "sampleSize", header: "Target" },
                ]}
                data={data.activeResearch}
                pageSize={5}
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">No active research</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="animate-pulse space-y-6">Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
import { Suspense } from "react";
import { WalletCard } from "@/components/ui/wallet-card";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Users, DollarSign, TrendingUp, BarChart3, Clock } from "lucide-react";
import Link from "next/link";

async function DashboardContent() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = cookieStore.get("auth-token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/brand/dashboard`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: "no-store",
  });
  const data = await res.json();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Dashboard</h1>
          <p className="text-muted-foreground">Overview of your research studies and wallet</p>
        </div>
        <Link href="/brand/research/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> New Research</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WalletCard
          balance={data.walletBalance}
          totalEarned={data.totalSpent}
          isBrand
          onAddFunds={() => {}}
        />
        <StatsCard
          title="Active Studies"
          value={data.activeStudies?.length || 0}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Responses"
          value={data.totalResponses || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Spent"
          value={formatCurrency(data.totalSpent)}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Studies</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activeStudies?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "title", header: "Study", cell: (info) => (
                    <Link href={`/brand/research/${info.row.original.id}`} className="font-medium hover:underline">
                      {info.getValue()}
                    </Link>
                  )},
                  { accessorKey: "status", header: "Status" },
                  { accessorKey: "sampleSize", header: "Sample Size" },
                  { accessorKey: "_count.responses", header: "Responses" },
                  { accessorKey: "pricePerResponse", header: "Per Response", cell: (info) => formatCurrency(info.getValue()) },
                  { accessorKey: "expiresAt", header: "Expires", cell: (info) => info.getValue() ? formatDate(info.getValue()) : "No expiry" },
                ]}
                data={data.activeStudies}
                pageSize={5}
              />
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-2 font-medium">No active studies</h3>
                <p className="text-muted-foreground text-sm">Create your first research study</p>
                <Link href="/brand/research/new">
                  <Button className="mt-4 gap-2"><Plus className="h-4 w-4" /> Create Study</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTransactions?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "type", header: "Type" },
                  { accessorKey: "amount", header: "Amount", cell: (info) => {
                    const t = info.row.original;
                    const prefix = t.type === "BRAND_DEPOSIT" ? "+" : "-";
                    return <span className={t.type === "BRAND_DEPOSIT" ? "text-green-600" : "text-red-600"}>{prefix}{formatCurrency(info.getValue())}</span>;
                  }},
                  { accessorKey: "description", header: "Description" },
                  { accessorKey: "createdAt", header: "Date", cell: (info) => formatDate(info.getValue()) },
                ]}
                data={data.recentTransactions}
                pageSize={5}
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent transactions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BrandDashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="animate-pulse space-y-6">Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
import { Suspense } from "react";
import { WalletCard } from "@/components/ui/wallet-card";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { CohortBadgeGroup } from "@/components/ui/cohort-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowRight, Users, TrendingUp, Clock, Package, Wallet,
  ImageIcon, CheckCircle, XCircle, ClockIcon,
} from "lucide-react";
import Link from "next/link";

async function DashboardContent() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = cookieStore.get("auth-token")?.value;
  const base = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`;

  const [dashboardRes, purchasesRes] = await Promise.all([
    fetch(`${base}/api/user/dashboard`, {
      headers: { Cookie: `auth-token=${token}` },
      cache: "no-store",
    }),
    fetch(`${base}/api/user/purchases`, {
      headers: { Cookie: `auth-token=${token}` },
      cache: "no-store",
    }),
  ]);

  const data = await dashboardRes.json();
  const purchasesData = await purchasesRes.json();
  const purchases = purchasesData.purchases || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {data.availableSurveys?.length || 0} surveys available
          </span>
          <Link href="/dashboard/purchases/new">
            <Button size="sm" className="gap-2">
              <Package className="h-4 w-4" /> Add Purchase
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WalletCard
          balance={data.walletBalance}
          totalEarned={data.totalEarned}
        />
        <StatsCard
          title="Verified Purchases"
          value={data.purchases?.length || 0}
          icon={<Package className="h-5 w-5" />}
        />
        <StatsCard
          title="Available Surveys"
          value={data.availableSurveys?.length || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Earned"
          value={formatCurrency(data.totalEarned)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cohorts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            {data.cohortTags?.length > 0 ? (
              <CohortBadgeGroup tags={data.cohortTags} />
            ) : (
              <p className="text-muted-foreground text-sm">Complete purchase verification to unlock cohorts</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/purchases">
              <Button variant="outline" className="gap-2 h-auto py-4 flex-col text-left">
                <Package className="h-5 w-5" />
                <span className="font-medium">My Purchases</span>
                <p className="text-xs text-muted-foreground">View and manage purchases</p>
              </Button>
            </Link>
            <Link href="/dashboard/wallet">
              <Button variant="outline" className="gap-2 h-auto py-4 flex-col text-left">
                <Wallet className="h-5 w-5" />
                <span className="font-medium">Wallet & Payouts</span>
                <p className="text-xs text-muted-foreground">Balance & withdrawals</p>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Available Surveys */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Available Surveys</CardTitle>
          {data.availableSurveys?.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {data.availableSurveys.length} matched for you
            </span>
          )}
        </CardHeader>
        <CardContent>
          {data.availableSurveys?.length > 0 ? (
            <DataTable
              columns={[
                { accessorKey: "brand.name", header: "Brand", cell: (info) => info.getValue() },
                { accessorKey: "title", header: "Survey" },
                { accessorKey: "description", header: "Description", cell: (info) => <span className="max-w-xs truncate block">{info.getValue()}</span> },
                { accessorKey: "pricePerResponse", header: "Payout", cell: (info) => formatCurrency(info.getValue()) },
                { accessorKey: "questionCount", header: "Questions" },
                {
                  accessorKey: "actions",
                  header: "",
                  cell: (info) => {
                    const row = info.row.original;
                    if (row.hasResponded) {
                      return <Button variant="outline" size="sm" disabled>Completed</Button>;
                    }
                    return (
                      <Link href={`/survey/${row.id}`}>
                        <Button size="sm">Start Survey</Button>
                      </Link>
                    );
                  },
                },
              ]}
              data={data.availableSurveys}
              searchKey="surveys"
            />
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <h3 className="mt-4 font-medium text-xl">No surveys available</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                No surveys available right now. Verify more purchases to get matched!
              </p>
              <Link href="/dashboard/purchases">
                <Button className="mt-4 gap-2">
                  <Package className="h-4 w-4" /> Add Purchase
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Purchases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Purchases</CardTitle>
          <Link href="/dashboard/purchases" className="text-sm text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4 inline" />
          </Link>
        </CardHeader>
        <CardContent>
          {purchases.length > 0 ? (
            <DataTable
              columns={[
                { accessorKey: "productName", header: "Product", cell: (info) => {
                  const row = info.row.original;
                  return (
                    <div className="flex items-center gap-3">
                      {row.screenshotUrl && (
                        <img
                          src={row.screenshotUrl}
                          alt={row.productName}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{info.getValue()}</p>
                        <p className="text-xs text-muted-foreground">{row.platform}</p>
                      </div>
                    </div>
                  );
                }},
                { accessorKey: "category", header: "Category" },
                { accessorKey: "amount", header: "Amount", cell: (info) => formatCurrency(info.getValue()) },
                { accessorKey: "orderId", header: "Order ID" },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: (info) => {
                    const status = info.getValue() as string;
                    if (status === "VERIFIED") return <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Verified</span>;
                    if (status === "REJECTED") return <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /> Rejected</span>;
                    return <span className="flex items-center gap-1 text-yellow-600"><ClockIcon className="h-4 w-4" /> Pending</span>;
                  },
                },
                { accessorKey: "createdAt", header: "Date", cell: (info) => formatDate(info.getValue()) },
              ]}
              data={purchases}
              searchKey="purchases"
              pageSize={5}
            />
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <h3 className="mt-4 font-medium text-xl">You haven't uploaded any purchases yet</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Verify your purchases to unlock surveys and earn money.
              </p>
              <Link href="/dashboard/purchases/new">
                <Button className="mt-4 gap-2">
                  <Package className="h-4 w-4" /> Add Purchase
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Wallet & Payouts</CardTitle>
          <Link href="/dashboard/wallet" className="text-sm text-primary hover:underline">
            View details <ArrowRight className="h-4 w-4 inline" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="text-4xl font-bold text-primary">{formatCurrency(data.walletBalance)}</div>
            <div className="flex gap-6 text-sm">
              <span className="text-muted-foreground">Total Earned: <strong>{formatCurrency(data.totalEarned)}</strong></span>
              <span className="text-muted-foreground">Purchases: <strong>{purchases.length}</strong></span>
            </div>
            <Link href="/dashboard/wallet">
              <Button size="sm">Manage Wallet</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="animate-pulse space-y-6">Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

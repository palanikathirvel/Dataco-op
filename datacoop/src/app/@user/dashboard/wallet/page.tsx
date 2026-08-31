"use client";

import { useState } from "react";
import { WalletCard } from "@/components/ui/wallet-card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDown, ArrowUp, CreditCard, History, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function WalletPage() {
  const [data, setData] = useState<any>({ balance: 0, totalEarned: 0, transactions: [], payoutRequests: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/user/wallet");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/payout-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), upiId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request payout");

      toast({ title: "Success", description: "Payout request submitted for admin approval" });
      setWithdrawDialogOpen(false);
      setUpiId("");
      setAmount("");
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SURVEY_EARNING": return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "PAYOUT": return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <CreditCard className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
        </div>
      </div>

      <WalletCard
        balance={data.balance}
        totalEarned={data.totalEarned}
        onWithdraw={() => setWithdrawDialogOpen(true)}
      />

      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw to UPI</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="name@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                min="500"
                max={data.balance}
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum ₹500 • Available: {formatCurrency(data.balance)}
              </p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || !upiId || !amount || parseFloat(amount) < 500 || parseFloat(amount) > data.balance} className="w-full">
                {isSubmitting ? "Requesting..." : "Request Withdrawal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : data.transactions?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "type", header: "Type", cell: (info) => (
                    <span className="flex items-center gap-2">
                      {getTypeIcon(info.getValue())}
                      <span>{info.getValue().replace("_", " ")}</span>
                    </span>
                  )},
                  { accessorKey: "amount", header: "Amount", cell: (info) => {
                    const t = info.row.original;
                    const prefix = t.type === "PAYOUT" ? "-" : "+";
                    return <span className={t.type === "PAYOUT" ? "text-red-600" : "text-green-600"}>{prefix}{formatCurrency(info.getValue())}</span>;
                  }},
                  { accessorKey: "description", header: "Description" },
                  { accessorKey: "createdAt", header: "Date", cell: (info) => formatDate(info.getValue()) },
                ]}
                data={data.transactions}
                pageSize={10}
                searchKey="transactions"
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">No transactions yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Payout Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.payoutRequests?.length > 0 ? (
              <DataTable
                columns={[
                  { accessorKey: "amount", header: "Amount", cell: (info) => formatCurrency(info.getValue()) },
                  { accessorKey: "upiId", header: "UPI ID" },
                  { accessorKey: "status", header: "Status" },
                  { accessorKey: "createdAt", header: "Requested", cell: (info) => formatDate(info.getValue()) },
                  { accessorKey: "processedAt", header: "Processed", cell: (info) => info.getValue() ? formatDate(info.getValue()) : "-" },
                ]}
                data={data.payoutRequests}
                pageSize={10}
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">No payout requests</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
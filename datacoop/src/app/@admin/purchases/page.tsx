import { Suspense } from "react";
import { DataTable } from "@/components/ui/data-table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, CheckCircle, XCircle } from "lucide-react";

async function PurchasesContent() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = cookieStore.get("auth-token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/purchases/pending`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: "no-store",
  });
  const { purchases } = await res.json();

  const handleVerify = async (id: string, action: "VERIFY" | "REJECT", reason?: string) => {
    try {
      const res = await fetch(`/api/admin/purchases/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectReason: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Success", description: `Purchase ${action.toLowerCase()}d` });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase Verification Queue</h1>
        <p className="text-muted-foreground">Review and approve/reject pending purchase verifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications ({purchases?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { accessorKey: "productName", header: "Product", cell: (info) => (
                <div>
                  <p className="font-medium">{info.getValue()}</p>
                  <p className="text-xs text-muted-foreground">{info.row.original.platform}</p>
                </div>
              )},
              { accessorKey: "user.name", header: "User", cell: (info) => info.getValue() },
              { accessorKey: "category", header: "Category" },
              { accessorKey: "amount", header: "Amount", cell: (info) => formatCurrency(info.getValue()) },
              { accessorKey: "method", header: "Method" },
              { accessorKey: "orderId", header: "Order ID" },
              { accessorKey: "purchaseDate", header: "Date", cell: (info) => formatDate(info.getValue()) },
              {
                accessorKey: "actions",
                header: "Actions",
                cell: (info) => {
                  const id = info.row.original.id;
                  return (
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Verify Purchase?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will mark the purchase as verified and auto-apply cohort tags.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogAction onClick={() => handleVerify(id, "VERIFY")}>Verify</AlertDialogAction>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject Purchase?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Please provide a reason for rejection. This will be sent to the user.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <input
                            type="text"
                            placeholder="Reason for rejection"
                            className="mt-4 p-2 border rounded"
                            onKeyDown={(e) => e.key === "Enter" && handleVerify(id, "REJECT", e.currentTarget.value)}
                          />
                          <AlertDialogAction onClick={() => {
                            const input = document.querySelector('input[placeholder="Reason for rejection"]') as HTMLInputElement;
                            handleVerify(id, "REJECT", input?.value);
                          }}>Reject</AlertDialogAction>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                },
              },
            ]}
            data={purchases || []}
            searchKey="purchases"
            filterColumns={["status", "category", "platform", "method"]}
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPurchasesPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <PurchasesContent />
    </Suspense>
  );
}
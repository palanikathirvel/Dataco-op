import { Suspense } from "react";
import { DataTable } from "@/components/ui/data-table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, DollarSign } from "lucide-react";

async function PayoutsContent() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = cookieStore.get("auth-token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/payouts/pending`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: "no-store",
  });
  const { payouts } = await res.json();

  const handleProcess = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch(`/api/admin/payouts/${id}/process`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Success", description: `Payout ${action.toLowerCase()}d` });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payout Management</h1>
        <p className="text-muted-foreground">Review and process user withdrawal requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts ({payouts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { accessorKey: "user.name", header: "User", cell: (info) => info.getValue() },
              { accessorKey: "user.email", header: "Email", cell: (info) => info.getValue() },
              { accessorKey: "amount", header: "Amount", cell: (info) => formatCurrency(info.getValue()) },
              { accessorKey: "upiId", header: "UPI ID" },
              { accessorKey: "createdAt", header: "Requested", cell: (info) => formatDate(info.getValue()) },
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
                            Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Payout?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will process the payout via RazorpayX to the user's UPI ID.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogAction onClick={() => handleProcess(id, "APPROVE")}>Approve</AlertDialogAction>
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
                            <AlertDialogTitle>Reject Payout?</AlertDialogTitle>
                            <AlertDialogDescription>
                              The amount will be returned to the user's wallet.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogAction onClick={() => handleProcess(id, "REJECT")}>Reject</AlertDialogAction>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                },
              },
            ]}
            data={payouts || []}
            searchKey="payouts"
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPayoutsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <PayoutsContent />
    </Suspense>
  );
}
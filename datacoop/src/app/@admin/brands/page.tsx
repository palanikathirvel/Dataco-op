"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Building2 } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-gray-100 text-gray-800",
};

async function BrandsContent() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = cookieStore.get("auth-token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/brands`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: "no-store",
  });
  const { brands } = await res.json();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Brand Management</h1>
        <p className="text-muted-foreground">Approve and manage brand accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Brands ({brands?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { accessorKey: "name", header: "Company Name", cell: (info) => (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{info.getValue()}</span>
                </div>
              )},
              { accessorKey: "email", header: "Email" },
              { accessorKey: "industry", header: "Industry" },
              { accessorKey: "contactPerson", header: "Contact" },
              { accessorKey: "walletBalance", header: "Wallet", cell: (info) => formatCurrency(info.getValue()) },
              { accessorKey: "totalSpent", header: "Total Spent", cell: (info) => formatCurrency(info.getValue()) },
              { accessorKey: "status", header: "Status", cell: (info) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[info.getValue()] || "bg-gray-100 text-gray-800"}`}>
                  {info.getValue().replace("_", " ")}
                </span>
              )},
              { accessorKey: "createdAt", header: "Registered", cell: (info) => formatDate(info.getValue()) },
              {
                accessorKey: "actions",
                header: "Actions",
                cell: (info) => {
                  const brand = info.row.original;
                  if (brand.status !== "PENDING_APPROVAL") return null;
                  
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
                            <AlertDialogTitle>Approve Brand?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will approve {brand.name} and allow them to create research studies.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogAction onClick={() => handleUpdateBrand(brand.id, "APPROVE")}>Approve</AlertDialogAction>
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
                            <AlertDialogTitle>Reject Brand?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reject {brand.name}. Please provide a reason.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <input
                            type="text"
                            placeholder="Reason for rejection"
                            className="mt-4 p-2 border rounded w-full"
                            onKeyDown={(e) => e.key === "Enter" && handleUpdateBrand(brand.id, "REJECT", e.currentTarget.value)}
                          />
                          <AlertDialogAction onClick={() => {
                            const input = document.querySelector('input[placeholder="Reason for rejection"]') as HTMLInputElement;
                            handleUpdateBrand(brand.id, "REJECT", input?.value);
                          }}>Reject</AlertDialogAction>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                },
              },
            ]}
            data={brands || []}
            searchKey="brands"
            filterColumns={["status", "industry"]}
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
}

async function handleUpdateBrand(brandId: string, action: "APPROVE" | "REJECT", rejectReason?: string) {
  try {
    const res = await fetch("/api/admin/brands", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: brandId, action, rejectReason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    toast({ title: "Success", description: `Brand ${action.toLowerCase()}d` });
    window.location.reload();
  } catch (error: any) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  }
}

export default function AdminBrandsPage() {
  return <BrandsContent />;
}
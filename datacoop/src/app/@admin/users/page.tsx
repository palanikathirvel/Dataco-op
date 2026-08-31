"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { UserCheck, UserX, Ban, User } from "lucide-react";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  BANNED: "bg-red-100 text-red-800",
  PENDING_VERIFICATION: "bg-yellow-100 text-yellow-800",
};

async function UsersContent() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = cookieStore.get("auth-token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/users`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: "no-store",
  });
  const { users } = await res.json();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { accessorKey: "name", header: "Name", cell: (info) => (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{info.getValue() || "—"}</span>
                </div>
              )},
              { accessorKey: "email", header: "Email" },
              { accessorKey: "age", header: "Age" },
              { accessorKey: "gender", header: "Gender" },
              { accessorKey: "city", header: "City" },
              { accessorKey: "walletBalance", header: "Wallet", cell: (info) => formatCurrency(info.getValue()) },
              { accessorKey: "totalEarned", header: "Total Earned", cell: (info) => formatCurrency(info.getValue()) },
              { accessorKey: "status", header: "Status", cell: (info) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[info.getValue()] || "bg-gray-100 text-gray-800"}`}>
                  {info.getValue().replace("_", " ")}
                </span>
              )},
              { accessorKey: "dpdpConsent", header: "DPDP Consent", cell: (info) => info.getValue() ? "✅ Yes" : "❌ No" },
              { accessorKey: "createdAt", header: "Joined", cell: (info) => formatDate(info.getValue()) },
              {
                accessorKey: "actions",
                header: "Actions",
                cell: (info) => {
                  const user = info.row.original;
                  if (user.status === "BANNED") {
                    return (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Unban
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Unban User?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will restore {user.name || user.email}'s account access.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogAction onClick={() => handleUpdateUser(user.id, "UNBAN")}>Unban</AlertDialogAction>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  }
                  
                  return (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ban User?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will ban {user.name || user.email} and prevent them from accessing the platform.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogAction onClick={() => handleUpdateUser(user.id, "BAN")}>Ban</AlertDialogAction>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                      </AlertDialogContent>
                    </AlertDialog>
                  );
                },
              },
            ]}
            data={users || []}
            searchKey="users"
            filterColumns={["status", "gender", "city"]}
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
}

async function handleUpdateUser(userId: string, action: "BAN" | "UNBAN") {
  try {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    toast({ title: "Success", description: `User ${action.toLowerCase()}ned` });
    window.location.reload();
  } catch (error: any) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  }
}

export default function AdminUsersPage() {
  return <UsersContent />;
}
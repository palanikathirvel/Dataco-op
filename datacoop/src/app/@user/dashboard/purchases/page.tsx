"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Upload, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const PLATFORMS = [
  "Amazon", "Flipkart", "Myntra", "Nykaa", "Purplle", "Swiggy", "Zomato", "Blinkit", "Zepto",
  "BigBasket", "JioMart", "DMart", "Reliance Digital", "Croma", "Vijay Sales", "Other"
];

const CATEGORIES = [
  "SKINCARE", "HAIRCARE", "MAKEUP", "FRAGRANCE", "PERSONAL_CARE",
  "FOOD_DELIVERY", "GROCERIES", "ELECTRONICS", "APPLIANCES", "MOBILE_ACCESSORIES",
  "FASHION", "FOOTWEAR", "HOME_DECOR", "FURNITURE", "HEALTH_WELLNESS",
  "BABY_CARE", "PET_CARE", "AUTOMOTIVE", "BOOKS", "OTHER"
];

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"screenshot" | "email" | "manual">("screenshot");
  const [formData, setFormData] = useState({
    platform: "",
    productName: "",
    brand: "",
    category: "",
    amount: "",
    orderId: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPurchases = async () => {
    try {
      const res = await fetch("/api/user/purchases");
      const data = await res.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let method = uploadMethod.toUpperCase() as "SCREENSHOT" | "EMAIL_FORWARD" | "MANUAL_ENTRY";
      let screenshotUrl = "";

      if (method === "SCREENSHOT" && files.length > 0) {
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await fetch("/api/user/purchases/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        screenshotUrl = data.url;
      }

      const res = await fetch("/api/user/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          purchaseDate: new Date(formData.purchaseDate).toISOString(),
          method,
          screenshotUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create purchase");

      toast({ title: "Success", description: "Purchase submitted for verification" });
      setIsDialogOpen(false);
      setFiles([]);
      setFormData({
        platform: "",
        productName: "",
        brand: "",
        category: "",
        amount: "",
        orderId: "",
        purchaseDate: new Date().toISOString().split("T")[0],
      });
      fetchPurchases();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "VERIFIED": return "Verified";
      case "REJECTED": return "Rejected";
      default: return "Pending Verification";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Verification</h1>
          <p className="text-muted-foreground">Verify your purchases to unlock relevant surveys and earn more</p>
        </div>
        <Link href="/dashboard/purchases/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Purchase</Button>
        </Link>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Purchase</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Verification Method</Label>
                <div className="flex gap-4">
                  {(["screenshot", "email", "manual"] as const).map((method) => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="method"
                        value={method}
                        checked={uploadMethod === method}
                        onChange={() => setUploadMethod(method)}
                        className="text-primary"
                      />
                      <span className="capitalize">{method === "email" ? "Email Forward" : method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {uploadMethod === "screenshot" && (
                <div className="space-y-2">
                  <Label>Screenshot / Invoice</Label>
                  <FileUpload
                    onFilesChange={setFiles}
                    maxFiles={1}
                    accept={{
                      "image/png": [".png"],
                      "image/jpeg": [".jpg", ".jpeg"],
                      "application/pdf": [".pdf"],
                    }}
                  />
                  <p className="text-sm text-muted-foreground">Upload a screenshot of your order confirmation or invoice</p>
                </div>
              )}

              {uploadMethod === "email" && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Forward your order confirmation emails to:</p>
                  <p className="font-mono text-primary">user-{purchases.length || 0}@upload.datacoop.in</p>
                  <p className="text-sm text-muted-foreground">Our system will automatically parse and extract purchase details</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro 256GB"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., Apple"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="129999"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit for Verification"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {["VERIFIED", "PENDING_VERIFICATION", "REJECTED"].map((status) => (
          <Card key={status} className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{getStatusLabel(status)}</p>
              <p className="text-3xl font-bold mt-1">
                {purchases.filter((p) => p.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : purchases.length > 0 ? (
            <DataTable
              columns={[
                { accessorKey: "productName", header: "Product", cell: (info) => (
                  <div>
                    <p className="font-medium">{info.getValue()}</p>
                    <p className="text-xs text-muted-foreground">{info.row.original.platform}</p>
                  </div>
                )},
                { accessorKey: "category", header: "Category" },
                { accessorKey: "amount", header: "Amount", cell: (info) => formatCurrency(info.getValue()) },
                { accessorKey: "purchaseDate", header: "Date", cell: (info) => formatDate(info.getValue()) },
                { accessorKey: "method", header: "Method" },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: (info) => (
                    <span className="flex items-center gap-2">
                      {getStatusIcon(info.getValue())}
                      <span>{getStatusLabel(info.getValue())}</span>
                    </span>
                  ),
                },
                { accessorKey: "rejectReason", header: "Reject Reason", cell: (info) => info.getValue() || "-" },
              ]}
              data={purchases}
              searchKey="purchases"
              filterColumns={["status", "category", "platform"]}
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-2 font-medium">No purchases yet</h3>
              <p className="text-muted-foreground text-sm">Add your first purchase to start earning</p>
              <Button className="mt-4 gap-2" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Purchase
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
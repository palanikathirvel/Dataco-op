"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Upload, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const PLATFORMS = ["AMAZON", "FLIPKART", "SWIGGY", "ZOMATO", "MYNTRA"] as const;
const CATEGORIES = [
  "SKINCARE",
  "FOOTWEAR",
  "ELECTRONICS",
  "FOOD",
  "FASHION",
  "HOME",
  "OTHER",
] as const;

const ORDER_PATTERNS: Record<string, RegExp> = {
  AMAZON: /^\d{3}-\d{7}-\d{7}$/,
  FLIPKART: /^OD\d{16}$/,
  SWIGGY: /^\d{10}$/,
  ZOMATO: /^(ZO)?\d{10}$/,
  MYNTRA: /^\d{12,20}$/,
};

export default function NewPurchasePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    platform: "",
    productName: "",
    productCategory: "",
    brandName: "",
    amount: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    orderId: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMeta, setUploadMeta] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.platform) newErrors.platform = "Platform is required";
    if (formData.productName.length < 2) newErrors.productName = "Product name is required";
    if (!formData.productCategory) newErrors.productCategory = "Category is required";
    if (!formData.amount || Number(formData.amount) < 1) newErrors.amount = "Valid amount required";
    if (!formData.purchaseDate) newErrors.purchaseDate = "Date is required";
    if (!formData.orderId || formData.orderId.length < 3) newErrors.orderId = "Order ID is required";

    // Order ID pattern
    if (formData.platform && formData.orderId) {
      const pattern = ORDER_PATTERNS[formData.platform];
      if (pattern && !pattern.test(formData.orderId)) {
        newErrors.orderId = `Invalid format for ${formData.platform}`;
      }
    }

    if (files.length === 0) newErrors.proof = "Please upload proof image";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: "Validation failed", description: "Please check the form", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: upload file to get URL + analysis metadata
      setIsAnalyzing(true);
      const fileForm = new FormData();
      fileForm.append("file", files[0]);
      fileForm.append("platform", formData.platform);
      fileForm.append("orderId", formData.orderId);

      const uploadRes = await fetch("/api/user/purchases/upload", {
        method: "POST",
        body: fileForm,
      });
      const uploadData = await uploadRes.json();
      setIsAnalyzing(false);

      if (!uploadRes.ok) {
        toast({
          title: "Upload failed",
          description: uploadData.error || "Could not upload file",
          variant: "destructive",
        });
        return;
      }
      setUploadMeta(uploadData);

      // Step 2: create the purchase record
      const createRes = await fetch("/api/user/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: formData.platform,
          productName: formData.productName,
          productCategory: formData.productCategory,
          brandName: formData.brandName || null,
          amount: Math.round(Number(formData.amount) * 100), // paise
          purchaseDate: new Date(formData.purchaseDate).toISOString(),
          orderId: formData.orderId,
          method: "SCREENSHOT",
          screenshotUrl: uploadData.url,
          exifData: uploadData.exifData,
          perceptualHash: uploadData.perceptualHash,
          isSuspicious: uploadData.isSuspicious,
          suspicionReasons: uploadData.suspicionReasons,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        toast({
          title: "Submission failed",
          description: createData.error || "Could not submit purchase",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Submitted!", description: "Your purchase is under review." });
      router.push("/dashboard/purchases");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Network error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/purchases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Purchase</h1>
          <p className="text-muted-foreground">Submit a purchase for verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) => setFormData({ ...formData, platform: v })}
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
                {errors.platform && <p className="text-sm text-destructive">{errors.platform}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.productCategory}
                  onValueChange={(v) => setFormData({ ...formData, productCategory: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productCategory && <p className="text-sm text-destructive">{errors.productCategory}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., Nike Air Zoom Pegasus 40"
                maxLength={200}
              />
              {errors.productName && <p className="text-sm text-destructive">{errors.productName}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand (optional)</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="e.g., Nike"
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
                  placeholder="1299"
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID *</Label>
                <Input
                  id="orderId"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder="e.g., 402-1234567-8912345"
                />
                {errors.orderId && <p className="text-sm text-destructive">{errors.orderId}</p>}
                {formData.platform && ORDER_PATTERNS[formData.platform] && (
                  <p className="text-xs text-muted-foreground">
                    Format: {ORDER_PATTERNS[formData.platform].source}
                  </p>
                )}
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
                {errors.purchaseDate && <p className="text-sm text-destructive">{errors.purchaseDate}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proof Image *</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFilesChange={setFiles}
              maxFiles={1}
              accept={{
                "image/png": [".png"],
                "image/jpeg": [".jpg", ".jpeg"],
              }}
            />
            {errors.proof && <p className="text-sm text-destructive mt-2">{errors.proof}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              PNG or JPG only. Max 5MB. Screenshot of your order confirmation or invoice.
            </p>
          </CardContent>
        </Card>

        {uploadMeta?.isSuspicious && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Image flagged for review</AlertTitle>
            <AlertDescription>
              {uploadMeta.suspicionReasons?.join(" • ")}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/purchases">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isAnalyzing ? "Analyzing..." : "Submitting...") : "Submit for Review"}
            {!isSubmitting && <Upload className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

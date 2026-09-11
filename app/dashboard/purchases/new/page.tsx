"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Upload, Loader2, CheckCircle2, X } from "lucide-react"
import { formatINR } from "@/lib/utils"

const PLATFORMS = [
  { value: "AMAZON", label: "Amazon" },
  { value: "FLIPKART", label: "Flipkart" },
  { value: "SWIGGY", label: "Swiggy" },
  { value: "ZOMATO", label: "Zomato" },
  { value: "MANUAL", label: "Other" },
]

const CATEGORIES = [
  "Skincare",
  "Footwear",
  "Electronics",
  "Food",
  "Fashion",
  "Home",
  "Beauty",
  "Health",
  "Travel",
  "Other",
]

export default function NewPurchasePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    platform: "AMAZON",
    productName: "",
    category: "",
    brand: "",
    amount: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    orderId: "",
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleFile(file: File | null) {
    if (!file) return
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setError("Please upload a JPEG or PNG image")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB")
      return
    }
    setError(null)
    setScreenshot(file)
    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    if (!screenshot) {
      setError("Please upload a screenshot of your order")
      return
    }
    if (!form.productName || !form.category || !form.amount || !form.orderId) {
      setError("Fill in all required fields")
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount in rupees")
      return
    }

    setSubmitting(true)
    try {
      const body = new FormData()
      body.append("screenshot", screenshot)
      body.append("platform", form.platform)
      body.append("productName", form.productName)
      body.append("category", form.category)
      body.append("brand", form.brand)
      body.append("amount", String(Math.round(amount * 100))) // paise
      body.append("purchaseDate", form.purchaseDate)
      body.append("orderId", form.orderId)

      const res = await fetch("/api/purchases", {
        method: "POST",
        body,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Upload failed")
        return
      }
      toast.success("Purchase submitted! We'll verify it within 24 hours.")
      router.push("/dashboard/purchases")
      router.refresh()
    } catch (err) {
      setError("Upload failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto space-y-5 sm:space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/dashboard/purchases">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Purchases
          </Link>
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Add a Purchase Receipt</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload an order email screenshot or receipt. We verify within 24 hours.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
            <CardDescription>As shown on your order email or receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => update("platform", v)}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Product name *</Label>
              <Input
                id="productName"
                placeholder="e.g. Nike Air Zoom Pegasus 40"
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => update("category", v)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g. Nike"
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  required
                />
                {form.amount && !isNaN(parseFloat(form.amount)) && (
                  <p className="text-xs text-muted-foreground">
                    {formatINR(Math.round(parseFloat(form.amount) * 100))}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase date *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => update("purchaseDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID *</Label>
              <Input
                id="orderId"
                placeholder="e.g. 402-1234567-8912345"
                value={form.orderId}
                onChange={(e) => update("orderId", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Found in your order confirmation email
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order proof</CardTitle>
            <CardDescription>
              Screenshot of the order confirmation email or receipt (max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-80 object-contain rounded-lg border bg-muted"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => {
                    setScreenshot(null)
                    setPreviewUrl(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                {screenshot && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    {screenshot.name} ({(screenshot.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPEG, or WebP up to 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/purchases">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit for verification"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

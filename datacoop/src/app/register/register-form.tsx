"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, Building2, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("type") === "brand" ? "brand" : "user";
  const [activeTab, setActiveTab] = useState<"user" | "brand">(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    city: "",
    dpdpConsent: false,
    // Brand fields
    companyName: "",
    website: "",
    industry: "",
    contactPerson: "",
    contactPhone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "password" && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLButtonElement> | boolean, name: string) => {
    let value: boolean;
    if (typeof e === "boolean") {
      value = e;
    } else if (e.currentTarget instanceof HTMLInputElement) {
      value = e.currentTarget.checked;
    } else {
      value = false;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateUserForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (formData.age && (parseInt(formData.age) < 13 || parseInt(formData.age) > 100)) newErrors.age = "Invalid age";
    if (!formData.dpdpConsent) newErrors.dpdpConsent = "You must consent to data sharing";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBrandForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) newErrors.website = "Invalid URL format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = activeTab === "user" ? validateUserForm() : validateBrandForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const endpoint = activeTab === "user" ? "/api/auth/register" : "/api/auth/register/brand";
      const body = activeTab === "user"
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            age: formData.age ? parseInt(formData.age) : undefined,
            gender: formData.gender || undefined,
            city: formData.city || undefined,
            dpdpConsent: formData.dpdpConsent,
          }
        : {
            name: formData.companyName,
            email: formData.email,
            password: formData.password,
            website: formData.website || undefined,
            industry: formData.industry || undefined,
            contactPerson: formData.contactPerson || undefined,
            contactPhone: formData.contactPhone || undefined,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Registration failed", variant: "destructive" });
        return;
      }

      toast({ title: "Success", description: activeTab === "brand" ? "Account submitted for approval" : "Account created successfully" });
      if (activeTab === "user") {
        router.push("/dashboard");
      } else {
        router.push("/brand/pending-approval");
      }
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">DC</span>
            </div>
            <span className="font-semibold text-2xl">DataCoop</span>
          </Link>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">
            Join as a {activeTab === "user" ? "user" : "brand"} to get started
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "user" | "brand")} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="gap-2">
              <User className="h-4 w-4" />
              User
            </TabsTrigger>
            <TabsTrigger value="brand" className="gap-2">
              <Building2 className="h-4 w-4" />
              Brand
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>{activeTab === "user" ? "Create User Account" : "Register Your Brand"}</CardTitle>
            <CardDescription>
              {activeTab === "user"
                ? "Start earning from your verified purchases"
                : "Access verified purchaser audiences for research"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "user" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-destructive" : ""}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? "border-destructive pr-10" : "pr-10"}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-0.5"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-0.5"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>

                  <Separator className="my-4" />
                  <p className="text-sm font-medium">Basic Demographics (Optional)</p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={handleChange}
                        min="13"
                        max="100"
                        className={errors.age ? "border-destructive" : ""}
                        disabled={isLoading}
                      />
                      {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={isLoading}
                      >
                        <option value="">Select</option>
                        {GENDER_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-start gap-2 cursor-pointer">
                      <Checkbox
                        id="dpdpConsent"
                        checked={formData.dpdpConsent}
                        onCheckedChange={(checked) => {
                          const val = checked === true;
                          setFormData((prev) => ({ ...prev, dpdpConsent: val }));
                          if (errors.dpdpConsent) setErrors((prev) => ({ ...prev, dpdpConsent: "" }));
                        }}
                        disabled={isLoading}
                      />
                      <span className="text-sm text-muted-foreground">
                        I consent to sharing my anonymized purchase data with brands for market research as per DPDP Act.
                        <a href="#" className="text-primary hover:underline ml-1">Learn more</a>
                      </span>
                    </Label>
                    {errors.dpdpConsent && <p className="text-sm text-destructive ml-6">{errors.dpdpConsent}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Acme Corporation"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={errors.companyName ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contact@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-destructive" : ""}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? "border-destructive pr-10" : "pr-10"}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-0.5"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-0.5"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>

                  <Separator className="my-4" />
                  <p className="text-sm font-medium">Company Details (Optional)</p>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="https://company.com"
                      value={formData.website}
                      onChange={handleChange}
                      className={errors.website ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      placeholder="E-commerce / FMCG / Tech"
                      value={formData.industry}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        placeholder="Jane Smith"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        placeholder="+91 98765 43210"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Account requires admin approval</p>
                      <p>Your brand account will be reviewed within 24-48 hours before activation.</p>
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : activeTab === "user" ? "Create Account" : "Submit for Approval"}
              </Button>
            </form>

            <Separator className="my-6" />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href={`/login${activeTab === "brand" ? "?tab=brand" : ""}`} className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
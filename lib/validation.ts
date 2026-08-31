import { z } from "zod"

// User registration schema
export const userRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  age: z.number().int().min(18, "Must be at least 18 years old").max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  city: z.string().min(2),
  pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode"),
  consent: z.boolean().refine(val => val === true, "You must consent to data sharing"),
})

// Brand registration schema
export const brandRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  website: z.string().url("Invalid website URL"),
  industry: z.string().min(2),
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Purchase upload schema
export const purchaseUploadSchema = z.object({
  platform: z.enum(["AMAZON", "FLIPKART", "SWIGGY", "ZOMATO", "MANUAL"]),
  productName: z.string().min(2),
  productCategory: z.string().min(2),
  brandName: z.string().min(2),
  amount: z.number().int().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  purchaseDate: z.string().datetime(),
  orderId: z.string().min(1, "Order ID is required"),
  verificationMethod: z.enum(["EMAIL_SCREENSHOT", "OCR", "BANK_STATEMENT", "MANUAL"]),
  proofImageUrl: z.string().url().optional().nullable(),
})

// Research request schema
export const researchRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  targetCohort: z.array(z.string()).min(1, "At least one cohort tag required"),
  sampleSize: z.number().int().min(50, "Minimum sample size is 50").max(5000, "Maximum sample size is 5000"),
  pricePerResponse: z.number().int().min(10000, "Minimum price per response is ₹100 (10000 paise)"),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "RATING", "TEXT", "NPS"]),
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string()).optional(),
    required: z.boolean().default(true),
  })).min(1, "At least one question required"),
  expiresAt: z.string().datetime(),
})

// Payout request schema
export const payoutRequestSchema = z.object({
  amount: z.number().int().min(50000, "Minimum payout is ₹500 (50000 paise)"),
  upiId: z.string().regex(/^[\w.\-]+@[\w]+$/, "Invalid UPI ID format"),
  bankAccountNumber: z.string().optional(),
  ifsc: z.string().optional(),
})

// Survey response schema
export const surveyResponseSchema = z.object({
  answers: z.record(z.any()),
  timeTakenSeconds: z.number().int().positive(),
})

// Admin user schema
export const adminUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "MODERATOR"]).default("MODERATOR"),
})

export type UserRegisterInput = z.infer<typeof userRegisterSchema>
export type BrandRegisterInput = z.infer<typeof brandRegisterSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PurchaseUploadInput = z.infer<typeof purchaseUploadSchema>
export type ResearchRequestInput = z.infer<typeof researchRequestSchema>
export type PayoutRequestInput = z.infer<typeof payoutRequestSchema>
export type SurveyResponseInput = z.infer<typeof surveyResponseSchema>
export type AdminUserInput = z.infer<typeof adminUserSchema>
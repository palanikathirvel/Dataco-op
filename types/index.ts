// Type definitions for DataCo-op

export type Platform = 'AMAZON' | 'FLIPKART' | 'SWIGGY' | 'ZOMATO' | 'MANUAL'

export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export type AccountStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export type VerificationMethod = 'EMAIL_SCREENSHOT' | 'OCR' | 'BANK_STATEMENT' | 'MANUAL'

export type PurchaseStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export type RequestStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'CLOSED' | 'COMPLETED'

export type ResponseStatus = 'COMPLETED' | 'REJECTED' | 'FLAGGED'

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED'

export type TransactionType = 'USER_PAYOUT' | 'BRAND_DEPOSIT' | 'PLATFORM_FEE' | 'REFUND'

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export type AdminRole = 'SUPER_ADMIN' | 'MODERATOR'

export interface User {
  id: string
  email: string
  name: string
  phone: string
  age: number
  gender: string
  city: string
  pincode: string
  walletBalance: number
  totalEarned: number
  kycStatus: KycStatus
  createdAt: Date
  updatedAt: Date
}

export interface AccountLink {
  id: string
  userId: string
  platform: Platform
  status: AccountStatus
  metadata: Record<string, any>
  lastSyncedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Purchase {
  id: string
  userId: string
  platform: Platform
  productName: string
  productCategory: string
  brandName: string
  amount: number
  currency: string
  purchaseDate: Date
  orderId: string
  verificationMethod: VerificationMethod
  proofImageUrl: string | null
  status: PurchaseStatus
  createdAt: Date
}

export interface CohortTag {
  id: string
  userId: string
  tagName: string
  sourcePurchaseId: string
  confidenceScore: number
  createdAt: Date
}

export interface Brand {
  id: string
  email: string
  companyName: string
  website: string
  industry: string
  walletBalance: number
  totalSpent: number
  accountStatus: AccountStatus
  createdAt: Date
}

export interface ResearchRequest {
  id: string
  brandId: string
  title: string
  description: string
  targetCohort: string[]
  sampleSize: number
  pricePerResponse: number
  totalBudget: number
  status: RequestStatus
  questions: Question[]
  createdAt: Date
  expiresAt: Date
}

export interface Question {
  id: string
  type: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'RATING' | 'TEXT' | 'NPS'
  question: string
  options: string[]
  required: boolean
}

export interface SurveyResponse {
  id: string
  researchRequestId: string
  userId: string
  answers: Record<string, any>
  timeTakenSeconds: number
  status: ResponseStatus
  payoutAmount: number
  payoutStatus: PayoutStatus
  createdAt: Date
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  fromUserId: string | null
  toUserId: string | null
  brandId: string | null
  researchRequestId: string | null
  razorpayPaymentId: string | null
  metadata: Record<string, any> | null
  createdAt: Date
}

export interface PayoutRequest {
  id: string
  userId: string
  amount: number
  status: PayoutStatus
  upiId: string
  bankAccountNumber: string | null
  ifsc: string | null
  processedAt: Date | null
  transactionId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  lastLoginAt: Date | null
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Dashboard stats
export interface UserDashboardStats {
  walletBalance: number
  totalEarned: number
  availableSurveys: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'SURVEY_COMPLETED' | 'PAYOUT_RECEIVED' | 'PURCHASE_VERIFIED'
  description: string
  amount?: number
  createdAt: Date
}

export interface BrandDashboardStats {
  activeStudies: number
  totalResponses: number
  walletBalance: number
  avgCostPerInsight: number
}

export interface AdminDashboardStats {
  totalUsers: number
  totalBrands: number
  revenueToday: number
  pendingVerifications: number
  pendingPayouts: number
}
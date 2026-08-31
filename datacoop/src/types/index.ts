export type UserRole = "USER" | "BRAND" | "ADMIN";
export type UserStatus = "ACTIVE" | "BANNED" | "PENDING_VERIFICATION";
export type BrandStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type PurchaseStatus = "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
export type PurchaseMethod = "SCREENSHOT" | "EMAIL_FORWARD" | "MANUAL_ENTRY";
export type ResearchStatus = "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED" | "CANCELLED";
export type ResponseStatus = "IN_PROGRESS" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PAID";
export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REJECTED";
export type TransactionType = "SURVEY_EARNING" | "PAYOUT" | "BRAND_DEPOSIT" | "BRAND_SPEND" | "PLATFORM_FEE" | "REFUND";
export type NotificationType = "NEW_SURVEY" | "SURVEY_COMPLETED" | "PAYOUT_PROCESSED" | "BRAND_REGISTRATION" | "RESEARCH_APPROVED" | "LOW_BALANCE" | "PURCHASE_VERIFIED" | "PURCHASE_REJECTED";

export interface User {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  city: string | null;
  cityTier: string | null;
  phone: string | null;
  upiId: string | null;
  dpdpConsent: boolean;
  dpdpConsentAt: Date | null;
  role: UserRole;
  status: UserStatus;
  walletBalance: number;
  totalEarned: number;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  email: string;
  website: string | null;
  industry: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  status: BrandStatus;
  walletBalance: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  platform: string;
  productName: string;
  brand: string | null;
  category: string;
  amount: number;
  orderId: string | null;
  purchaseDate: Date;
  status: PurchaseStatus;
  method: PurchaseMethod;
  screenshotUrl: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  rejectReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CohortTag {
  id: string;
  userId: string;
  tag: string;
  createdAt: Date;
}

export interface ResearchRequest {
  id: string;
  brandId: string;
  title: string;
  description: string;
  targetCohorts: string[];
  sampleSize: number;
  pricePerResponse: number;
  platformFee: number;
  totalBudget: number;
  status: ResearchStatus;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyQuestion {
  id: string;
  researchRequestId: string;
  type: "SINGLE_CHOICE" | "MULTI_CHOICE" | "RATING" | "TEXT" | "NPS";
  question: string;
  options: string[];
  required: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyResponse {
  id: string;
  userId: string;
  researchRequestId: string;
  status: ResponseStatus;
  startedAt: Date;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  timeSpent: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyAnswer {
  id: string;
  responseId: string;
  questionId: string;
  value: string;
  timeSpent: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  upiId: string;
  status: PayoutStatus;
  razorpayPayoutId: string | null;
  processedAt: Date | null;
  processedBy: string | null;
  rejectReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string | null;
  brandId: string | null;
  researchRequestId: string | null;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string | null;
  brandId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: Date;
}
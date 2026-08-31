import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpayInstance;
}

export const razorpay = {
  orders: {
    create: (params: any) => getRazorpay().orders.create(params),
    fetch: (id: string) => getRazorpay().orders.fetch(id),
  },
  payments: {
    fetch: (id: string) => getRazorpay().payments.fetch(id),
  },
};

export interface CreateOrderParams {
  amount: number; // in paise
  currency: "INR";
  receipt: string;
  notes?: Record<string, string>;
}

export async function createOrder(params: CreateOrderParams): Promise<any> {
  const order = await razorpay.orders.create(params);
  return order;
}

export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const crypto = await import("crypto");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return generatedSignature === signature;
}

// Note: RazorpayX payouts require a separate integration
// For now, we'll handle payouts manually via admin approval
export interface PayoutParams {
  account_number: string;
  amount: number; // in paise
  currency: "INR";
  mode: "UPI";
  purpose: "refund" | "payout";
  fund_account: {
    account_type: "vpa";
    vpa: {
      address: string;
    };
  };
  queue_if_low_balance: boolean;
  reference_id: string;
  narration: string;
}

export async function createPayout(params: PayoutParams) {
  // TODO: Implement RazorpayX payout integration
  // This requires a separate RazorpayX account and API
  console.log("Payout requested:", params);
  return { id: `payout_${Date.now()}`, status: "processing" };
}

export async function fetchPayout(payoutId: string) {
  // TODO: Implement
  return { id: payoutId, status: "processed" };
}
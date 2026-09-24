import Razorpay from "razorpay"
import crypto from "crypto"

let razorpayInstance: Razorpay | null = null

export function getRazorpay(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
    )
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    })
  }

  return razorpayInstance
}

export interface CreateOrderOptions {
  amount: number // in paise (e.g. 100000 = ₹1,000)
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder(options: CreateOrderOptions) {
  const rzp = getRazorpay()
  return await rzp.orders.create({
    amount: options.amount,
    currency: options.currency || "INR",
    receipt: options.receipt || `rcpt_${Date.now()}`,
    notes: options.notes,
  })
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured")
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  if (generatedSignature.length !== signature.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature),
    Buffer.from(signature)
  )
}

export async function fetchRazorpayPayment(paymentId: string) {
  const rzp = getRazorpay()
  return await rzp.payments.fetch(paymentId)
}

export async function fetchRazorpayOrder(orderId: string) {
  const rzp = getRazorpay()
  return await rzp.orders.fetch(orderId)
}

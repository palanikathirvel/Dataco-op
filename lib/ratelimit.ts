/**
 * Lightweight sliding-window in-memory rate limiter for serverless / edge API endpoints.
 * Automatically evicts expired entries to prevent memory leaks.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

// Periodically clean up expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupExpired() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key)
    }
  }
}

export interface RateLimitOptions {
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): RateLimitResult {
  cleanupExpired()

  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return {
      success: true,
      remaining: options.limit - 1,
      resetAt: now + options.windowMs,
    }
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    }
  }

  record.count += 1
  return {
    success: true,
    remaining: options.limit - record.count,
    resetAt: record.resetAt,
  }
}

/**
 * Extracts a client identifier from standard Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for")
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim()
  }
  const xRealIp = req.headers.get("x-real-ip")
  if (xRealIp) {
    return xRealIp.trim()
  }
  return "127.0.0.1"
}

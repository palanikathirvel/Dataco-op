import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Decimal } from "@prisma/client/runtime/library"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Convert Prisma Decimal (paise) to number of rupees (paise / 100) */
export function decimalToRupees(val: number | Decimal | string | null | undefined): number {
  if (val == null) return 0
  return Number(val) / 100
}

/** Format as INR currency string */
export function formatINR(val: number | Decimal | string | null | undefined): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(decimalToRupees(val))
}

/** Format a number with Indian thousand separators */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n)
}

/** Slugify a string */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^_|_$/g, "")
}

/** Truncate a string */
export function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

/** Convert rupees to paise for storage */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

/** Get initials from a name */
export function initials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/** Safe JSON parse */
export function safeParseJSON<T = unknown>(val: string | null | undefined): T | null {
  if (!val) return null
  try {
    return JSON.parse(val) as T
  } catch {
    return null
  }
}

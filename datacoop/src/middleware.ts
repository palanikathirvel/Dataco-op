import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             request.headers.get("x-real-ip") ||
             "unknown";

  const { pathname } = request.nextUrl;

  // Rate limiting
  if (pathname.startsWith("/api/auth/login")) {
    if (!rateLimit(ip, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith("/api/")) {
    if (!rateLimit(ip, 100, 60 * 1000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down." },
        { status: 429 }
      );
    }
  }

  // Auth check for protected routes
  const session = await getSession();

  // Protect /dashboard, /survey routes → require USER role
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/survey")) {
    if (!session || session.role !== "USER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect /brand routes → require BRAND role
  if (pathname.startsWith("/brand")) {
    if (!session || session.role !== "BRAND") {
      return NextResponse.redirect(new URL("/login?type=brand", request.url));
    }
  }

  // Protect /admin routes → require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from /login and /register
  if ((pathname === "/login" || pathname === "/register") && session) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (session.role === "BRAND") {
      return NextResponse.redirect(new URL("/brand/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/brand/:path*",
    "/admin/:path*",
    "/survey/:path*",
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/register/brand",
    "/api/:path*",
  ],
};

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role as string | undefined

    // Admin routes require ADMIN role
    if (pathname.startsWith("/admin")) {
      if (pathname === "/admin/login") {
        return NextResponse.next()
      }
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
    }

    // Brand routes require BRAND role
    if (pathname.startsWith("/brand")) {
      if (pathname === "/brand/login" || pathname === "/brand/register") {
        return NextResponse.next()
      }
      if (role !== "BRAND") {
        return NextResponse.redirect(new URL("/brand/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl

        // Public routes
        const publicPaths = [
          "/",
          "/contact",
          "/login",
          "/register",
          "/admin/login",
          "/brand/login",
          "/brand/register",
          "/forgot-password",
          "/terms",
          "/privacy",
        ]
        if (
          publicPaths.includes(pathname) ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/register") ||
          pathname.startsWith("/api/contact") ||
          pathname.startsWith("/api/webhooks") ||
          pathname.startsWith("/api/brand") ||
          pathname.startsWith("/api/feedback")
        ) {
          return true
        }

        // All other routes need a token
        return !!token
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}

import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://datacoop.in"

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/contact",
        "/login",
        "/register",
        "/brand/login",
        "/brand/register",
        "/forgot-password",
        "/terms",
        "/privacy",
      ],
      disallow: [
        "/admin/",
        "/dashboard/",
        "/brand/dashboard",
        "/brand/research/",
        "/brand/wallet",
        "/brand/settings",
        "/api/",
        "/survey/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

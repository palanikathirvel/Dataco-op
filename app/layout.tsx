import type { Metadata } from "next"
import { Oswald, Space_Mono } from "next/font/google"
import { Providers } from "@/components/providers/Providers"
import "./globals.css"

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "DataCo-op | Verified Consumer Data Marketplace",
  description: "Sell your verified purchase data. Get paid for your opinions. Brands get transaction-backed insights.",
  keywords: ["data marketplace", "consumer data", "survey", "market research", "verified purchases"],
  authors: [{ name: "DataCo-op" }],
  openGraph: {
    title: "DataCo-op | Verified Consumer Data Marketplace",
    description: "Sell your verified purchase data. Get paid for your opinions.",
    url: "https://datacoop.in",
    siteName: "DataCo-op",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${oswald.variable} ${spaceMono.variable}`}>
        {/* Barber-pole brand frame — persistent on all screens */}
        <div className="stripe-pole stripe-pole--left" aria-hidden="true" />
        <div className="stripe-pole stripe-pole--right" aria-hidden="true" />
        <div className="pole-gutter">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}

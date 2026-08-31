"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

// Query provider for react-query or swr
export function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
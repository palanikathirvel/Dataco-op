"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { AuthProvider, QueryProvider } from "./AuthProvider"
import { ChunkErrorHandler } from "./ChunkErrorHandler"
import { PKAgencyChatbot } from "@/components/chatbot/PKAgencyChatbot"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          <ChunkErrorHandler />
          {children}
          <PKAgencyChatbot />
          <Toaster
            position="top-right"
            richColors
            expand={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

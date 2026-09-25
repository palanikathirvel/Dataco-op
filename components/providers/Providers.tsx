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
            richColors={false}
            expand={false}
            closeButton
            toastOptions={{
              duration: 4000,
              className: "datacop-popup-toast",
              style: {
                background: "#1B3A5C",
                color: "#FFFFFF",
                border: "2px solid #142C46",
                boxShadow: "0 10px 25px -5px rgba(27, 58, 92, 0.45), 0 8px 10px -6px rgba(27, 58, 92, 0.35)",
              },
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

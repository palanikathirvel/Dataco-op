"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[APP_ERROR]", error)
    const message = error?.message || ""
    if (
      error.name === "ChunkLoadError" ||
      message.includes("ChunkLoadError") ||
      message.includes("Loading chunk") ||
      message.includes("Failed to fetch dynamically imported module")
    ) {
      const storageKey = "last_chunk_reload"
      const lastReload = sessionStorage.getItem(storageKey)
      const now = Date.now()
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(storageKey, String(now))
        window.location.reload()
      }
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            We hit an unexpected error. Please try again, and if the problem
            persists, contact support.
            {error.digest && (
              <code className="block mt-2 text-xs opacity-70">
                Error ID: {error.digest}
              </code>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => reset()}>
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      </div>
    </div>
  )
}

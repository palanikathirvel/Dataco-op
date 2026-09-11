"use client"

import { useEffect } from "react"

export function ChunkErrorHandler() {
  useEffect(() => {
    function isChunkError(error: unknown) {
      if (!error) return false
      const message =
        typeof error === "string"
          ? error
          : (error as Error)?.message || (error as { reason?: { message?: string } })?.reason?.message || ""
      const name = (error as Error)?.name || ""

      // Ignore browser extension errors
      if (message.includes("chrome-extension://") || message.includes("moz-extension://")) {
        return false
      }

      return (
        name === "ChunkLoadError" ||
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Failed to fetch dynamically imported module")
      )
    }

    function handleReload() {
      const storageKey = "last_chunk_reload"
      const lastReload = sessionStorage.getItem(storageKey)
      const now = Date.now()

      // Avoid infinite reload loops: only reload once every 10 seconds
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(storageKey, String(now))
        window.location.reload()
      }
    }

    function onError(event: ErrorEvent) {
      if (isChunkError(event.error || event.message)) {
        console.warn("[ChunkErrorHandler] Chunk load error detected, refreshing page...")
        handleReload()
      }
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      if (isChunkError(event.reason)) {
        console.warn("[ChunkErrorHandler] Unhandled chunk rejection detected, refreshing page...")
        handleReload()
      }
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onUnhandledRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
    }
  }, [])

  return null
}

"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AdminSignOutButtonProps {
  variant?: "desktop" | "mobile"
  email?: string | null
}

export function AdminSignOutButton({ variant = "desktop", email }: AdminSignOutButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    if (loading) return
    setLoading(true)
    try {
      toast.info("Signing out of root admin console...")
      await signOut({ callbackUrl: "/login" })
    } catch {
      toast.error("Failed to sign out")
      setLoading(false)
    }
  }

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        title="Sign Out of Admin Console"
        className="flex items-center gap-1 text-[11px] font-mono font-bold text-red-600 dark:text-red-400 hover:text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-2 py-1 rounded transition-colors active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <LogOut className="h-3 w-3" />
        )}
        <span>Sign Out</span>
      </button>
    )
  }

  return (
    <div className="p-3 border-t bg-muted/20">
      {email && (
        <div className="mb-2 px-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
            Root Administrator
          </p>
          <p className="text-xs font-medium truncate text-foreground/80">{email}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-md transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xs"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LogOut className="h-3.5 w-3.5" />
        )}
        <span>Sign Out</span>
      </button>
    </div>
  )
}

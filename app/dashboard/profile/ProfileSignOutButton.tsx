"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProfileSignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut({ callbackUrl: "/" })
  }

  return (
    <Button
      variant="destructive"
      onClick={handleSignOut}
      disabled={loading}
      className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs h-10 px-5"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Signing out...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" /> Sign Out of Account
        </>
      )}
    </Button>
  )
}

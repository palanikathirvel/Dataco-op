"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full mt-3"
    >
      <LogOut className="h-3.5 w-3.5" /> Sign out
    </button>
  )
}

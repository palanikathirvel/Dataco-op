"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoLoaderProps {
  message?: string
  submessage?: string
  fullScreen?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const LOADER_SIZES = {
  sm: { img: 48, text: "text-sm", sub: "text-xs" },
  md: { img: 72, text: "text-base", sub: "text-xs" },
  lg: { img: 96, text: "text-lg", sub: "text-sm" },
  xl: { img: 120, text: "text-xl", sub: "text-sm" },
}

export function LogoLoader({
  message = "Loading DataCo-op...",
  submessage,
  fullScreen = false,
  size = "md",
  className,
}: LogoLoaderProps) {
  const config = LOADER_SIZES[size]

  const content = (
    <div className={cn("flex flex-col items-center justify-center p-6 select-none", className)}>
      {/* Clean Shield Emblem with dynamic loading animation — NO round background disk */}
      <div
        className="relative flex items-center justify-center mb-5 animate-logo-loading"
        style={{
          width: config.img,
          height: config.img,
        }}
      >
        <Image
          src="/logo-mark-red.png"
          alt="DataCo-op Logo"
          width={config.img * 2}
          height={config.img * 2}
          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(27,58,92,0.25)]"
          priority
        />
      </div>

      {/* Brand Title matching site theme */}
      <div className="flex items-center gap-0.5 mb-2 leading-none">
        <span
          className={cn("font-bold tracking-tight uppercase text-[#1B3A5C]", config.text)}
          style={{ fontFamily: "var(--font-oswald), 'Oswald', sans-serif" }}
        >
          DATA
        </span>
        <span
          className={cn("font-bold tracking-tight uppercase text-[#E3474F]", config.text)}
          style={{ fontFamily: "var(--font-oswald), 'Oswald', sans-serif" }}
        >
          CO-OP
        </span>
      </div>

      {/* Status Message */}
      {message && (
        <p className={cn("text-muted-foreground font-medium animate-pulse text-center", config.sub)}>
          {message}
        </p>
      )}

      {/* Submessage */}
      {submessage && (
        <p className="text-xs text-muted-foreground/75 mt-1 font-mono tracking-wide text-center">
          {submessage}
        </p>
      )}

      {/* Sleek Progress Bar Indicator matching theme */}
      <div className="w-36 h-1 bg-[#1B3A5C]/10 rounded-full mt-4 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-[#1B3A5C] via-[#E3474F] to-[#1B3A5C] rounded-full animate-logo-progress" />
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

export default LogoLoader

"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
export type LogoVariant = "mark" | "full" | "horizontal" | "icon"
export type LogoAnimation = "float" | "pulse" | "loading" | "none"

interface LogoProps {
  size?: LogoSize | number
  variant?: LogoVariant
  animated?: boolean
  animationType?: LogoAnimation
  animateOnScroll?: boolean
  showText?: boolean
  subtitle?: string
  accentColor?: "red" | "gold" | "navy"
  textVariant?: "dark" | "light" // dark: for cream/light bg (Navy/Red), light: for dark bg (Cream/Red)
  href?: string
  className?: string
  priority?: boolean
  onClick?: () => void
}

const SIZE_MAP: Record<LogoSize, { mark: number; text: string; subText: string; container: string }> = {
  xs: { mark: 22, text: "text-sm", subText: "text-[9px]", container: "gap-1.5" },
  sm: { mark: 32, text: "text-base", subText: "text-[10px]", container: "gap-2" },
  md: { mark: 44, text: "text-xl", subText: "text-[11px]", container: "gap-2.5" },
  lg: { mark: 60, text: "text-2xl", subText: "text-xs", container: "gap-3" },
  xl: { mark: 84, text: "text-3xl", subText: "text-sm", container: "gap-3.5" },
  "2xl": { mark: 112, text: "text-4xl", subText: "text-base", container: "gap-4" },
}

export function Logo({
  size = "md",
  variant = "horizontal",
  animated = true,
  animationType = "float",
  animateOnScroll = true,
  showText = true,
  subtitle,
  accentColor = "red",
  textVariant = "dark",
  href,
  className,
  priority = false,
  onClick,
}: LogoProps) {
  const isCustomSize = typeof size === "number"
  const sizeConfig = !isCustomSize
    ? SIZE_MAP[size]
    : {
        mark: size,
        text: size > 60 ? "text-3xl" : size > 35 ? "text-xl" : "text-sm",
        subText: "text-xs",
        container: "gap-2.5",
      }

  const markSize = isCustomSize ? size : sizeConfig.mark

  // Scroll reaction state
  const [scrollTilt, setScrollTilt] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    if (!animateOnScroll || typeof window === "undefined") return

    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollYRef.current
      lastScrollYRef.current = currentY

      // Calculate subtle tilt based on scroll velocity (max ±6 degrees)
      const clampedTilt = Math.max(-6, Math.min(6, delta * 0.4))
      setScrollTilt(clampedTilt)
      setIsScrolling(true)

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
        setScrollTilt(0)
      }, 150)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [animateOnScroll])

  // Animation class
  const getAnimationClass = () => {
    if (!animated) return ""
    if (animationType === "loading") return "animate-logo-loading"
    if (animationType === "pulse") return "animate-logo-pulse"
    if (isScrolling) return ""
    return "animate-logo-float"
  }

  // Choose the logo asset that matches the theme palette
  const logoSrc = accentColor === "red" ? "/logo-mark-red.png" : "/logo-mark.png"

  // Text color based on textVariant
  const dataTextColor = textVariant === "light" ? "text-[#F4F1E9]" : "text-[#1B3A5C]"
  const coopTextColor = textVariant === "light" ? "text-[#EF6A6E]" : "text-[#E3474F]"
  const subtitleColor = textVariant === "light" ? "text-[#EF6A6E]" : "text-[#E3474F]"

  const content = (
    <div
      className={cn(
        "inline-flex items-center select-none group cursor-pointer",
        variant === "full" ? "flex-col text-center" : "flex-row",
        sizeConfig.container,
        className
      )}
      onClick={onClick}
    >
      {/* Emblem / Mark — clean logo only, reacts smoothly to scroll & float */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 transition-all duration-200 ease-out group-hover:scale-110",
          getAnimationClass()
        )}
        style={{
          width: markSize,
          height: markSize,
          transform: isScrolling
            ? `rotate(${scrollTilt}deg) translateY(-2px) scale(1.05)`
            : undefined,
        }}
      >
        <Image
          src={logoSrc}
          alt="DataCo-op Logo"
          width={markSize * 2}
          height={markSize * 2}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(27,58,92,0.2)] transition-transform duration-200"
          priority={priority}
        />
      </div>

      {/* Brand Text matching site theme */}
      {showText && variant !== "icon" && (
        <div className={cn("flex flex-col", variant === "full" ? "items-center mt-1" : "items-start text-left")}>
          <div className="flex items-center gap-0.5 leading-none">
            <span
              className={cn("font-bold tracking-tight uppercase transition-colors group-hover:text-[#2E567A]", dataTextColor, sizeConfig.text)}
              style={{ fontFamily: "var(--font-oswald), 'Oswald', sans-serif", letterSpacing: "0.02em" }}
            >
              DATA
            </span>
            <span
              className={cn("font-bold tracking-tight uppercase transition-colors group-hover:text-[#C93A42]", coopTextColor, sizeConfig.text)}
              style={{ fontFamily: "var(--font-oswald), 'Oswald', sans-serif", letterSpacing: "0.02em" }}
            >
              CO-OP
            </span>
          </div>

          {subtitle && (
            <span
              className={cn(
                "font-mono uppercase tracking-widest font-semibold mt-0.5",
                subtitleColor,
                sizeConfig.subText
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
      >
        {content}
      </Link>
    )
  }

  return content
}

export default Logo

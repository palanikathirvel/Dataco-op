"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  ShoppingBag,
  DollarSign,
  ClipboardList,
  Building2,
  ShieldAlert,
  Megaphone,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  actionUrl?: string | null
  senderRole?: string | null
  read: boolean
  createdAt: string
}

interface NotificationBellProps {
  variant?: "consumer" | "brand" | "admin"
}

export function NotificationBell({ variant = "consumer" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications?limit=25")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {
      // silent fallback
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 25000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  async function markAsRead(id: string, actionUrl?: string | null) {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
      if (actionUrl) {
        setIsOpen(false)
      }
    } catch {
      // fallback
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0 || markingAll) return
    setMarkingAll(true)
    try {
      const res = await fetch("/api/notifications/mark-all", { method: "POST" })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
        toast.success("All notifications marked as read")
      }
    } catch {
      toast.error("Failed to update notifications")
    } finally {
      setMarkingAll(false)
    }
  }

  function getNotificationIcon(type: string, senderRole?: string | null) {
    switch (type) {
      case "NEW_SURVEY":
        return <ClipboardList className="h-4 w-4 text-emerald-500" />
      case "PAYOUT_PROCESSED":
        return <DollarSign className="h-4 w-4 text-amber-500" />
      case "PURCHASE_VERIFIED":
        return <ShoppingBag className="h-4 w-4 text-primary" />
      case "PURCHASE_REJECTED":
        return <ShieldAlert className="h-4 w-4 text-red-500" />
      case "BRAND_REGISTRATION":
      case "RESEARCH_APPROVED":
        return <Building2 className="h-4 w-4 text-blue-500" />
      case "PROMOTION":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      case "SYSTEM_ANNOUNCEMENT":
      case "ADMIN_ALERT":
      default:
        return <Megaphone className="h-4 w-4 text-[#E3474F]" />
    }
  }

  function formatTimeAgo(dateStr: string) {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted focus:outline-none transition-colors"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E3474F] px-1 text-[10px] font-bold font-mono text-white ring-2 ring-background animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Window */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-[340px] sm:w-[380px] max-w-[92vw] bg-white dark:bg-card border-2 border-border shadow-xl rounded-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 font-sans">
          
          {/* Header */}
          <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Notification Center</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-[#E3474F]/10 text-[#E3474F] px-1.5 py-0.5 rounded">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {markingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List Stream */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
                  <Bell className="h-5 w-5 opacity-50" />
                </div>
                <p className="text-sm font-semibold text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You have no notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id, notif.actionUrl)}
                  className={`p-3.5 flex gap-3 items-start transition-colors cursor-pointer ${
                    notif.read
                      ? "bg-background hover:bg-muted/30 opacity-75"
                      : "bg-primary/5 hover:bg-primary/10 border-l-3 border-l-primary"
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type, notif.senderRole)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-foreground truncate">
                        {notif.title}
                      </p>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline mt-1.5"
                      >
                        <span>View details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer banner */}
          <div className="px-3 py-2 bg-muted/20 border-t text-[10px] font-mono text-muted-foreground flex items-center justify-between">
            <span>DataCo-op Alerts Engine</span>
            <span>Real-time Sync</span>
          </div>
        </div>
      )}
    </div>
  )
}

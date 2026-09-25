"use client"

import { useState, useEffect, useId } from "react"
import { createPortal } from "react-dom"
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
  RefreshCw,
  Inbox,
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
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const dialogTitleId = useId()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications?limit=30")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {
      // silent fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    function poll() {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchNotifications()
      }
    }

    const interval = setInterval(poll, 30000)

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchNotifications()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  async function markAsRead(id: string, actionUrl?: string | null, e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation()
    }
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

  const displayedNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read
    return true
  })

  return (
    <>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
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

      {/* Centered Notification Center Modal Overlay via Portal directly to body */}
      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false)
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-background dark:bg-card border-2 border-[#142C46] border-t-4 border-t-[#1B3A5C] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 fade-in duration-200 font-sans mx-auto">
            
            {/* Header with #1B3A5C theme */}
            <div className="px-5 py-4 bg-[#1B3A5C] border-b border-[#142C46] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id={dialogTitleId} className="text-base font-bold text-white tracking-tight">
                      Notification Center
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-mono font-bold bg-[#E3474F] text-white px-2 py-0.5 rounded-full shadow-xs">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    Real-time updates, alerts, and platform activity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={loading}
                  title="Refresh notifications"
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close notification center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Quick Actions */}
            <div className="px-4 py-2.5 bg-muted/20 border-b flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border text-xs">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    filter === "all"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                  className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                    filter === "unread"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-[#E3474F] text-[10px] text-white flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {markingAll ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  <span>Mark all as read</span>
                </button>
              )}
            </div>

            {/* Notification Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 min-h-[220px] max-h-[55vh]">
              {displayedNotifications.length === 0 ? (
                <div className="py-14 px-6 text-center flex flex-col items-center justify-center">
                  <div className="h-12 w-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground mb-3">
                    <Inbox className="h-6 w-6 opacity-60" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {filter === "unread" ? "No unread notifications" : "All caught up!"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    {filter === "unread"
                      ? "You have reviewed all your latest alerts."
                      : "You have no notifications in your history right now."}
                  </p>
                </div>
              ) : (
                displayedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) {
                        markAsRead(notif.id, notif.actionUrl)
                      }
                    }}
                    className={`p-4 flex gap-3.5 items-start transition-colors cursor-pointer group ${
                      notif.read
                        ? "bg-background hover:bg-muted/40 opacity-80 hover:opacity-100"
                        : "bg-primary/[0.04] hover:bg-primary/[0.08] border-l-4 border-l-primary"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 mt-0.5 border border-border/50">
                      {getNotificationIcon(notif.type, notif.senderRole)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {notif.title}
                        </p>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        {notif.actionUrl ? (
                          <Link
                            href={notif.actionUrl}
                            onClick={() => {
                              if (!notif.read) markAsRead(notif.id)
                              setIsOpen(false)
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            <span>View details</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span />
                        )}

                        {!notif.read && (
                          <button
                            type="button"
                            onClick={(e) => markAsRead(notif.id, null, e)}
                            className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 font-medium transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-muted/30 border-t text-[11px] font-mono text-muted-foreground flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                DataCo-op Alerts Engine
              </span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

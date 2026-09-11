"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Bell,
  Megaphone,
  Send,
  Users,
  Building2,
  Sparkles,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  History,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])

  // Form State
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [audience, setAudience] = useState<"CUSTOMERS" | "BRANDS" | "EVERYONE" | "TARGETED">("EVERYONE")
  const [type, setType] = useState("SYSTEM_ANNOUNCEMENT")
  const [actionUrl, setActionUrl] = useState("")
  const [targetEmail, setTargetEmail] = useState("")

  async function fetchHistory() {
    setHistoryLoading(true)
    try {
      const res = await fetch("/api/notifications?limit=30")
      if (res.ok) {
        const data = await res.json()
        setRecentNotifications(data.notifications || [])
      }
    } catch {
      // silent
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message")
      return
    }

    if (audience === "TARGETED" && !targetEmail.trim()) {
      toast.error("Please enter the recipient email address")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          audience,
          type,
          actionUrl,
          targetEmail,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to broadcast notification")
        return
      }

      toast.success(data.message || "Notification broadcasted successfully!")
      setTitle("")
      setMessage("")
      setActionUrl("")
      setTargetEmail("")
      fetchHistory()
    } catch {
      toast.error("Network error while broadcasting notification")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 font-sans">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Megaphone className="h-4 w-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Notification Broadcast Center</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Push real-time announcements, survey opportunities, and alerts to consumers, brand partners, or specific accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Broadcast Dispatcher Form */}
        <div className="lg:col-span-7">
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                <span>Create New Broadcast</span>
              </CardTitle>
              <CardDescription>
                Select your target cohort and dispatch push notifications immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBroadcast} className="space-y-4">
                
                {/* Target Audience */}
                <div className="space-y-1.5">
                  <Label htmlFor="audience" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Target Audience *
                  </Label>
                  <Select
                    value={audience}
                    onValueChange={(v: any) => setAudience(v)}
                  >
                    <SelectTrigger id="audience">
                      <SelectValue placeholder="Select target cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EVERYONE">🌐 Everyone (All Customers & Brands)</SelectItem>
                      <SelectItem value="CUSTOMERS">👥 All Verified Customers / Consumers</SelectItem>
                      <SelectItem value="BRANDS">🏢 All Brand Partners</SelectItem>
                      <SelectItem value="TARGETED">🎯 Specific Account (Target by Email)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Specific Email Input (Conditional) */}
                {audience === "TARGETED" && (
                  <div className="space-y-1.5 animate-in fade-in-50 duration-150">
                    <Label htmlFor="targetEmail" className="text-xs font-bold text-primary">
                      Recipient Email Address *
                    </Label>
                    <Input
                      id="targetEmail"
                      type="email"
                      placeholder="user@example.com or brand@company.com"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Notification Type & Category */}
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Notification Category *
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM_ANNOUNCEMENT">📢 System Announcement</SelectItem>
                      <SelectItem value="PROMOTION">✨ Promotion / Bounty Alert</SelectItem>
                      <SelectItem value="NEW_SURVEY">📋 New Survey Bounty Available</SelectItem>
                      <SelectItem value="ADMIN_ALERT">⚠️ Important Notice / Security Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Notification Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. ₹300 Grocery Receipt Bounty Active!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Message Details *
                  </Label>
                  <textarea
                    id="message"
                    rows={3}
                    placeholder="Provide actionable information or instructions for the recipient..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                {/* Action Link (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="actionUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Action Destination Link (Optional)
                  </Label>
                  <Input
                    id="actionUrl"
                    placeholder="e.g. /dashboard/surveys or /brand/research"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Users clicking the notification will be directed straight to this page.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold h-10 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Dispatching Broadcast...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Push Notification Now
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live In-App Preview & History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Preview Card */}
          <Card className="border-dashed border-2 bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-mono font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Live In-App Popover Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3.5 bg-background border-2 border-primary/20 rounded-lg shadow-sm flex gap-3 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-bold text-foreground truncate">
                      {title.trim() || "Notification Title Preview"}
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      Just now
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {message.trim() || "Your message body and details will render here in real-time."}
                  </p>
                  {actionUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-1.5">
                      <span>View details</span>
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Broadcasts Stream */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span>Recent Broadcasts</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchHistory}
                  disabled={historyLoading}
                  className="h-7 text-xs px-2"
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="divide-y max-h-[300px] overflow-y-auto p-0">
              {recentNotifications.length === 0 ? (
                <p className="p-6 text-center text-xs text-muted-foreground">
                  No previous broadcast logs found.
                </p>
              ) : (
                recentNotifications.slice(0, 10).map((n) => (
                  <div key={n.id} className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold truncate text-foreground">{n.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {n.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

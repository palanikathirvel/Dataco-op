"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  Award,
  Move,
} from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  sender: "bot" | "user"
  text: string
  timestamp: string
  options?: string[]
  actionLink?: { label: string; href: string }
}

const STARTER_QUESTIONS = [
  "💰 How do I earn with receipts?",
  "📊 How do brands create surveys?",
  "⚡ What are the payout rules & UPI limits?",
  "🔒 How does DPDP privacy work?",
  "🦅 About P.K Creative Agency",
  "✉️ Contact Palani Kathirvel directly",
]

export function PKAgencyChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLeadMode, setIsLeadMode] = useState(false)
  const [leadStep, setLeadStep] = useState<"name" | "email" | "message" | "done">("name")
  const [leadData, setLeadData] = useState({ name: "", email: "", message: "" })
  const [unreadCount, setUnreadCount] = useState(1)

  // Draggable / Movable Position State
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragInfo = useRef<{ startX: number; startY: number; elemX: number; elemY: number } | null>(null)
  const hasMovedRef = useRef(false)
  const launcherRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "👋 Welcome to DataCo-op! I am the **P.K Creative Agency AI Assistant**.\n\nI can help you understand verified receipt earnings, brand research campaigns, privacy protocols, or connect you directly with **Palani Kathirvel** and our engineering desk.",
      timestamp: formatTime(new Date()),
      options: STARTER_QUESTIONS,
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)
    }
  }, [messages, isOpen, isTyping])

  function handleOpen() {
    setIsOpen((prev) => !prev)
    if (!hasOpened) {
      setHasOpened(true)
      setUnreadCount(0)
    }
  }

  // Pointer events for dragging (Mouse & Touch unified)
  const handlePointerDown = (e: React.PointerEvent) => {
    hasMovedRef.current = false
    const rect = launcherRef.current?.getBoundingClientRect()
    if (!rect) return

    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: rect.left,
      elemY: rect.top,
    }
    setIsDragging(true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragInfo.current) return
      const deltaX = e.clientX - dragInfo.current.startX
      const deltaY = e.clientY - dragInfo.current.startY

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true
      }

      const btnSize = 64
      const maxX = window.innerWidth - btnSize - 10
      const maxY = window.innerHeight - btnSize - 10

      const newX = Math.max(10, Math.min(maxX, dragInfo.current.elemX + deltaX))
      const newY = Math.max(10, Math.min(maxY, dragInfo.current.elemY + deltaY))

      setPosition({ x: newX, y: newY })
    },
    [isDragging]
  )

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    dragInfo.current = null
    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}

    // If pointer didn't move significantly, treat as Click / Tap
    if (!hasMovedRef.current) {
      handleOpen()
    }
  }

  // Knowledge Engine for DataCo-op & P.K Creative Agency
  function generateBotResponse(query: string): {
    text: string
    options?: string[]
    actionLink?: { label: string; href: string }
  } {
    const q = query.toLowerCase().trim()

    // 1. Contact / Reach out / Message Creator / Lead
    if (
      q.includes("contact") ||
      q.includes("palani") ||
      q.includes("kathirvel") ||
      q.includes("agency") ||
      q.includes("hire") ||
      q.includes("email") ||
      q.includes("founder") ||
      q.includes("call") ||
      q.includes("phone")
    ) {
      return {
        text: `🏛️ **P.K Creative Agency & Lead Architect Desk**\n\n• **Founder & Lead Architect:** Palani Kathirvel\n• **Official Email:** create.pk.123@gmail.com\n• **Direct Line:** +91 9342785176\n• **Specialization:** Full-Stack Architecture, High-Performance Web Apps, Enterprise Data Platforms.\n\nYou can transmit a message through our official contact desk or continue chatting here!`,
        actionLink: { label: "Go to Contact Us Page", href: "/contact" },
        options: [
          "✉️ Transmit a message here",
          "💰 How do I earn money?",
          "📊 Brand Research Info",
        ],
      }
    }

    // 2. Earnings / Receipts
    if (
      q.includes("earn") ||
      q.includes("receipt") ||
      q.includes("upload") ||
      q.includes("amazon") ||
      q.includes("swiggy") ||
      q.includes("zomato") ||
      q.includes("flipkart") ||
      q.includes("money") ||
      q.includes("income")
    ) {
      return {
        text: `💰 **How Consumers Earn on DataCo-op:**\n\n1. **Upload Receipts:** Upload purchase invoices from Amazon, Flipkart, Swiggy, and Zomato.\n2. **AI OCR Verification:** Our engine extracts and verifies real purchase transactions in under 24 hours.\n3. **Answer Tailored Surveys:** Receive exclusive surveys paying **₹100 to ₹500+** based on verified buying habits.\n4. **Instant Cash:** Rewards are credited straight into your wallet.`,
        actionLink: { label: "Start Uploading Receipts", href: "/dashboard/purchases/new" },
        options: [
          "⚡ Payout & UPI Rules",
          "🔒 Is my private data safe?",
          "📊 How Brands Use My Data",
        ],
      }
    }

    // 3. Payouts / Wallet / UPI / Minimum threshold
    if (
      q.includes("payout") ||
      q.includes("withdraw") ||
      q.includes("upi") ||
      q.includes("wallet") ||
      q.includes("minimum") ||
      q.includes("transfer") ||
      q.includes("bank") ||
      q.includes("limit")
    ) {
      return {
        text: `⚡ **Withdrawal & UPI Payout Guidelines:**\n\n• **Minimum Payout:** ₹500 wallet balance.\n• **Payout Method:** Instant Direct UPI Transfer (GPay, PhonePe, Paytm, BHIM) or Bank IMPS.\n• **Processing SLA:** Payouts are audited and disbursed within 24 hours.\n• **Zero Platform Cut for Users:** 100% of survey bounties belong to the verified consumer.`,
        actionLink: { label: "View Consumer Profile", href: "/dashboard/profile" },
        options: [
          "💰 How to earn faster",
          "🔒 Privacy & DPDP Act",
          "✉️ Contact Support",
        ],
      }
    }

    // 4. Brands & Market Research
    if (
      q.includes("brand") ||
      q.includes("research") ||
      q.includes("survey") ||
      q.includes("company") ||
      q.includes("cohort") ||
      q.includes("audience") ||
      q.includes("analytics") ||
      q.includes("campaign")
    ) {
      return {
        text: `📊 **DataCo-op for Brands & Enterprise Research:**\n\n• **Zero-Party Authenticity:** Every survey respondent is verified by actual purchase invoices (no bots or fake survey accounts).\n• **Cohort Builder:** Target demographics by spend category, city, brand affinity, and purchase frequency.\n• **Live Analytics:** Real-time response validation, cross-tabulations, and downloadable CSV/JSON datasets.\n• **Custom Pricing:** Transparent price per verified answer with wallet-based self-service funding.`,
        actionLink: { label: "Explore Brand Portal", href: "/brand/register" },
        options: [
          "💰 Consumer Earnings",
          "🔒 DPDP Security Protocols",
          "✉️ Request Agency Consultation",
        ],
      }
    }

    // 5. Privacy / Security / DPDP Act
    if (
      q.includes("privacy") ||
      q.includes("safe") ||
      q.includes("dpdp") ||
      q.includes("security") ||
      q.includes("encrypt") ||
      q.includes("data") ||
      q.includes("legal") ||
      q.includes("delete")
    ) {
      return {
        text: `🔒 **Privacy & Data Sovereignty Guarantees:**\n\n• **DPDP Act (2023) Compliant:** You own your data. Personal Identifiable Information (PII) like names, phone numbers, and physical addresses are scrubbed.\n• **256-Bit AES Encryption:** All receipts and survey responses are stored with military-grade encryption.\n• **Right to Forget / Permanent Delete:** You can permanently delete your profile and purge all data at any time from your Profile Danger Zone.\n• **Zero Hidden Brokering:** Data is only shared in anonymized aggregate form with verified brand studies you explicitly opt into.`,
        actionLink: { label: "Read Privacy Protocol", href: "/#how-it-works" },
        options: [
          "💰 How to get started",
          "⚡ Payout Guidelines",
          "🦅 About P.K Agency",
        ],
      }
    }

    // 6. Delete account permanently
    if (q.includes("delete") || q.includes("remove account") || q.includes("cancel")) {
      return {
        text: `🗑️ **Permanent Account Deletion:**\n\nUnder our DPDP data sovereignty policy, you have the full right to delete your account:\n• **Consumers:** Go to **Dashboard > Profile > Danger Zone** and type \`DELETE\` to purge all receipts, balances, and history.\n• **Brands:** Go to **Brand Portal > Settings > Danger Zone** to permanently wipe all projects and wallet records.`,
        actionLink: { label: "Manage Profile & Security", href: "/dashboard/profile" },
        options: ["🔒 Privacy Guarantees", "✉️ Contact Helpdesk"],
      }
    }

    // Default Fallback
    return {
      text: `✨ I understand you are inquiring about: *"${query}"*.\n\nDataCo-op is India's first verified consumer data marketplace engineered by **P.K Creative Agency**.\n\nHow can I best assist you right now?`,
      options: [
        "💰 Consumer Earnings & Receipts",
        "📊 Brand Research Solutions",
        "⚡ UPI Payout Rules (₹500)",
        "✉️ Transmit Message to Agency",
      ],
    }
  }

  // Handle User Input Submission
  async function handleSend(customText?: string) {
    const messageText = (customText || input).trim()
    if (!messageText) return

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: formatTime(new Date()),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Check if user initiated direct lead transmission
    if (
      messageText.includes("Transmit a message") ||
      messageText.includes("Contact Palani") ||
      messageText.includes("Transmit Message")
    ) {
      setTimeout(() => {
        setIsTyping(false)
        setIsLeadMode(true)
        setLeadStep("name")
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: "✉️ **Direct Dispatch to Palani Kathirvel (P.K Creative Agency)**\n\nI can deliver your note directly to **create.pk.123@gmail.com**.\n\n👉 **Please enter your Full Name:**",
            timestamp: formatTime(new Date()),
          },
        ])
      }, 500)
      return
    }

    // Handle Active Lead Collection Flow
    if (isLeadMode) {
      setTimeout(async () => {
        setIsTyping(false)
        if (leadStep === "name") {
          setLeadData((d) => ({ ...d, name: messageText }))
          setLeadStep("email")
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: "bot",
              text: `Great, **${messageText}**! What is your **Email Address** so Palani can reply to you?`,
              timestamp: formatTime(new Date()),
            },
          ])
        } else if (leadStep === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(messageText)) {
            setMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                sender: "bot",
                text: "⚠️ Please enter a valid email address (e.g. `you@example.com`):",
                timestamp: formatTime(new Date()),
              },
            ])
            return
          }
          setLeadData((d) => ({ ...d, email: messageText }))
          setLeadStep("message")
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: "bot",
              text: "Got it! Please write your **Message or Inquiry Details** below:",
              timestamp: formatTime(new Date()),
            },
          ])
        } else if (leadStep === "message") {
          const finalData = { ...leadData, message: messageText }
          setLeadData(finalData)
          setLeadStep("done")
          setIsLeadMode(false)

          try {
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: finalData.name,
                email: finalData.email,
                topic: "agency",
                message: `[Submitted via P.K Agency AI Chatbot]\n\n${messageText}`,
              }),
            })

            if (res.ok) {
              toast.success("Message dispatched to create.pk.123@gmail.com!")
              setMessages((prev) => [
                ...prev,
                {
                  id: `bot-${Date.now()}`,
                  sender: "bot",
                  text: `🎉 **Message Dispatched Successfully!**\n\nThank you, **${finalData.name}**! Your message has been sent directly to **create.pk.123@gmail.com**.\n\nPalani Kathirvel & P.K Creative Agency team will review and reply to **${finalData.email}** within 4 business hours.`,
                  timestamp: formatTime(new Date()),
                  options: STARTER_QUESTIONS,
                },
              ])
            } else {
              throw new Error("API dispatch failed")
            }
          } catch {
            setMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                sender: "bot",
                text: `⚠️ Could not transmit automatically via server, but you can email directly at **create.pk.123@gmail.com** or call **+91 9342785176**.`,
                timestamp: formatTime(new Date()),
                actionLink: { label: "Open Contact Page", href: "/contact" },
                options: STARTER_QUESTIONS,
              },
            ])
          }
        }
      }, 500)
      return
    }

    // Regular Bot Query Response
    setTimeout(() => {
      const response = generateBotResponse(messageText)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: response.text,
          timestamp: formatTime(new Date()),
          options: response.options,
          actionLink: response.actionLink,
        },
      ])
    }, 450)
  }

  function handleReset() {
    setIsLeadMode(false)
    setLeadStep("name")
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: "👋 Chat reset! I am the **P.K Creative Agency AI Assistant**.\n\nHow can I help you explore DataCo-op or collaborate with our engineering team today?",
        timestamp: formatTime(new Date()),
        options: STARTER_QUESTIONS,
      },
    ])
  }

  // Floating button style: Use custom drag coordinates if moved, else default to bottom-24 right-4 on mobile and bottom-6 right-6 on desktop
  const launcherStyle: React.CSSProperties = position
    ? {
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
      }
    : {}

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          1. DRAGGABLE / MOVABLE FLOATING LAUNCHER BUTTON
      ══════════════════════════════════════════════════════════════ */}
      <div
        ref={launcherRef}
        style={launcherStyle}
        className={`${
          position ? "" : "fixed bottom-20 md:bottom-6 right-4 sm:right-6"
        } z-50 flex items-center gap-2.5 select-none touch-none`}
      >
        {/* Tooltip banner when closed */}
        {!isOpen && !isDragging && (
          <div
            onClick={handleOpen}
            className="hidden sm:flex items-center gap-2 bg-[#1B3A5C] text-[#F4F1E9] text-xs font-mono font-bold px-3 py-1.5 border-2 border-[#E3474F] shadow-[3px_3px_0_0_#1B3A5C] cursor-pointer hover:bg-[#142C46] transition-transform active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E49B30] animate-pulse" />
            <span>Ask P.K Assistant</span>
          </div>
        )}

        {/* Circular Falcon Logo Button (Draggable by user) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative group h-13 w-13 sm:h-16 sm:w-16 rounded-full bg-white border-3 border-[#1B3A5C] shadow-[4px_4px_0_0_#1B3A5C] flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-150 ${
            isDragging ? "scale-110 shadow-[6px_6px_0_0_#E3474F] ring-4 ring-[#E3474F]/50" : "hover:scale-105"
          } ${isOpen ? "ring-4 ring-[#E3474F]/40" : ""}`}
          title="Drag to move, click to chat"
        >
          {isOpen ? (
            <X className="h-6 w-6 sm:h-7 sm:w-7 text-[#1B3A5C] pointer-events-none" />
          ) : (
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 pointer-events-none">
              <Image
                src="/pk-agency-logo.png"
                alt="P.K Agency AI Assistant"
                fill
                className="object-contain filter drop-shadow-[0_2px_4px_rgba(27,58,92,0.2)]"
              />
            </div>
          )}

          {/* Drag handle icon pill */}
          <span className="absolute -bottom-1 -right-1 h-5 w-5 bg-[#1B3A5C] text-white rounded-full flex items-center justify-center border border-white opacity-80 group-hover:opacity-100">
            <Move className="h-2.5 w-2.5 text-[#E49B30]" />
          </span>

          {/* Online green indicator badge */}
          <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping opacity-75" />
          </span>

          {/* Unread badge */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 h-5 w-5 bg-[#E3474F] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center border border-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. EXPANDABLE CHATBOT DRAWER / WINDOW
      ══════════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="fixed bottom-28 md:bottom-24 right-3 left-3 sm:left-auto sm:right-6 z-50 w-auto sm:w-[410px] h-[520px] max-h-[78vh] bg-white border-3 sm:border-4 border-[#1B3A5C] shadow-[8px_8px_0_0_rgba(27,58,92,0.35)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 rounded-none font-sans">
          
          {/* Barber-Pole Vintage Strip Header */}
          <div
            className="h-2"
            style={{
              background:
                "repeating-linear-gradient(90deg, #E3474F 0 12px, #FFFFFF 12px 24px, #1B3A5C 24px 36px, #FFFFFF 36px 48px)",
            }}
          />

          {/* Header */}
          <div className="bg-[#1B3A5C] px-4 py-3 flex items-center justify-between text-[#F4F1E9] border-b-2 border-[#142C46]">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 p-0.5 bg-white rounded-lg border border-white/20 shrink-0 shadow-sm">
                <Image
                  src="/pk-agency-logo.png"
                  alt="P.K Agency Logo"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-wide uppercase font-display">
                    P.K Assistant
                  </h3>
                  <span className="text-[9px] font-mono font-bold uppercase bg-[#E3474F] text-white px-1.5 py-0.2 rounded-sm">
                    AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#9BB4CC] font-mono">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span>P.K Creative Agency &bull; Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Restart Chat"
                className="p-1.5 text-[#9BB4CC] hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Window"
                className="p-1.5 text-[#9BB4CC] hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto bg-[#F9F7F1] space-y-3.5 text-xs sm:text-[13px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="h-7 w-7 rounded-full bg-[#1B3A5C] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="h-4 w-4 text-[#E49B30]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-none p-3 shadow-[2px_2px_0_0_rgba(27,58,92,0.15)] ${
                    m.sender === "user"
                      ? "bg-[#1B3A5C] text-[#F4F1E9] border-2 border-[#1B3A5C]"
                      : "bg-white text-[#1B3A5C] border-2 border-[#1B3A5C]/40"
                  }`}
                >
                  {/* Message body with Markdown formatting support */}
                  <div className="whitespace-pre-line leading-relaxed">
                    {m.text.split("\n\n").map((paragraph, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {renderFormattedText(paragraph)}
                      </p>
                    ))}
                  </div>

                  {/* Optional Action link button */}
                  {m.actionLink && (
                    <div className="mt-3 pt-2 border-t border-dashed border-[#1B3A5C]/20">
                      <Link
                        href={m.actionLink.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 font-bold uppercase text-[11px] font-mono tracking-wider text-[#E3474F] hover:underline"
                      >
                        {m.actionLink.label} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  {/* Suggestion / Option Pills */}
                  {m.options && m.options.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t-2 border-dashed border-[#1B3A5C]/15 flex flex-wrap gap-1.5">
                      {m.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(opt)}
                          className="text-left text-[10px] sm:text-[11px] font-mono font-bold bg-[#F4F1E9] hover:bg-[#E3474F] hover:text-white text-[#1B3A5C] border border-[#1B3A5C]/30 px-2.5 py-1 transition-colors active:scale-95"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[9px] font-mono mt-1 text-right ${
                      m.sender === "user" ? "text-[#F4F1E9]/60" : "text-[#5B6472]"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {m.sender === "user" && (
                  <div className="h-7 w-7 rounded-full bg-[#E3474F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-[#5B6472] font-mono">
                <div className="h-6 w-6 rounded-full bg-[#1B3A5C] text-white flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-[#E49B30]" />
                </div>
                <div className="p-2.5 bg-white border border-[#1B3A5C]/30 shadow-sm flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-[#E3474F] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 bg-[#1B3A5C] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 bg-[#E49B30] rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Lead Mode Banner notice */}
          {isLeadMode && (
            <div className="bg-[#FEF3C7] border-t border-b border-[#D97706] px-3 py-1 text-[10px] font-mono text-[#92400E] flex items-center justify-between">
              <span>✉️ Lead Mode: Direct Transmission</span>
              <button
                type="button"
                onClick={() => {
                  setIsLeadMode(false)
                  setLeadStep("name")
                  toast.info("Lead collection cancelled")
                }}
                className="underline hover:text-black"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-2.5 sm:p-3 bg-white border-t-2 border-[#1B3A5C] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isLeadMode
                  ? leadStep === "name"
                    ? "Enter your Full Name..."
                    : leadStep === "email"
                    ? "Enter your Email Address..."
                    : "Enter your message for Palani..."
                  : "Ask P.K Assistant anything..."
              }
              className="flex-1 bg-[#F4F1E9] border-2 border-[#1B3A5C] px-3 py-2 text-xs sm:text-sm text-[#1B3A5C] focus:outline-none focus:border-[#E3474F] font-sans"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="h-9 sm:h-10 px-3 bg-[#E3474F] hover:bg-[#c9363e] disabled:opacity-50 text-white border-2 border-[#1B3A5C] font-bold text-xs uppercase flex items-center justify-center transition-transform active:translate-y-0.5 shadow-[2px_2px_0_0_#1B3A5C]"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Agency Tag Strip */}
          <div className="bg-[#142C46] px-3 py-1 text-[9px] font-mono text-[#F4F1E9]/60 flex items-center justify-between">
            <span>Powered by P.K Creative Agency</span>
            <span>create.pk.123@gmail.com</span>
          </div>
        </div>
      )}
    </>
  )
}

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-[#1B3A5C]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Clock,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Question = {
  id: string
  type: "SINGLE_CHOICE" | "MULTI_CHOICE" | "RATING" | "TEXT" | "NPS"
  question: string
  options: string[]
  required: boolean
}

export function SurveyTaker({
  surveyId,
  brandName,
  title,
  description,
  payout,
  questions,
}: {
  surveyId: string
  brandName: string
  title: string
  description: string
  payout: string
  questions: Question[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const startTimeRef = useRef(Date.now())
  const questionStartRef = useRef(Date.now())

  // Total timer (visible to user as gentle nudge)
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Reset per-question timer when step changes
  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [step])

  const current = questions[step]
  const isLast = step === questions.length - 1
  const progress = ((step + 1) / questions.length) * 100

  const canAdvance = current
    ? !current.required || (answers[current.id] !== undefined && answers[current.id] !== "")
    : true

  function setAnswer(value: any) {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.id]: value }))
  }

  function next() {
    if (!canAdvance) {
      toast.error("Please answer the question")
      return
    }
    setStep((s) => Math.min(s + 1, questions.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function submit() {
    if (submitting) return

    // Validate all required questions
    for (const q of questions) {
      if (q.required && (answers[q.id] === undefined || answers[q.id] === "")) {
        toast.error("Please answer all required questions")
        return
      }
    }
    // Validate text answers
    for (const q of questions) {
      if (q.type === "TEXT" && answers[q.id]) {
        if (String(answers[q.id]).trim().length < 10) {
          toast.error("Text answers need at least 10 characters")
          return
        }
      }
    }
    // Encourage thoughtful response
    if (secondsElapsed < 30) {
      const proceed = window.confirm(
        "You've spent less than 30 seconds. Take your time to provide thoughtful answers. Continue anyway?"
      )
      if (!proceed) return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/surveys/${surveyId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          timeSpentSeconds: secondsElapsed,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Submission failed")
        return
      }
      toast.success(`Earned ${data.payout}!`)
      router.push("/dashboard/surveys?completed=1")
    } catch (err) {
      setError("Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>This survey has no questions.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Top bar */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {brandName}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {Math.floor(secondsElapsed / 60)}:
                {String(secondsElapsed % 60).padStart(2, "0")}
              </span>
              <span className="flex items-center gap-1 font-semibold text-primary">
                <Wallet className="h-3 w-3" /> {payout}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Survey header — shown only on first step */}
          {step === 0 && (
            <div className="space-y-2 pb-2">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          )}

          {/* Current question */}
          <Card>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span>
                    Question {step + 1} of {questions.length}
                  </span>
                  {current.required && (
                    <span className="text-destructive">*</span>
                  )}
                </div>
                <h2 className="text-lg font-semibold leading-snug">
                  {current.question}
                </h2>
              </div>

              <QuestionInput
                question={current}
                value={answers[current.id]}
                onChange={setAnswer}
              />
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {!isLast ? (
              <Button onClick={next} disabled={!canAdvance}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Submit & earn {payout}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question
  value: any
  onChange: (v: any) => void
}) {
  switch (question.type) {
    case "SINGLE_CHOICE":
      return (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all",
                value === opt
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    value === opt ? "border-primary" : "border-muted-foreground/30"
                  )}
                >
                  {value === opt && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm font-medium">{opt}</span>
              </div>
            </button>
          ))}
        </div>
      )

    case "MULTI_CHOICE": {
      const selected: string[] = Array.isArray(value) ? value : []
      return (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = selected.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onChange(selected.filter((s) => s !== opt))
                  } else {
                    onChange([...selected, opt])
                  }
                }}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && (
                      <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{opt}</span>
                </div>
              </button>
            )
          })}
          <p className="text-xs text-muted-foreground">Select all that apply</p>
        </div>
      )
    }

    case "RATING":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={cn(
                  "h-12 rounded-lg border-2 font-semibold transition-all",
                  value === n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:border-primary/50"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Not at all</span>
            <span>Extremely</span>
          </div>
        </div>
      )

    case "NPS":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={cn(
                  "h-12 rounded-lg border-2 font-semibold text-sm transition-all",
                  value === n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:border-primary/50"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </div>
      )

    case "TEXT":
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full min-h-32 p-3 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
          minLength={10}
        />
      )

    default:
      return null
  }
}

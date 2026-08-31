"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  X,
  Wallet,
} from "lucide-react"
import { formatINR } from "@/lib/utils"

type QuestionType = "SINGLE_CHOICE" | "MULTI_CHOICE" | "RATING" | "TEXT" | "NPS"

interface Question {
  id: string
  type: QuestionType
  question: string
  options: string[]
  required: boolean
  order: number
}

const STEPS = ["Audience", "Sample & Budget", "Questions", "Review"] as const

const PLATFORM_FEE_PCT = 0.30

export function ResearchWizard({ cohortTags }: { cohortTags: string[] }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    selectedTags: [] as string[],
    sampleSize: 100,
    pricePerResponse: 100, // rupees
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    questions: [
      {
        id: "q1",
        type: "SINGLE_CHOICE" as QuestionType,
        question: "",
        options: ["", ""],
        required: true,
        order: 0,
      },
    ] as Question[],
  })

  const userPayout = form.sampleSize * form.pricePerResponse
  const platformFee = Math.ceil(userPayout * PLATFORM_FEE_PCT)
  const totalBudget = userPayout + platformFee

  function addQuestion() {
    setForm((f) => ({
      ...f,
      questions: [
        ...f.questions,
        {
          id: `q${f.questions.length + 1}_${Date.now()}`,
          type: "SINGLE_CHOICE",
          question: "",
          options: ["", ""],
          required: true,
          order: f.questions.length,
        },
      ],
    }))
  }

  function removeQuestion(idx: number) {
    setForm((f) => ({
      ...f,
      questions: f.questions.filter((_, i) => i !== idx),
    }))
  }

  function updateQuestion(idx: number, patch: Partial<Question>) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    }))
  }

  function addOption(qIdx: number) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, ""] } : q
      ),
    }))
  }

  function removeOption(qIdx: number, oIdx: number) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, oi) => oi !== oIdx) }
          : q
      ),
    }))
  }

  function updateOption(qIdx: number, oIdx: number, value: string) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, oi) => (oi === oIdx ? value : o)) }
          : q
      ),
    }))
  }

  function next() {
    setError(null)
    if (step === 0) {
      if (!form.title || form.title.length < 5) {
        setError("Title must be at least 5 characters")
        return
      }
      if (!form.description || form.description.length < 20) {
        setError("Description must be at least 20 characters")
        return
      }
      if (form.selectedTags.length === 0) {
        setError("Select at least one target cohort")
        return
      }
    }
    if (step === 1) {
      if (form.sampleSize < 50 || form.sampleSize > 5000) {
        setError("Sample size must be between 50 and 5000")
        return
      }
      if (form.pricePerResponse < 100) {
        setError("Price per response must be at least ₹100")
        return
      }
    }
    if (step === 2) {
      for (let i = 0; i < form.questions.length; i++) {
        const q = form.questions[i]
        if (!q.question || q.question.trim().length < 3) {
          setError(`Question ${i + 1} needs text`)
          return
        }
        if (q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") {
          const validOptions = q.options.filter((o) => o.trim().length > 0)
          if (validOptions.length < 2) {
            setError(`Question ${i + 1} needs at least 2 options`)
            return
          }
        }
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function publish() {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/brand/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          targetCohorts: form.selectedTags,
          sampleSize: form.sampleSize,
          pricePerResponse: Math.round(form.pricePerResponse * 100), // to paise
          totalBudget: Math.round(totalBudget * 100),
          expiresAt: new Date(form.expiresAt).toISOString(),
          questions: form.questions.map((q) => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.options.filter((o) => o.trim().length > 0),
            required: q.required,
            order: q.order,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to create research")
        return
      }
      toast.success("Research published!")
      router.push(`/brand/research/${data.research.id}`)
    } catch (err) {
      setError("Failed to publish. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
          <Link href="/brand/research">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New research request</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <div className="flex gap-1 pt-3">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your study</CardTitle>
            <CardDescription>Basic info and target audience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Premium Running Shoe Insights Q3"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="What do you want to learn? Why does it matter?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Target cohorts *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select the user segments you want to reach
              </p>
              {cohortTags.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No cohort tags exist yet. Users need to verify purchases first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cohortTags.map((tag) => {
                    const selected = form.selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            selectedTags: selected
                              ? f.selectedTags.filter((t) => t !== tag)
                              : [...f.selectedTags, tag],
                          }))
                        }
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-input hover:border-primary/50"
                        }`}
                      >
                        {tag.replace(/_/g, " ")}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample & budget</CardTitle>
            <CardDescription>How many responses and at what price</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sampleSize">Sample size *</Label>
                <Input
                  id="sampleSize"
                  type="number"
                  min="50"
                  max="5000"
                  value={form.sampleSize}
                  onChange={(e) =>
                    setForm({ ...form, sampleSize: parseInt(e.target.value, 10) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">Between 50 and 5,000</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerResponse">Price per response (₹) *</Label>
                <Input
                  id="pricePerResponse"
                  type="number"
                  min="100"
                  value={form.pricePerResponse}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pricePerResponse: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">Min ₹100 per user</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires on</Label>
              <Input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User payouts</span>
                <span className="font-medium">{formatINR(Math.round(userPayout * 100))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee (30%)</span>
                <span className="font-medium">{formatINR(Math.round(platformFee * 100))}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-base">
                <span className="font-semibold">Total budget</span>
                <span className="font-bold">{formatINR(Math.round(totalBudget * 100))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {form.questions.map((q, qi) => (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Question {qi + 1}
                  </CardTitle>
                  {form.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qi)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question text</Label>
                  <Input
                    placeholder="What do you want to ask?"
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={q.type}
                      onValueChange={(v) =>
                        updateQuestion(qi, {
                          type: v as QuestionType,
                          options: v === "RATING" || v === "NPS" || v === "TEXT" ? [] : q.options,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE_CHOICE">Single choice</SelectItem>
                        <SelectItem value="MULTI_CHOICE">Multiple choice</SelectItem>
                        <SelectItem value="RATING">Rating (1-10)</SelectItem>
                        <SelectItem value="NPS">NPS (0-10)</SelectItem>
                        <SelectItem value="TEXT">Text answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(qi, { required: e.target.checked })}
                        className="h-4 w-4 rounded"
                      />
                      Required
                    </label>
                  </div>
                </div>
                {(q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex gap-2">
                        <Input
                          placeholder={`Option ${oi + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                        />
                        {q.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(qi, oi)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(qi)}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add option
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
            <Plus className="h-4 w-4" /> Add question
          </Button>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & publish</CardTitle>
            <CardDescription>Double-check everything before paying</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReviewRow label="Title" value={form.title} />
            <ReviewRow label="Description" value={form.description} />
            <ReviewRow
              label="Target cohorts"
              value={
                <div className="flex flex-wrap gap-1 justify-end">
                  {form.selectedTags.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              }
            />
            <ReviewRow label="Sample size" value={`${form.sampleSize} responses`} />
            <ReviewRow
              label="Price per response"
              value={`₹${form.pricePerResponse}`}
            />
            <ReviewRow
              label="Questions"
              value={`${form.questions.length} question${form.questions.length === 1 ? "" : "s"}`}
            />
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Wallet className="h-4 w-4" />
                Total charge to wallet
              </div>
              <div className="text-2xl font-bold">
                {formatINR(Math.round(totalBudget * 100))}
              </div>
              <p className="text-xs text-muted-foreground">
                Includes 30% platform fee. Funds are held until the study completes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 0 || submitting}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={publish} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Pay {formatINR(Math.round(totalBudget * 100))} & publish
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-sm font-medium text-right max-w-md">{value}</div>
    </div>
  )
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, calculateTotalBudget } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, Users, DollarSign, FileText, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const COHORT_TAGS = [
  "premium_skincare_buyer",
  "frequent_foodie",
  "premium_electronics_buyer",
  "skincare_enthusiast",
  "heavy_grocery_buyer",
  "amazon_power_user",
  "flipkart_power_user",
];

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Single Choice", description: "Pick one option" },
  { value: "MULTI_CHOICE", label: "Multiple Choice", description: "Pick multiple options" },
  { value: "RATING", label: "Rating (1-10)", description: "Rate on a scale" },
  { value: "TEXT", label: "Text Response", description: "Open-ended answer" },
  { value: "NPS", label: "NPS (0-10)", description: "Net Promoter Score" },
];

const formatTag = (tag: string) => tag.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function NewResearchPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    targetCohorts: [] as string[],
    // Step 2
    sampleSize: 100,
    pricePerResponse: 200,
    // Step 3
    questions: [] as any[],
    // Step 4
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalBudget = calculateTotalBudget(formData.sampleSize, formData.pricePerResponse);
  const platformFee = totalBudget - formData.sampleSize * formData.pricePerResponse;

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCohortToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCohorts: prev.targetCohorts.includes(tag)
        ? prev.targetCohorts.filter((t) => t !== tag)
        : [...prev.targetCohorts, tag],
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now().toString(),
        type: "SINGLE_CHOICE",
        question: "",
        options: ["", ""],
        required: true,
      }],
    }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const addOption = (qIndex: number) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], options: [...newQuestions[qIndex].options, ""] };
      return { ...prev, questions: newQuestions };
    });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], options: newQuestions[qIndex].options.filter((_: any, i: number) => i !== oIndex) };
      return { ...prev, questions: newQuestions };
    });
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({ ...prev, questions: prev.questions.filter((_: any, i: number) => i !== index) }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/brand/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          targetCohorts: formData.targetCohorts,
          sampleSize: formData.sampleSize,
          pricePerResponse: formData.pricePerResponse,
          questions: formData.questions.map((q: any) => ({
            type: q.type,
            question: q.question,
            options: q.type === "TEXT" || q.type === "RATING" || q.type === "NPS" ? [] : q.options.filter((o: string) => o.trim()),
            required: q.required,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create research");

      toast({ title: "Success", description: "Research created! Proceed to payment." });
      router.push(`/brand/research/${data.researchRequest.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Target Audience", icon: Users, desc: "Define who should take your survey" },
    { num: 2, title: "Sample & Pricing", icon: DollarSign, desc: "Set sample size and price per response" },
    { num: 3, title: "Build Survey", icon: FileText, desc: "Create your questions" },
    { num: 4, title: "Review & Pay", icon: CreditCard, desc: "Review and launch your study" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Research</h1>
          <p className="text-muted-foreground">4-step wizard to launch your study</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              i + 1 < step ? "bg-primary text-primary-foreground" : i + 1 === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {i + 1 < step ? <Check className="h-4 w-4" /> : s.num}
            </div>
            {i < steps.length - 1 && <div className={`h-1 w-16 ${i + 1 < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step - 1].title}</CardTitle>
          <CardDescription>{steps[step - 1].desc}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Study Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g., Skincare Preferences Survey"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Study Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe what you want to learn from this study..."
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label className="block mb-3 font-medium">Select Target Cohorts</Label>
                <div className="flex flex-wrap gap-2">
                  {COHORT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleCohortToggle(tag)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${
                        formData.targetCohorts.includes(tag)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/20 hover:border-primary/50"
                      }`}
                    >
                      {formatTag(tag)}
                      {formData.targetCohorts.includes(tag) && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {formData.targetCohorts.length > 0
                    ? `Targeting ${formData.targetCohorts.length} cohort${formData.targetCohorts.length > 1 ? "s" : ""}`
                    : "Select at least one cohort to continue"}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sampleSize">Sample Size *</Label>
                  <Input
                    id="sampleSize"
                    type="number"
                    min="50"
                    max="5000"
                    value={formData.sampleSize}
                    onChange={(e) => updateField("sampleSize", parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">Minimum 50, Maximum 5000</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerResponse">Price per Response (₹) *</Label>
                  <Input
                    id="pricePerResponse"
                    type="number"
                    min="100"
                    max="1000"
                    value={formData.pricePerResponse}
                    onChange={(e) => updateField("pricePerResponse", parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">Minimum ₹100 per response</p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Responses: {formData.sampleSize} × ₹{formData.pricePerResponse}</span>
                  <span>{formatCurrency(formData.sampleSize * formData.pricePerResponse)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (30%)</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Budget</span>
                  <span className="text-primary">{formatCurrency(totalBudget)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You pay {formatCurrency(totalBudget)}. {formData.sampleSize} users × ₹{formData.pricePerResponse} = {formatCurrency(formData.sampleSize * formData.pricePerResponse)}. Platform fee = {formatCurrency(platformFee)}.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {formData.questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-2 font-medium">No questions yet</h3>
                  <p className="text-muted-foreground text-sm">Add your first question to get started</p>
                  <Button className="mt-4 gap-2" onClick={addQuestion}>
                    <ChevronRight className="h-4 w-4" />
                    Add Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.questions.map((q: any, qIndex: number) => (
                    <Card key={q.id} className="border-primary/20">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                          <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)}>
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Question Type</Label>
                          <Select
                            value={q.type}
                            onValueChange={(v) => updateQuestion(qIndex, "type", v)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {QUESTION_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Question Text *</Label>
                          <Input
                            value={q.question}
                            onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                            placeholder="Enter your question..."
                          />
                        </div>

                        {q.type !== "TEXT" && q.type !== "RATING" && q.type !== "NPS" && (
                          <div className="space-y-2">
                            <Label>Options *</Label>
                            <div className="space-y-2">
                              {q.options.map((opt: string, oIndex: number) => (
                                <div key={oIndex} className="flex gap-2">
                                  <Input
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...q.options];
                                      newOpts[oIndex] = e.target.value;
                                      updateQuestion(qIndex, "options", newOpts);
                                    }}
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                  {q.options.length > 2 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)}>
                                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button variant="outline" size="sm" onClick={() => addOption(qIndex)} className="w-full">
                                Add Option
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`required-${q.id}`}
                            checked={q.required}
                            onChange={(e) => updateQuestion(qIndex, "required", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label htmlFor={`required-${q.id}`} className="text-sm">Required</Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="gap-2" onClick={addQuestion}>
                    <ChevronRight className="h-4 w-4" />
                    Add Another Question
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Review Your Study
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{formData.title || "Not set"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Target Cohorts</p>
                      <p className="font-medium">{formData.targetCohorts.map(formatTag).join(", ") || "None"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Sample Size</p>
                      <p className="font-medium">{formData.sampleSize}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Price per Response</p>
                      <p className="font-medium">{formatCurrency(formData.pricePerResponse)}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(totalBudget)}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="font-medium">{formData.questions.length} question(s)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Payment Required</p>
                <p className="text-sm text-muted-foreground">
                  After review, you'll be redirected to Razorpay to pay {formatCurrency(totalBudget)}.
                  Your study will go live once payment is confirmed.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t mt-6">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              {step < 4 ? (
                <Button onClick={() => {
                  if (step === 1) {
                    if (!formData.title.trim()) {
                      toast({ title: "Required", description: "Enter a study title", variant: "destructive" });
                      return;
                    }
                    if (!formData.description.trim()) {
                      toast({ title: "Required", description: "Enter a study description", variant: "destructive" });
                      return;
                    }
                    if (formData.targetCohorts.length === 0) {
                      toast({ title: "Required", description: "Select at least one cohort", variant: "destructive" });
                      return;
                    }
                  }
                  if (step === 3 && formData.questions.length === 0) {
                    toast({ title: "Required", description: "Add at least one question", variant: "destructive" });
                    return;
                  }
                  setStep((s) => s + 1);
                }}>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? "Creating..." : "Create & Pay"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
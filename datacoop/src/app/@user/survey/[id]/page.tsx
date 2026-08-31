"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";
import { Clock, ArrowRight, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const QUESTION_TYPES = {
  SINGLE_CHOICE: "single_choice",
  MULTI_CHOICE: "multi_choice",
  RATING: "rating",
  TEXT: "text",
  NPS: "nps",
};

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      const res = await fetch(`/api/surveys/${surveyId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Survey not found");
      setSurvey(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => ({
        ...prev,
        [survey?.questions[currentQuestionIndex]?.id || ""]: Math.floor((Date.now() - questionStartTime) / 1000),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestionIndex, questionStartTime, survey?.questions]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const currentQuestion = survey?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.id];
    if (currentQuestion.required && (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0))) {
      toast({ title: "Required", description: "Please answer this question", variant: "destructive" });
      return;
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      setQuestionStartTime(Date.now());
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setQuestionStartTime(Date.now());
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    const lastQuestion = survey?.questions[currentQuestionIndex];
    const answer = answers[lastQuestion?.id];
    if (lastQuestion?.required && (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0))) {
      toast({ title: "Required", description: "Please answer this question", variant: "destructive" });
      return;
    }

    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    if (totalTimeSpent < 180) {
      if (!confirm("You spent less than 3 minutes on this survey. Are you sure you want to submit?")) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const answerData = survey.questions.map((q: any) => ({
        questionId: q.id,
        value: JSON.stringify(answers[q.id] || ""),
        timeSpent: timeSpent[q.id] || 0,
      }));

      const res = await fetch(`/api/surveys/${surveyId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerData, totalTimeSpent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      toast({ title: "Success", description: `Survey submitted! ₹${survey.pricePerResponse} will be added to your wallet after review.` });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">DC</span>
            </div>
            <span className="font-semibold text-xl">DataCoop</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-primary">
              Earn {formatCurrency(survey.pricePerResponse)}
            </span>
            <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setShowExitConfirm(true)}>Exit</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave Survey?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your progress will be lost. Are you sure you want to exit?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={() => router.push("/dashboard")}>Exit</AlertDialogAction>
                <AlertDialogCancel>Continue</AlertDialogCancel>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Question {currentQuestionIndex + 1} of {survey.questions.length}</span>
            <span>{Math.floor(progress)}% complete</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-primary font-medium">{survey.brand?.name}</span>
                <CardTitle className="mt-1">{survey.title}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">{survey.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatCurrency(survey.pricePerResponse)}</p>
                <p className="text-xs text-muted-foreground">Est. {survey.estimatedMinutes || 5} min</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-medium mb-2 block">{currentQuestion.question}</Label>
                {currentQuestion.type === QUESTION_TYPES.SINGLE_CHOICE && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={(v) => handleAnswerChange(currentQuestion.id, v)}
                    className="space-y-3"
                  >
                    {currentQuestion.options?.map((option: string, i: number) => (
                      <div key={i} className="relative">
                        <RadioGroupItem value={option} className="peer" />
                        <Label htmlFor={option} className="flex w-full cursor-pointer items-center p-4 border rounded-lg hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5">
                          <span className="text-muted-foreground font-mono text-sm mr-3">{String.fromCharCode(65 + i)}.</span>
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === QUESTION_TYPES.MULTI_CHOICE && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option: string, i: number) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={answers[currentQuestion.id]?.includes(option)}
                          onChange={(e) => handleAnswerChange(
                            currentQuestion.id,
                            e.target.checked
                              ? [...(answers[currentQuestion.id] || []), option]
                              : (answers[currentQuestion.id] || []).filter((o: string) => o !== option)
                          )}
                        />
                        <span className="text-muted-foreground font-mono text-sm">{String.fromCharCode(65 + i)}.</span>
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QUESTION_TYPES.RATING && (
                  <div className="flex gap-2" role="radiogroup">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        role="radio"
                        aria-checked={answers[currentQuestion.id] === num}
                        onClick={() => handleAnswerChange(currentQuestion.id, num)}
                        className={`flex-1 aspect-square flex items-center justify-center rounded-lg border-2 text-lg font-medium transition-colors ${
                          answers[currentQuestion.id] === num
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QUESTION_TYPES.NPS && (
                  <div className="flex gap-1 overflow-x-auto pb-2" role="radiogroup">
                    {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                      <button
                        key={num}
                        type="button"
                        role="radio"
                        aria-checked={answers[currentQuestion.id] === num}
                        onClick={() => handleAnswerChange(currentQuestion.id, num)}
                        className={`flex-1 min-w-[40px] aspect-square flex items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors ${
                          answers[currentQuestion.id] === num
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {(currentQuestion.type === QUESTION_TYPES.TEXT) && (
                  <Textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[120px]"
                  />
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="gap-2"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Previous
                </Button>

                {currentQuestionIndex === survey.questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                    {isSubmitting ? "Submitting..." : "Submit Survey"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="gap-2 w-full sm:w-auto">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
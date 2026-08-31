import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { SurveyTaker } from "./SurveyTaker"
import { formatINR } from "@/lib/utils"

export default async function SurveyPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/login?callbackUrl=/survey/${params.id}`)

  const survey = await prisma.researchRequest.findUnique({
    where: { id: params.id },
    include: {
      brand: { select: { name: true } },
      SurveyQuestion: { orderBy: { order: "asc" } },
      responses: { where: { userId: session.user.id } },
    },
  })

  if (!survey) notFound()
  if (survey.status !== "ACTIVE") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold">Survey not available</h1>
          <p className="text-muted-foreground mt-2">
            This survey is no longer accepting responses.
          </p>
        </div>
      </div>
    )
  }
  if (survey.responses.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold">Already completed</h1>
          <p className="text-muted-foreground mt-2">
            You&apos;ve already responded to this survey.
          </p>
          <a href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
            Back to dashboard →
          </a>
        </div>
      </div>
    )
  }

  // Check if expired
  if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold">Survey expired</h1>
          <p className="text-muted-foreground mt-2">
            This survey is no longer accepting responses.
          </p>
        </div>
      </div>
    )
  }

  // Format questions for client component
  const questions = survey.SurveyQuestion.map((q) => ({
    id: q.id,
    type: q.type as "SINGLE_CHOICE" | "MULTI_CHOICE" | "RATING" | "TEXT" | "NPS",
    question: q.question,
    options: q.options,
    required: q.required,
  }))

  return (
    <SurveyTaker
      surveyId={survey.id}
      brandName={survey.brand.name}
      title={survey.title}
      description={survey.description}
      payout={formatINR(survey.pricePerResponse)}
      questions={questions}
    />
  )
}

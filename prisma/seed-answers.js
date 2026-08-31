// Add SurveyAnswer records so the research results page can show real data
const { PrismaClient } = require("@prisma/client")
const { randomUUID } = require("crypto")
const prisma = new PrismaClient()
async function main() {
  const response = await prisma.surveyResponse.findFirst({
    where: { status: "SUBMITTED" },
    include: { researchRequest: { include: { SurveyQuestion: true } } },
  })
  if (!response) {
    console.log("No submitted response to backfill")
    return
  }
  console.log(`Backfilling answers for response ${response.id}`)

  const answers = {
    "bcc67666-ca67-4151-ad4f-9c17dd8f95d4": "Daily",
    "6e8c3fe9-4214-4eb4-bf25-0b41da4bbacc": "Lighter weight",
    "f8feeca5-7f62-4ade-9180-cd44faab6007": "8",
    "bea3265e-84e4-4ed8-bf0a-1954e6fcea29": "I wish they had more color options",
  }

  for (const [qid, val] of Object.entries(answers)) {
    try {
      await prisma.surveyAnswer.create({
        data: {
          id: randomUUID(),
          responseId: response.id,
          questionId: qid,
          value: val,
          updatedAt: new Date(),
        },
      })
    } catch (e) {
      console.log("Skip (likely duplicate):", e.message.split("\n")[0])
    }
  }
  console.log("Done")
}
main().catch(console.error).finally(() => prisma.$disconnect())

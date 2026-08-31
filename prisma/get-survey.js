const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
async function main() {
  const r = await prisma.researchRequest.findFirst({
    where: { status: "ACTIVE" },
    include: { SurveyQuestion: true, brand: { select: { name: true } } },
  })
  console.log(JSON.stringify({
    id: r.id,
    brand: r.brand.name,
    price: Number(r.pricePerResponse),
    questions: r.SurveyQuestion.map(q => ({ id: q.id, order: q.order, type: q.type, text: q.question, options: q.options })),
  }, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
async function main() {
  const tags = await prisma.cohortTag.findMany({
    where: { user: { email: "testuser@example.com" } },
    orderBy: { createdAt: "asc" },
  })
  console.log("Cohort tags for testuser:")
  tags.forEach((t) => console.log(` - ${t.tag} (confidence: ${t.confidenceScore})`))
  const p = await prisma.purchase.findFirst({
    where: { productName: "Boat Airdopes 141" },
  })
  console.log("\nBoat purchase status:", p?.status)
}
main().catch(console.error).finally(() => prisma.$disconnect())

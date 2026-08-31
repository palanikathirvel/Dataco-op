// Create a pending purchase, then test admin verify API end-to-end
const { PrismaClient } = require("@prisma/client")
const { randomUUID } = require("crypto")
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.findUnique({ where: { email: "testuser@example.com" } })
  // Create a fresh pending purchase
  const purchase = await prisma.purchase.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      platform: "FLIPKART",
      productName: "Boat Airdopes 141",
      category: "ELECTRONICS",
      brand: "Boat",
      amount: 129900, // paise = ₹1299
      purchaseDate: new Date("2026-08-20"),
      orderId: "OD" + Date.now().toString().padStart(16, "0").slice(-16),
      status: "PENDING_VERIFICATION",
      method: "SCREENSHOT",
      updatedAt: new Date(),
    },
  })
  console.log("Created pending purchase:", purchase.id)
}
main().catch(console.error).finally(() => prisma.$disconnect())

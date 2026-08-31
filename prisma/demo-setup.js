// Demo data setup: creates a test brand, a research request with questions,
// and a verified purchase for the test user. Run after admin-setup.js.
// Usage: node prisma/demo-setup.js
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const { randomUUID } = require("crypto")

const prisma = new PrismaClient()

async function main() {
  // Brand
  const brandEmail = "nike@brand.com"
  let brand = await prisma.brand.findUnique({ where: { email: brandEmail } })
  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        id: randomUUID(),
        email: brandEmail,
        passwordHash: await bcrypt.hash("brand123", 10),
        name: "Nike India",
        website: "https://nike.com/in",
        industry: "SPORTS",
        status: "APPROVED",
        walletBalance: 1000000, // ₹10,000
        totalSpent: 0,
        updatedAt: new Date(),
      },
    })
    console.log(`✓ Brand created: ${brand.email}`)
  } else {
    console.log(`✓ Brand exists: ${brand.email}`)
  }

  // User
  const userEmail = "testuser@example.com"
  let user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: userEmail,
        passwordHash: await bcrypt.hash("test123", 10),
        name: "Arjun Sharma",
        phone: "9876543210",
        age: 28,
        gender: "MALE",
        city: "Mumbai",
        pincode: "400001",
        role: "USER",
        kycStatus: "VERIFIED",
        walletBalance: 50000, // ₹500
        totalEarned: 50000,
        upiId: "arjun@okhdfcbank",
      },
    })
    console.log(`✓ User created: ${user.email}`)
  } else {
    console.log(`✓ User exists: ${user.email}`)
  }

  // Verified purchase
  const existingPurchase = await prisma.purchase.findFirst({
    where: { userId: user.id, status: "VERIFIED" },
  })
  if (!existingPurchase) {
    const purchase = await prisma.purchase.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        platform: "AMAZON",
        productName: "Nike Air Zoom Pegasus 40",
        category: "FOOTWEAR",
        brand: "Nike",
        amount: 849900, // paise = ₹8499
        purchaseDate: new Date("2026-06-15"),
        orderId: "402-1234567-8912345",
        status: "VERIFIED",
        method: "SCREENSHOT",
        verifiedAt: new Date(),
        updatedAt: new Date(),
      },
    })
    // Cohort tags
    await prisma.cohortTag.upsert({
      where: { userId_tag: { userId: user.id, tag: "footwear_buyer" } },
      create: { id: randomUUID(), userId: user.id, tag: "footwear_buyer", confidenceScore: 0.95 },
      update: {},
    })
    await prisma.cohortTag.upsert({
      where: { userId_tag: { userId: user.id, tag: "premium_buyer" } },
      create: { id: randomUUID(), userId: user.id, tag: "premium_buyer", confidenceScore: 0.9 },
      update: {},
    })
    console.log(`✓ Purchase + cohort tags created`)
  } else {
    console.log(`✓ Verified purchase exists`)
  }

  // Research request
  const existingResearch = await prisma.researchRequest.findFirst({
    where: { brandId: brand.id, status: "ACTIVE" },
  })
  if (!existingResearch) {
    const researchId = randomUUID()
    await prisma.researchRequest.create({
      data: {
        id: researchId,
        brandId: brand.id,
        title: "Running Shoe Feedback Q3 2026",
        description: "Help us improve our next generation of running shoes. Your feedback shapes the future of Nike running.",
        targetCohorts: ["footwear_buyer", "premium_buyer"],
        sampleSize: 500,
        pricePerResponse: 10000, // ₹100
        totalBudget: 650000, // ₹6500
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        SurveyQuestion: {
          create: [
            {
              id: randomUUID(),
              type: "SINGLE_CHOICE",
              question: "How often do you use your running shoes?",
              options: ["Daily", "2-3 times a week", "Once a week", "Rarely"],
              required: true,
              order: 0,
              updatedAt: new Date(),
            },
            {
              id: randomUUID(),
              type: "SINGLE_CHOICE",
              question: "What would make you pay 20% more for shoes?",
              options: ["Lighter weight", "Better cushioning", "More durability", "Sustainability"],
              required: true,
              order: 1,
              updatedAt: new Date(),
            },
            {
              id: randomUUID(),
              type: "RATING",
              question: "Rate your overall satisfaction with Nike (1-10)",
              options: [],
              required: true,
              order: 2,
              updatedAt: new Date(),
            },
            {
              id: randomUUID(),
              type: "TEXT",
              question: "What would you change about your current running shoes?",
              options: [],
              required: false,
              order: 3,
              updatedAt: new Date(),
            },
          ],
        },
      },
    })
    console.log(`✓ Research request created`)
  } else {
    console.log(`✓ Research request exists`)
  }

  console.log("\n=== LOGIN CREDENTIALS ===")
  console.log("Admin:   admin@datacoop.in / admin123")
  console.log("Brand:   nike@brand.com / brand123")
  console.log("User:    testuser@example.com / test123")
  console.log("========================\n")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

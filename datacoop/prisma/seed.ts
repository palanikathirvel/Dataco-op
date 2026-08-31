// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@datacoop.in" },
    update: {},
    create: {
      email: "admin@datacoop.in",
      passwordHash: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      status: "ACTIVE",
      dpdpConsent: true,
      dpdpConsentAt: new Date(),
    },
  });
  console.log("✅ Created admin:", admin.email);

  // Create test users with verified purchases
  const userPassword = await bcrypt.hash("user123", 12);
  
  const user1 = await prisma.user.upsert({
    where: { email: "user1@test.com" },
    update: {},
    create: {
      email: "user1@test.com",
      passwordHash: userPassword,
      name: "Priya Sharma",
      age: 28,
      gender: "FEMALE",
      city: "Mumbai",
      cityTier: "Tier 1",
      phone: "+919876543210",
      upiId: "priya.sharma@upi",
      role: "USER",
      status: "ACTIVE",
      dpdpConsent: true,
      dpdpConsentAt: new Date(),
      walletBalance: 2500.00,
      totalEarned: 5000.00,
    },
  });
  console.log("✅ Created user:", user1.email);

  const user2 = await prisma.user.upsert({
    where: { email: "user2@test.com" },
    update: {},
    create: {
      email: "user2@test.com",
      passwordHash: userPassword,
      name: "Rahul Kumar",
      age: 32,
      gender: "MALE",
      city: "Bangalore",
      cityTier: "Tier 1",
      phone: "+919876543211",
      upiId: "rahul.kumar@upi",
      role: "USER",
      status: "ACTIVE",
      dpdpConsent: true,
      dpdpConsentAt: new Date(),
      walletBalance: 1800.00,
      totalEarned: 3500.00,
    },
  });
  console.log("✅ Created user:", user2.email);

  const user3 = await prisma.user.upsert({
    where: { email: "user3@test.com" },
    update: {},
    create: {
      email: "user3@test.com",
      passwordHash: userPassword,
      name: "Anita Patel",
      age: 25,
      gender: "FEMALE",
      city: "Ahmedabad",
      cityTier: "Tier 1",
      phone: "+919876543212",
      upiId: "anita.patel@upi",
      role: "USER",
      status: "ACTIVE",
      dpdpConsent: true,
      dpdpConsentAt: new Date(),
      walletBalance: 3200.00,
      totalEarned: 6000.00,
    },
  });
  console.log("✅ Created user:", user3.email);

  // Create verified purchases for users
  const purchases = [
    {
      userId: user1.id,
      platform: "AMAZON",
      productName: "Cetaphil Gentle Skin Cleanser 473ml",
      brand: "Cetaphil",
      category: "SKINCARE",
      amount: 1299.00,
      orderId: "403-1234567-7654321",
      purchaseDate: new Date("2024-11-15"),
      status: "VERIFIED" as const,
      method: "SCREENSHOT" as const,
      screenshotUrl: "https://example.com/receipt1.jpg",
      verifiedAt: new Date("2024-11-16"),
    },
    {
      userId: user1.id,
      platform: "NYKAA",
      productName: "The Ordinary Niacinamide 10% + Zinc 1%",
      brand: "The Ordinary",
      category: "SKINCARE",
      amount: 899.00,
      orderId: "NYK1234567890",
      purchaseDate: new Date("2024-11-20"),
      status: "VERIFIED" as const,
      method: "SCREENSHOT" as const,
      screenshotUrl: "https://example.com/receipt2.jpg",
      verifiedAt: new Date("2024-11-21"),
    },
    {
      userId: user2.id,
      platform: "FLIPKART",
      productName: "Samsung Galaxy S24 Ultra 256GB",
      brand: "Samsung",
      category: "ELECTRONICS",
      amount: 129999.00,
      orderId: "OD1234567890123456",
      purchaseDate: new Date("2024-11-10"),
      status: "VERIFIED" as const,
      method: "SCREENSHOT" as const,
      screenshotUrl: "https://example.com/receipt3.jpg",
      verifiedAt: new Date("2024-11-11"),
    },
    {
      userId: user2.id,
      platform: "SWIGGY",
      productName: "Pizza Order - Dominos",
      brand: "Dominos",
      category: "FOOD_DELIVERY",
      amount: 450.00,
      orderId: "1234567890",
      purchaseDate: new Date("2024-11-18"),
      status: "VERIFIED" as const,
      method: "SCREENSHOT" as const,
      screenshotUrl: "https://example.com/receipt4.jpg",
      verifiedAt: new Date("2024-11-19"),
    },
    {
      userId: user3.id,
      platform: "AMAZON",
      productName: "Lakme Absolute Matte Melt Liquid Lip Color",
      brand: "Lakme",
      category: "MAKEUP",
      amount: 699.00,
      orderId: "403-7654321-1234567",
      purchaseDate: new Date("2024-11-12"),
      status: "VERIFIED" as const,
      method: "SCREENSHOT" as const,
      screenshotUrl: "https://example.com/receipt5.jpg",
      verifiedAt: new Date("2024-11-13"),
    },
  ];

  for (const purchase of purchases) {
    await prisma.purchase.upsert({
      where: { id: `seed-${purchase.userId}-${purchase.orderId}` },
      update: {},
      create: {
        id: `seed-${purchase.userId}-${purchase.orderId}`,
        userId: purchase.userId,
        platform: purchase.platform,
        productName: purchase.productName,
        brand: purchase.brand,
        category: purchase.category,
        amount: purchase.amount,
        orderId: purchase.orderId,
        purchaseDate: purchase.purchaseDate,
        status: purchase.status,
        method: purchase.method,
        screenshotUrl: purchase.screenshotUrl,
        verifiedAt: purchase.verifiedAt,
      },
    });
  }
  console.log("✅ Created verified purchases");

  // Create cohort tags
  const cohortTags = [
    { userId: user1.id, tag: "skincare_enthusiast" },
    { userId: user1.id, tag: "premium_skincare_buyer" },
    { userId: user2.id, tag: "premium_electronics_buyer" },
    { userId: user2.id, tag: "frequent_foodie" },
    { userId: user3.id, tag: "skincare_enthusiast" },
  ];

  for (const tag of cohortTags) {
    await prisma.cohortTag.upsert({
      where: { userId_tag: { userId: tag.userId, tag: tag.tag } },
      update: {},
      create: { userId: tag.userId, tag: tag.tag },
    });
  }
  console.log("✅ Created cohort tags");

  // Create test brand
  const brandPassword = await bcrypt.hash("brand123", 12);
  const brand = await prisma.brand.upsert({
    where: { email: "brand@test.com" },
    update: {},
    create: {
      email: "brand@test.com",
      passwordHash: brandPassword,
      name: "GlowSkincare India",
      website: "https://glowskincare.in",
      industry: "Beauty & Personal Care",
      contactPerson: "Amit Shah",
      contactPhone: "+919876543200",
      status: "APPROVED",
      approvedAt: new Date(),
      walletBalance: 50000.00,
      totalSpent: 25000.00,
    },
  });
  console.log("✅ Created brand:", brand.email);

  // Create test research request
  const research = await prisma.researchRequest.upsert({
    where: { id: "seed-research-1" },
    update: {},
    create: {
      id: "seed-research-1",
      brandId: brand.id,
      title: "Skincare Product Preferences Survey",
      description: "We want to understand what Indian consumers look for in their daily skincare routine. Help us build better products!",
      targetCohorts: ["skincare_enthusiast", "premium_skincare_buyer"],
      sampleSize: 100,
      pricePerResponse: 200.00,
      platformFee: 0.30,
      totalBudget: 26000.00,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Created research request:", research.title);

  // Create survey questions
  const questions = [
    {
      researchRequestId: research.id,
      type: "SINGLE_CHOICE",
      question: "What is your primary skin concern?",
      options: ["Acne", "Dryness", "Aging", "Hyperpigmentation", "Sensitivity", "None"],
      required: true,
      order: 0,
    },
    {
      researchRequestId: research.id,
      type: "MULTI_CHOICE",
      question: "Which skincare ingredients do you actively look for? (Select all that apply)",
      options: ["Hyaluronic Acid", "Niacinamide", "Vitamin C", "Retinol", "Ceramides", "Salicylic Acid"],
      required: true,
      order: 1,
    },
    {
      researchRequestId: research.id,
      type: "RATING",
      question: "How important is 'clean beauty' (paraben-free, sulfate-free) to you?",
      options: [],
      required: true,
      order: 2,
    },
    {
      researchRequestId: research.id,
      type: "NPS",
      question: "How likely are you to recommend your current skincare brand to a friend?",
      options: [],
      required: true,
      order: 3,
    },
    {
      researchRequestId: research.id,
      type: "TEXT",
      question: "What is the one skincare product you cannot live without?",
      options: [],
      required: false,
      order: 4,
    },
  ];

  for (const question of questions) {
    await prisma.surveyQuestion.upsert({
      where: { id: `seed-q-${question.researchRequestId}-${question.order}` },
      update: {},
      create: {
        id: `seed-q-${question.researchRequestId}-${question.order}`,
        researchRequestId: question.researchRequestId,
        type: question.type,
        question: question.question,
        options: question.options,
        required: question.required,
        order: question.order,
      },
    });
  }
  console.log("✅ Created survey questions");

  // Create test survey responses
  for (const user of [user1, user3]) {
    const existingResponse = await prisma.surveyResponse.findUnique({
      where: { userId_researchRequestId: { userId: user.id, researchRequestId: research.id } },
    });

    if (!existingResponse) {
      const response = await prisma.surveyResponse.create({
        data: {
          userId: user.id,
          researchRequestId: research.id,
          status: "APPROVED",
          startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
          reviewedAt: new Date(),
          reviewedBy: admin.id,
          timeSpent: 300,
          answers: {
            create: questions.map((q, i) => ({
              questionId: `seed-q-${research.id}-${i}`,
              value: JSON.stringify(i === 0 ? "Acne" : i === 1 ? ["Hyaluronic Acid", "Niacinamide"] : i === 2 ? "8" : i === 3 ? "9" : "Vitamin C Serum"),
              timeSpent: 60,
            })),
          },
        },
      });

      await prisma.transaction.create({
        data: {
          userId: user.id,
          researchRequestId: research.id,
          type: "SURVEY_EARNING",
          amount: Number(research.pricePerResponse),
          balanceBefore: 0,
          balanceAfter: Number(research.pricePerResponse),
          description: `Survey earning: ${research.title}`,
        },
      });

      console.log(`✅ Created survey response for ${user.email}`);
    }
  }

  // Create payout requests
  await prisma.payoutRequest.upsert({
    where: { id: "seed-payout-1" },
    update: {},
    create: {
      id: "seed-payout-1",
      userId: user1.id,
      amount: 1000.00,
      upiId: "priya.sharma@upi",
      status: "COMPLETED",
      processedAt: new Date(),
    },
  });
  console.log("✅ Created payout request");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
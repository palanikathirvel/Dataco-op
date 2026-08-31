import { prisma } from "@/lib/prisma";

export async function applyCohortTags(userId: string, purchase: {
  category: string;
  amount: number;
  platform: string;
}) {
  const tags = new Set<string>();

  const amountNum = Number(purchase.amount);

  if (amountNum > 5000 && purchase.category === "SKINCARE") {
    tags.add("premium_skincare_buyer");
  }

  if (purchase.category === "FOOD_DELIVERY") {
    const recentPurchases = await prisma.purchase.findMany({
      where: {
        userId,
        category: "FOOD_DELIVERY",
        status: "VERIFIED",
        purchaseDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });
    if (recentPurchases.length > 3) {
      tags.add("frequent_foodie");
    }
  }

  if (purchase.category === "ELECTRONICS" && amountNum > 20000) {
    tags.add("premium_electronics_buyer");
  }

  if (purchase.category === "SKINCARE" && amountNum > 3000) {
    tags.add("skincare_enthusiast");
  }

  if (purchase.category === "GROCERIES") {
    const monthlyGrocery = await prisma.purchase.findMany({
      where: {
        userId,
        category: "GROCERIES",
        status: "VERIFIED",
        purchaseDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });
    const total = monthlyGrocery.reduce((sum: number, p: { amount: { toString: () => string } }) => sum + Number(p.amount.toString()), 0);
    if (total > 5000) tags.add("heavy_grocery_buyer");
  }

  if (purchase.platform === "AMAZON" || purchase.platform === "FLIPKART") {
    const platformPurchases = await prisma.purchase.count({
      where: {
        userId,
        platform: purchase.platform,
        status: "VERIFIED",
      },
    });
    if (platformPurchases > 10) tags.add(`${purchase.platform.toLowerCase()}_power_user`);
  }

  const existingTags = await prisma.cohortTag.findMany({
    where: { userId, tag: { in: Array.from(tags) } },
  });
  const existingTagNames = new Set(existingTags.map((t) => t.tag));
  const newTags = Array.from(tags).filter((t) => !existingTagNames.has(t));

  if (newTags.length > 0) {
    await prisma.cohortTag.createMany({
      data: newTags.map((tag) => ({ userId, tag })),
      skipDuplicates: true,
    });
  }

  return Array.from(tags);
}
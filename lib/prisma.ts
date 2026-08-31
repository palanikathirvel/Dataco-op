import { PrismaClient } from "@prisma/client"

declare global {
  // This prevents multiple instances of Prisma Client in development
  // which can cause performance issues and memory leaks.
  var prisma: PrismaClient | undefined
}

const prisma =
  global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

export default prisma
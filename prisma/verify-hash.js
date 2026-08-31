const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "testuser@example.com" } })
  if (!user) { console.log("no user"); return }
  console.log("User found:", user.email)
  console.log("Has passwordHash:", !!user.passwordHash)
  console.log("Hash prefix:", user.passwordHash?.slice(0, 20))
  if (user.passwordHash) {
    const valid = await bcrypt.compare("test123", user.passwordHash)
    console.log("Password 'test123' valid:", valid)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())

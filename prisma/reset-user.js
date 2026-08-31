const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()
async function main() {
  const passwordHash = await bcrypt.hash("test123", 10)
  await prisma.user.update({
    where: { email: "testuser@example.com" },
    data: { passwordHash },
  })
  console.log("Updated testuser password to 'test123'")
}
main().catch(console.error).finally(() => prisma.$disconnect())

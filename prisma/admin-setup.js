// One-off setup script: creates an admin user if it doesn't exist.
// Run with: node prisma/admin-setup.js
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const { randomUUID } = require("crypto")

const prisma = new PrismaClient()

async function main() {
  const email = "admin@datacoop.in"
  const password = "admin123"

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    console.log(`✓ Admin already exists: ${email}`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const admin = await prisma.admin.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash,
      name: "Admin",
      updatedAt: new Date(),
    },
  })
  console.log(`✓ Admin created: ${admin.email} (id: ${admin.id})`)
  console.log(`  Password: ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

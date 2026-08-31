const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const p = new PrismaClient()

async function run() {
  const admin = await p.admin.findFirst()
  if (!admin) {
    // Create admin if doesn't exist
    const created = await p.admin.create({
      data: {
        id: 'admin-001',
        email: 'admin@datacoop.in',
        passwordHash: await bcrypt.hash('Admin@1234', 10),
        name: 'Super Admin',
        updatedAt: new Date(),
      }
    })
    console.log('Admin created:', created.email)
  } else {
    // Update existing admin's password
    const updated = await p.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: await bcrypt.hash('Admin@1234', 10),
        name: 'Super Admin',
        updatedAt: new Date(),
      }
    })
    console.log('Admin password updated:', updated.email, 'id:', updated.id)
  }
}

run()
  .catch(console.error)
  .finally(() => p.$disconnect())

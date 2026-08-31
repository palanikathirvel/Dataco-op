const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // ─── Admin ───────────────────────────────────────────────
  const adminEmail = 'admin@datacoop.in'
  const adminExists = await prisma.admin.findUnique({ where: { email: adminEmail } })
  if (!adminExists) {
    const admin = await prisma.admin.create({
      data: {
        id: 'admin-001',
        email: adminEmail,
        passwordHash: await bcrypt.hash('Admin@1234', 10),
        name: 'Super Admin',
        updatedAt: new Date(),
      },
    })
    console.log(`✅ Admin created: ${admin.email}`)
  } else {
    console.log('ℹ️  Admin already exists, skipping')
  }

  // ─── Test Users ─────────────────────────────────────────
  const users = [
    {
      email: 'rahul@example.com',
      name: 'Rahul Sharma',
      phone: '9876543210',
      age: 28,
      gender: 'MALE',
      city: 'Mumbai',
      pincode: '400001',
    },
    {
      email: 'priya@example.com',
      name: 'Priya Patel',
      phone: '8765432109',
      age: 24,
      gender: 'FEMALE',
      city: 'Bangalore',
      pincode: '560001',
    },
  ]

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } })
    if (!exists) {
      await prisma.user.create({
        data: {
          ...u,
          passwordHash: await bcrypt.hash('User@1234', 10),
          kycStatus: 'VERIFIED',
          walletBalance: 500,
          totalEarned: 1200,
          dpdpConsent: true,
          dpdpConsentAt: new Date(),
        },
      })
      console.log(`✅ User created: ${u.email}`)
    } else {
      console.log(`ℹ️  User ${u.email} already exists, skipping`)
    }
  }

  // ─── Test Brand ──────────────────────────────────────────
  const brandEmail = 'brand@datacoop.in'
  const brandExists = await prisma.brand.findUnique({ where: { email: brandEmail } })
  if (!brandExists) {
    const brand = await prisma.brand.create({
      data: {
        email: brandEmail,
        passwordHash: await bcrypt.hash('Brand@1234', 10),
        name: 'Nike India',
        website: 'https://nike.com/in',
        industry: 'FASHION',
        status: 'APPROVED',
        walletBalance: 50000,
        totalSpent: 0,
        updatedAt: new Date(),
      },
    })
    console.log(`✅ Brand created: ${brand.email}`)
  } else {
    console.log('ℹ️  Brand already exists, skipping')
  }

  console.log('\n🎉 Seeding complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  CREDENTIALS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Admin   → admin@datacoop.in  / Admin@1234')
  console.log('  Brand   → brand@datacoop.in  / Brand@1234')
  console.log('  User 1  → rahul@example.com  / User@1234')
  console.log('  User 2  → priya@example.com  / User@1234')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
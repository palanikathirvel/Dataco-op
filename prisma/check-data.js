const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const [users, brands, research, purchases, admin] = await Promise.all([
    prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, walletBalance: true } }),
    prisma.brand.findMany({ select: { id: true, email: true, name: true, status: true, walletBalance: true } }),
    prisma.researchRequest.findMany({ select: { id: true, title: true, status: true, brand: { select: { name: true } } } }),
    prisma.purchase.findMany({ select: { id: true, productName: true, status: true, user: { select: { email: true } } } }),
    prisma.admin.findMany({ select: { id: true, email: true } }),
  ])
  console.log(`\n=== USERS (${users.length}) ===`)
  users.forEach(u => console.log(`  - ${u.email} (${u.name}) role=${u.role} balance=${u.walletBalance}`))
  console.log(`\n=== BRANDS (${brands.length}) ===`)
  brands.forEach(b => console.log(`  - ${b.email} (${b.name}) status=${b.status} balance=${b.walletBalance}`))
  console.log(`\n=== RESEARCH (${research.length}) ===`)
  research.forEach(r => console.log(`  - [${r.status}] ${r.title} (${r.brand?.name})`))
  console.log(`\n=== PURCHASES (${purchases.length}) ===`)
  purchases.forEach(p => console.log(`  - [${p.status}] ${p.productName} (${p.user?.email})`))
  console.log(`\n=== ADMINS (${admin.length}) ===`)
  admin.forEach(a => console.log(`  - ${a.email}`))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

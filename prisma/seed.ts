import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@company.com', password, role: 'ADMIN', department: 'IT' },
  })

  await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: { name: 'IT Manager', email: 'manager@company.com', password, role: 'MANAGER', department: 'IT' },
  })

  await prisma.user.upsert({
    where: { email: 'viewer@company.com' },
    update: {},
    create: { name: 'Staff User', email: 'viewer@company.com', password, role: 'VIEWER', department: 'Operations' },
  })

  console.log('✅ Seed complete!')
  console.log('👤 admin@company.com / admin123  (ADMIN)')
  console.log('👤 manager@company.com / admin123 (MANAGER)')
  console.log('👤 viewer@company.com / admin123  (VIEWER)')
}

main().catch(console.error).finally(() => prisma.$disconnect())

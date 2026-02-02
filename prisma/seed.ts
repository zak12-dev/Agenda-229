import { PrismaClient } from '@prisma/client'
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 1. Create Roles
  const roles = [
    { id: 1, role: 'admin' },
    { id: 2, role: 'moderator' },
    { id: 3, role: 'user simple' },
    { id: 4, role: 'organizer' },
  ]

  for (const r of roles) {
    await prisma.role.upsert({
      where: { role: r.role },
      update: {},
      create: r,
    })
  }

  console.log('Roles seeded.')

  // 2. Create Super User (Admin)
  const adminEmail = 'admin@example.com'
  const adminPassword = 'Password123!'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);

    const adminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        // password: hashedPassword, // Stored in User table
        roleId: 1, // admin
        status: 'active',
        // organizerStatus: 'approved',
        emailVerified: true,
      },
    })

    await prisma.account.create({
      data: {
        userId: adminUser.id,
        accountId: adminUser.email,
        providerId: 'credential',
        password: hashedPassword,
      }
    })

    console.log('Super user created: admin@example.com / Password123!')
  } else {
    console.log('Super user already exists.')
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

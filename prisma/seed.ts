import { PrismaClient } from '@prisma/client'
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding super admin...')

  // Super Admin
  const adminEmail = 'zakAdmin@example.com'
  const adminPassword = 'Password!'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword)

    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin Zak',
        email: adminEmail,
        roleId: 1, // Assure-toi que "1" correspond bien au rôle admin dans ta table Role
        status: 'active',
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

    console.log(`Super user created: ${adminEmail} / ${adminPassword}`)
  } else {
    console.log('Super user already exists.')
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

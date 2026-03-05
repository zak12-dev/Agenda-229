import { prisma } from '~~/server/utils/prisma'
import { requireAuth } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  const { name, description, website, phone } = await readBody(event)

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le nom de l'organisation est requis",
    })
  }

  // ✅ Vérifier si une demande est déjà en attente
  // Vérifier si une demande est déjà en cours pour cet utilisateur
  if (user.roleId === 2) {
    // 2 = organizer
    throw createError({
      statusCode: 400,
      statusMessage: 'Vous êtes déjà un organisateur.',
    })
  }
  
  // Bloquer admin (1) & organizer (2) de faire une demande
  if (user.roleId === 1 || user.roleId === 2) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vous ne pouvez pas effectuer cette demande car vous etes soit Admin ou organisateur.",
    });
  }

  // Vérifier s'il existe déjà une demande en attente
  const existingRequest = await prisma.organizerRequest.findFirst({
    where: {
      userId: user.id,
      status: 'pending',
    },
  })

  if (existingRequest) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vous avez déjà une demande en attente.',
    })
  }

  // ✅ Transaction sécurisée
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        organizerStatus: 'pending',
        organizerProfile: {
          upsert: {
            create: {
              name,
              description,
              website,
              phone,
            },
            update: {
              name,
              description,
              website,
              phone,
            },
          },
        },
      },
    }),

    prisma.organizerRequest.create({
      data: {
        userId: user.id,
        status: 'pending',
      },
    }),
  ])

  return { success: true }
})

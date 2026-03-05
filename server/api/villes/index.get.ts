import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const villes = await prisma.ville.findMany({
      orderBy: {
        nomVille: 'asc',
      },
    })
    console.log('VILLES:', villes)

    return villes
  } catch (error) {
    console.error('API Villes Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des villes',
    })
  }
})

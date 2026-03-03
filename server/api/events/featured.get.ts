// server/api/events/featured.get.ts
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const url = getQuery(event)
    const isFeatured = url.featured === 'true'

    if (!isFeatured) {
      return []
    }

    // Récupérer seulement les champs nécessaires pour le carousel
    const featuredEvents = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        privilege: true, // Assure-toi d'avoir ce champ dans ta table
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        location: true,
        images: true,
        category: { select: { name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // Limite à 5 événements
    })
    console.log('Featured Events:', featuredEvents)
    return featuredEvents.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startDate: e.startDate,
      date: e.startDate,
      location: e.location,
      image: e.images?.[0] || null,
      category: e.category?.name || 'Autre',
    }))
  } catch (error) {
    console.error('Erreur API featuredEvents:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de récupérer les événements mis en avant',
    })
  }
})

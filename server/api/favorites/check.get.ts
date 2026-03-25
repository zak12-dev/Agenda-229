import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '~~/server/utils/prisma'
import { getUserSession } from '~~/server/utils/protect' // ou ton helper de session

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const eventId = query.eventId

  if (!eventId || typeof eventId !== 'string') {
    return { isFavorite: false }
  }

  // ✅ Vérifier la session sans lancer d'erreur
  let user: any = null
  try {
    user = await requireAuth(event)
  } catch {
    return { isFavorite: false }
  }

  if (!user) return { isFavorite: false }

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId,
      },
    },
  })

  return { isFavorite: !!favorite }
})
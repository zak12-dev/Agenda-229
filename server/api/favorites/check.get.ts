import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '~~/server/utils/prisma'
import { requireAuth } from '~~/server/utils/protect'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const eventId = query.eventId

  // Sécuriser que c'est bien une string
  if (!eventId || typeof eventId !== 'string') {
    return { isFavorite: false }
  }

  const user = await requireAuth(event)

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: eventId // TypeScript est content maintenant
      }
    }
  })

  return { isFavorite: !!favorite }
})
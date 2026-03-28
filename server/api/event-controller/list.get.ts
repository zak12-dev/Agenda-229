import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (!user) {
      return {
        success: false,
        message: 'Non authentifié'
      }
    }

    const organizerId = user.id

    // Récupérer les events de cet organisateur
    const events = await prisma.event.findMany({
      where: { userId: organizerId },
      select: { id: true }
    })

    const eventIds = events.map(e => e.id)

    // Récupérer les demandes
    const requests = await prisma.eventController.findMany({
      where: {
        eventId: { in: eventIds }
      },
      include: {
        user: true,
        event: true
      }
    })

    return {
      success: true,
      data: requests
    }

  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erreur serveur' }
  }
})
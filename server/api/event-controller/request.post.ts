import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { eventId, userId } = body

    if (!eventId || !userId) {
      return {
        success: false,
        message: 'eventId ou userId manquant'
      }
    }

    // Vérifier si déjà une demande
    const existing = await prisma.eventController.findFirst({
      where: {
        eventId,
        userId
      }
    })

    if (existing) {
      //  En attente
      if (existing.status === 'PENDING') {
        return {
          success: false,
          message: 'Votre demande est en cours de traitement'
        }
      }

      // Déjà validé
      if (existing.status === 'APPROVED') {
        return {
          success: false,
          message: 'Vous êtes déjà contrôleur pour cet événement '
        }
      }

      //  Refusé et possibilité de faire une nouvelle demande
      if (existing.status === 'REJECTED') {
        await prisma.eventController.update({
          where: {
            eventId_userId: {
              eventId,
              userId
            }
          },
          data: {
            status: 'PENDING'
          }
        })

        return {
          success: true,
          message: 'Nouvelle demande envoyée'
        }
      }
    }


    //  Créer une nouvelle demande
    await prisma.eventController.create({
      data: {
        eventId,
        userId,
        status: 'PENDING'
      }
    })

    return {
      success: true,
      message: 'Demande envoyée à l’organisateur'
    }

  } catch (error) {
    console.error(error)

    return {
      success: false,
      message: 'Erreur serveur'
    }
  }
})
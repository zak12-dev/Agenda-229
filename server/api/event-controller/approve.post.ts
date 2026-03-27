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

    const body = await readBody(event)
    const { requestId, status } = body

    if (!requestId || !status) {
      return {
        success: false,
        message: 'requestId ou status manquant'
      }
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return {
        success: false,
        message: 'Statut invalide'
      }
    }

    const request = await prisma.eventController.findUnique({
      where: { id: requestId },
      include: { event: true }
    })

    if (!request) {
      return {
        success: false,
        message: 'Demande introuvable'
      }
    }

    //  sécurité : vérifier que c’est bien l’organisateur
    if (request.event.userId !== user.id) {
      return {
        success: false,
        message: 'Non autorisé'
      }
    }

    // Mise à jour
    await prisma.eventController.update({
      where: { id: requestId },
      data: { status }
    })

    return {
      success: true,
      message: `Demande ${status === 'APPROVED' ? 'approuvée' : 'refusée'}`
    }

  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: 'Erreur serveur'
    }
  }
})
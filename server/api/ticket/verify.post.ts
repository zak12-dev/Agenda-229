import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {

    // 1. RÉCUPÉRER UTILISATEUR AUTHENTIFIÉ
    const user = event.context.user

    if (!user) {
      return {
        success: false,
        message: 'Non authentifié'
      }
    }

    const userId = user.id

    // 2. RÉCUPÉRER TOKEN (GET ou POST)
    const query = getQuery(event)
    let token = query.token as string

    if (!token) {
      const body = await readBody(event)
      token = body?.token
    }

    if (!token) {
      return {
        success: false,
        message: 'Token manquant'
      }
    }

    // 3. RÉCUPÉRER LE TICKET
    const ticket = await prisma.ticket.findUnique({
      where: { token },
      include: {
        event: true,
        user: true
      }
    })

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket invalide'
      }
    }

    // 4. VÉRIFICATION AUTORISATION
    const isOrganizer = ticket.event.userId === userId

    const isController = await prisma.eventController.findFirst({
      where: {
        eventId: ticket.event.id,
        userId: userId,
        status: 'APPROVED'
      }
    })

    if (!isOrganizer && !isController) {

      // LOG tentative frauduleuse
      await prisma.scanLog.create({
        data: {
          ticketId: ticket.id,
          scannedBy: userId,
          scanResult: 'UNAUTHORIZED'
        }
      })

      return {
        success: false,
        message: 'Non autorisé à vérifier ce ticket'
      }
    }

    //5. EXPIRATION
    if (new Date() > ticket.expiresAt) {
      await prisma.scanLog.create({
        data: {
          ticketId: ticket.id,
          scannedBy: userId,
          scanResult: 'EXPIRED'
        }
      })

      return { success: false, message: 'Ticket expiré' }
    }

    // 6. LIMITE D’UTILISATION
    if (ticket.usedCount >= ticket.event.maxUsage) {
      await prisma.scanLog.create({
        data: {
          ticketId: ticket.id,
          scannedBy: userId,
          scanResult: 'REFUSED'
        }
      })

      return { success: false, message: 'Ticket déjà utilisé' }
    }

    // 7. VALIDATION
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        usedCount: { increment: 1 }
      }
    })

    await prisma.ticketValidation.create({
      data: {
        ticketId: ticket.id,
        validatedBy: userId
      }
    })

    await prisma.scanLog.create({
      data: {
        ticketId: ticket.id,
        scannedBy: userId,
        scanResult: 'VALID'
      }
    })

    //8. RÉPONSE
    return {
      success: true,
      message: 'Ticket valide',
      data: {
        user: {
          name: ticket.user.name,
          email: ticket.user.email
        },
        event: {
          title: ticket.event.title,
          startDate: ticket.event.startDate,
          endDate: ticket.event.endDate
        }
      }
    }

  } catch (error) {
    console.error(error)

    return {
      success: false,
      message: 'Erreur serveur'
    }
  }
})
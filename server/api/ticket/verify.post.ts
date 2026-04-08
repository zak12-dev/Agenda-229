import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      return { success: false, message: 'Non authentifié' }
    }
    const userId = user.id

    const query = getQuery(event)
    let token = query.token as string | undefined
    let codeVerify = query.codeVerify as string | undefined

    if (!token && !codeVerify) {
      const body = await readBody(event)
      token = body?.token || undefined
      codeVerify = body?.codeVerify || undefined
    }

    if (!token && !codeVerify) {
      return { success: false, message: 'Token ou code requis' }
    }

    // ── Construire le OR dynamiquement pour éviter { token: undefined } ──
    const orConditions: any[] = []
    if (token) orConditions.push({ token })
    if (codeVerify) orConditions.push({ codeVerify })

    const ticket = await prisma.ticket.findFirst({
      where: { OR: orConditions },
      include: { event: true, user: true }
    })

    if (!ticket) {
      return { success: false, message: 'Ticket invalide' }
    }

    // Vérification autorisation
    const isOrganizer = ticket.event.userId === userId
    const isController = await prisma.eventController.findFirst({
      where: { eventId: ticket.event.id, userId, status: 'APPROVED' }
    })

    if (!isOrganizer && !isController) {
      await prisma.scanLog.create({
        data: { ticketId: ticket.id, scannedBy: userId, scanResult: 'UNAUTHORIZED' }
      })
      return { success: false, message: 'Non autorisé à vérifier ce ticket' }
    }

    // Expiration
    if (new Date() > ticket.expiresAt) {
      await prisma.scanLog.create({
        data: { ticketId: ticket.id, scannedBy: userId, scanResult: 'EXPIRED' }
      })
      return { success: false, message: 'Ticket expiré' }
    }

    // Limite d'utilisation — maxUsage peut être null (événement gratuit sans limite)
    const maxUsage = ticket.event.maxUsage ?? null
    if (maxUsage !== null && ticket.usedCount >= maxUsage) {
      await prisma.scanLog.create({
        data: { ticketId: ticket.id, scannedBy: userId, scanResult: 'REFUSED' }
      })
      return { success: false, message: 'Ticket déjà utilisé' }
    }

    // Validation
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { usedCount: { increment: 1 } }
    })

    await prisma.ticketValidation.create({
      data: { ticketId: ticket.id, validatedBy: userId }
    })

    await prisma.scanLog.create({
      data: { ticketId: ticket.id, scannedBy: userId, scanResult: 'VALID' }
    })

    const usedCount = updatedTicket.usedCount

    return {
      success: true,
      message: 'Ticket valide',
      data: {
        user: { name: ticket.user.name, email: ticket.user.email },
        event: {
          title: ticket.event.title,
          startDate: ticket.event.startDate,
          endDate: ticket.event.endDate,
        },
        usedCount,
        maxUsage,
        usageRemaining: maxUsage !== null ? maxUsage - usedCount : null,
      }
    }

  } catch (error: any) {
    console.error('VERIFY ERROR =>', error)
    return {
      success: false,
      message: `Erreur serveur : ${error?.message || 'inconnue'}`
    }
  }
})
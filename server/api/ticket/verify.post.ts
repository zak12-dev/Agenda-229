import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, userId } = body

    if (!token || !userId) {
      return {
        success: false,
        message: 'Token ou userId manquant'
      }
    }

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

    // ⏰ expiré
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

    // 🚫 déjà utilisé
    if (ticket.usedCount >= ticket.maxUsage) {
      await prisma.scanLog.create({
        data: {
          ticketId: ticket.id,
          scannedBy: userId,
          scanResult: 'REFUSED'
        }
      })

      return { success: false, message: 'Ticket déjà utilisé' }
    }

    // ✅ OK
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

    return {
      success: true,
      message: 'Ticket valide ',
        data: {
            user: {  
                name: ticket.user.name,     
                email: ticket.user.email
            }, 
            event: {
                title: ticket.event.title,  
                startDate: ticket.event.startDate,
                endDate: ticket.event.endDate
            },
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
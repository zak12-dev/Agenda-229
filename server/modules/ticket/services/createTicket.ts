import { generateQr } from './generateQr'
import { generatePdf } from './generatePdf'
import { sendTicket } from './sendTicket'
import { prisma } from '../../../utils/prisma'
import { nanoid } from 'nanoid'
import { User } from '@prisma/client'

export const buyTicket = async (user: User, eventId: string, quantity: number) => {
   // 1. Vérifier si l'événement existe
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw createError({
      statusCode: 404,
      message: "Événement introuvable"
    })
  }
  
  for (let i = 0; i < quantity; i++) { 
    // 3. créer token sécurisé
    const token = nanoid(32)

    // 4. créer ticket
    const ticket = await prisma.ticket.create({
      data: {
        token,
        userId: user.id,
        eventId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
      }
    })

    // 5. générer QR
    const qrCode = await generateQr(token)

    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '')
    const qrBuffer = Buffer.from(base64Data, 'base64')

    // 6. générer PDF
    const pdf = await generatePdf({
      user,
      ticket,
      qrCode,
      event
    })

    // 7. envoyer mail
    await sendTicket(user.email, pdf, qrBuffer)
    
  }
  return {
    message: "Ticket acheté avec succès"
  }
}
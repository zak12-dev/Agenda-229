import { generateQr } from './generateQr'
import { generatePdf } from './generatePdf'
import { sendTicket } from './sendTicket'
import { prisma } from '../../../utils/prisma'
import { nanoid } from 'nanoid'
import { User } from '@prisma/client'

export const buyTicket = async (user: User, eventId: string, quantity: number) => {

  //1. Générer code de vérification
  const generateVerifyCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''

      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
      }

      return code
  }
  
  // 2. Vérifier si l'événement existe
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

    // 4. créer ticket avec génération code unique de vérification
    let codeVerify = ''
    let exists = true

    while (exists) {
      // Génération du code aléatoire en majuscules
      const generatedCode = generateVerifyCode()

      // Formater codeVerify avec le codePrefix et le nom de l'événement
      const eventCodePart = event.title
        .replace(/\s+/g, '')        // supprimer les espaces
        .replace(/[^A-Z0-9]/gi, '') // supprimer les caractères non alphanumériques
        .toUpperCase()              // majuscules
        .slice(0, 4)                // prendre les 4 premiers caractères

      // Construire le codeVerify final : codePrefix + code aléatoire + titre tronqué
      const shortPrefix = event.codePrefix.slice(0, 3)
      codeVerify = `${shortPrefix}-${generatedCode}-${eventCodePart}`

      // Vérifier unicité dans la base
      const found = await prisma.ticket.findUnique({
        where: { codeVerify }
      })

      if (!found) exists = false
    }

    const ticket = await prisma.ticket.create({
      data: {
        token,
        codeVerify,
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
    await sendTicket(user.email, pdf, qrBuffer, user, ticket)
    
  }
  return {
    message: "Ticket acheté avec succès"
  }
}
import PDFDocument from 'pdfkit'
import { User, Ticket, Event } from '@prisma/client'

export const generatePdf = async ({
  user,
  ticket,
  qrCode,
  event
}: {
  user: User
  ticket: Ticket
  qrCode: string
  event: Event
}) => {

  const doc = new PDFDocument({
    size: 'A4',
    margin: 40
  })

  const buffers: Uint8Array[] = []

  doc.on('data', (chunk) => buffers.push(chunk))

  return new Promise<Buffer>((resolve) => {

    doc.on('end', () => resolve(Buffer.concat(buffers)))

    //HEADER
    doc
      .fontSize(20)
      .text('TICKET EVENEMENT', { align: 'center' })

    doc.moveDown()

    doc
      .fontSize(16)
      .text(event.title, { align: 'center' })

    doc.moveDown(2)

    //LIGNE SEPARATION
    doc
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .dash(5, { space: 5 })
      .stroke()

    doc.undash()

    doc.moveDown(2)

    //INFOS EVENT
    doc
      .fontSize(12)
      .text(`Date : ${new Date(event.eventDate).toLocaleDateString()}`)
      .text(`Lieu : ${event.villeId || 'Non défini'}`)

    doc.moveDown()

    //INFOS UTILISATEUR
    doc
      .text(` Nom : ${user.name}`)
      .text(`Email : ${user.email}`)

    doc.moveDown()

    //TICKET ID
    doc
      .text(`Ticket ID : ${ticket.id}`)

    doc.moveDown(2)

    //LIGNE SEPARATION
    doc
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .dash(5, { space: 5 })
      .stroke()

    doc.undash()

    doc.moveDown(2)

    //QR CODE
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '')
    const qrBuffer = Buffer.from(base64Data, 'base64')

    doc.image(qrBuffer, {
      fit: [150, 150],
      align: 'center'
    })

    doc.moveDown()

    //MESSAGE
    doc
      .fontSize(10)
      .text('Présentez ce ticket à l’entrée', {
        align: 'center'
      })

    doc.moveDown()

    doc
      .fillColor('red')
      .text('Valable en fonction de la durée de l\'événement', {
        align: 'center'
      })

    doc.end()
  })
}
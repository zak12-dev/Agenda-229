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
    margin: 50
  })

  const buffers: Uint8Array[] = []

  doc.on('data', (chunk) => buffers.push(chunk))

  return new Promise<Buffer>((resolve) => {

    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      resolve(pdfData)
    })

    // 🎨 TITRE
    doc
      .fontSize(22)
      .text(' TICKET OFFICIEL', { align: 'center' })

    doc.moveDown()

    // 📌 INFOS EVENT
    doc
      .fontSize(16)
      .text(`Événement : ${event.title}`)

    doc.moveDown()

    // 👤 INFOS USER
    doc
      .fontSize(14)
      .text(`Nom : ${user.name}`)
      .text(`Email : ${user.email}`)

    doc.moveDown()

    // 🔐 TOKEN
    // doc
    //   .fontSize(10)
    //   .text(`Code Ticket : ${ticket.token}`, {
    //     align: 'center'
    //   })

    // doc.moveDown(2)

    // 🧠 QR CODE
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '')
    const qrBuffer = Buffer.from(base64Data, 'base64')

    doc.image(qrBuffer, {
      fit: [200, 200],
      align: 'center'
    })

    doc.moveDown()

    doc
      .fontSize(12)
      .text('Présentez ce QR code à l’entrée', {
        align: 'center'
      })

    doc.end()
  })
}
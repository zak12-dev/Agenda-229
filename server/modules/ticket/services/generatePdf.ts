import PDFDocument from 'pdfkit'
import { User, Ticket, Event } from '@prisma/client'
import fs from 'fs'

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
  const doc = new PDFDocument()
  const buffers: Uint8Array[] = []

  doc.on('data', buffers.push.bind(buffers))
  doc.on('end', () => {})

  doc.fontSize(20).text('=== TICKET ===', { align: 'center' })
  doc.moveDown()
  doc.fontSize(14).text(`Événement : ${event.title}`)
  doc.text(`Nom : ${user.name}`)
  doc.text(`Email : ${user.email}`)
  doc.text(`Token : ${ticket.token}`)
  doc.moveDown()

  // Ajouter l'image QR
  const base64Data = qrCode.replace(/^data:image\/png;base64,/, '')
  const qrBuffer = Buffer.from(base64Data, 'base64')
  doc.image(qrBuffer, { fit: [200, 200], align: 'center' })

  doc.end()

  return Buffer.concat(buffers)
}
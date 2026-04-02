import nodemailer from 'nodemailer'
import { User, Ticket } from '@prisma/client'

export const sendTicket = async (
  email: string,
  pdf: Buffer,
  qr: Buffer,
  user: User,
  ticket: Ticket,
) => {

  const safeName = user.name.replace(/[^a-zA-Z0-9]/g, '')
  const timestamp = Date.now()

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST!,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASS!
    }
  })

  await transporter.sendMail({
    from: `"Billetterie" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: "Votre ticket 🎟️",

    text: "Voici votre ticket",

    html: `
     <h2>🎟️ Votre ticket</h2>
      <p>Présentez ce QR code à l'entrée :</p>

      <div style="display: flex; align-items: center; gap: 20px;">

        <!-- INFOS USER -->
        <div>
          <p><strong>Nom :</strong> ${user.name}</p>
          <p><strong>Email :</strong> ${user.email}</p>
          <p><strong>Code de vérification :</strong> ${ticket.codeVerify}</p>
        </div>
        
        <!-- QR CODE -->
        <div>
          <img src="cid:qrcode" alt="QR Code" style="width:150px;height:150px;" />
        </div>
      </div>
    `,

    attachments: [
      {
        filename: `WLE-${safeName}-${timestamp}.pdf`,
        content: pdf
      },
      {
        filename: "qrcode.png",
        content: qr,
        cid: "qrcode"
      }
    ]
  })
}
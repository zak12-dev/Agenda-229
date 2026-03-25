import nodemailer from 'nodemailer'

export const sendTicket = async (email: string, pdf: Buffer) => {

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })

  await transporter.sendMail({
    from: `"Billetterie" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: "Votre ticket 🎟️",
    text: "Voici votre ticket en pièce jointe",
    attachments: [
      {
        filename: "ticket.pdf",
        content: pdf
      }
    ]
  })
}
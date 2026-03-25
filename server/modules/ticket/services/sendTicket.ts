import nodemailer from 'nodemailer'

export const sendTicket = async (
  email: string,
  pdf: Buffer,
  qr: Buffer
) => {

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST!,
    port: Number(process.env.MAIL_PORT),
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
      <img src="cid:qrcode" />
    `,

    attachments: [
      {
        filename: "ticket.pdf",
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
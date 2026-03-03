import { prisma } from "~~/server/utils/prisma";
import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { name, email, message } = body;

  if (!name || !email || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tous les champs sont obligatoires",
    });
  }

  // 1️⃣ Sauvegarde en base de données
  const contact = await prisma.contact.create({
    data: {
      name,
      email,
      message,
    },
  });

  // 2️⃣ Envoi email de notification
  try {
    const transporter = nodemailer.createTransport({
      // var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "b8ed4061a5978f",
    pass: "af3ee918a9c3a5"
  }
});

    await transporter.sendMail({
      from: `"Contact Site" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,         // ton email de test sur Mailtrap
      subject: "Nouveau message de contact",
      text: `
      Nom: ${name}
      Email: ${email}
      Message: ${message}
            `,
          });

    return {
      success: true,
      contact,
      message: "Message envoyé avec succès !",
    };
  } catch (error: any) {
    console.error("Erreur envoi email:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur serveur lors de l'envoi de l'email",
      message: error.message,
    });
  }
});
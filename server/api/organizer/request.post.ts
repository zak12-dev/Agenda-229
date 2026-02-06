import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  // Lire les champs du formulaire
  const { name, description, website, phone } = await readBody(event);

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Le nom de l'organisation est requis" });
  }

  // Mettre à jour le statut et créer les infos de l'organisation
  await prisma.user.update({
    where: { id: user.id },
    data: {
      organizerStatus: "pending",
      organizerProfile: {
        upsert: {
          create: {
            name,
            description,
            website,
            phone,
          },
          update: {
           name,
            description,
            website,
            phone,
          },
        },
      },
    },
  });

  return { success: true };
});

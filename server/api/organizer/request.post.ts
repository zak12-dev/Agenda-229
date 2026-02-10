import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  // Vérifier si une demande est déjà en cours pour cet utilisateur
  const existingRequest = await prisma.organizerRequest.findFirst({
    where: {
      userId: user.id,
      status: "pending",
    },
  });

  if (existingRequest) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vous avez déjà une demande en attente.",
    });
  }

  // Utiliser une transaction pour mettre à jour le statut de l'utilisateur et créer l'enregistrement de la demande
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        organizerStatus: "pending",
      },
    }),
    prisma.organizerRequest.create({
      data: {
        userId: user.id,
        status: "pending",
      },
    }),
  ]);

  return { success: true };
});

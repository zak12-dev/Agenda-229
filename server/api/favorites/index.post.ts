import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  // Vérifier que l'utilisateur est connecté
  const user = requireAuth(event);

  // Récupérer l'ID de l'événement depuis le body
  const body = await readBody(event);
  const { eventId } = body;

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID requis",
    });
  }

  // Vérifier si l'event est déjà en favoris
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId,
      },
    },
  });

  if (existing) {
    // Si déjà en favoris → supprimer (toggle)
    await prisma.favorite.delete({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
    });

    return {
      status: "removed",
      message: "Retiré des favoris",
      eventId,
    };
  }

  // Sinon → ajouter aux favoris
  const favorite = await prisma.favorite.create({
    data: {
      userId: user.id,
      eventId,
    },
  });

  return {
    status: "added",
    message: "Ajouté aux favoris",
    favorite,
  };
});

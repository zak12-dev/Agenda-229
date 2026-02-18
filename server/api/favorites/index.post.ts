import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event); // 👈 vérifie connexion

  const body = await readBody(event);
  const { eventId } = body;

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID requis",
    });
  }

  // Vérifier si déjà en favoris
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId,
      },
    },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event déjà en favoris",
    });
  }

  const favorite = await prisma.favorite.create({
    data: {
      userId: user.id,
      eventId,
    },
  });

  return {
    message: "Ajouté aux favoris",
    favorite,
  };
});
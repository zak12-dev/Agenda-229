import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const eventId = getRouterParam(event, "eventId");

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID requis",
    });
  }

  await prisma.favorite.delete({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId,
      },
    },
  });

  return {
    message: "Retiré des favoris",
  };
});
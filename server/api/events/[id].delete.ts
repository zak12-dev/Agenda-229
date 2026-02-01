import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de l'événement requis",
    });
  }

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: "Événement non trouvé",
      });
    }

    if (existingEvent.userId !== user.id && user.roleId !== 1) {
      throw createError({
        statusCode: 403,
        statusMessage: "Vous n'êtes pas autorisé à supprimer cet événement",
      });
    }

    await prisma.event.delete({
      where: { id }
    });

    return {
      message: "Événement supprimé avec succès"
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la suppression de l'événement",
    });
  }
});

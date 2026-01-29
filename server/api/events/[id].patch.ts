import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

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
        statusMessage: "Vous n'êtes pas autorisé à modifier cet événement",
      });
    }

    const {
      title,
      description,
      location,
      eventDate,
      startDate,
      endDate,
      image,
      villeId,
      categoryIds
    } = body;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        location,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        image,
        villeId,
        categories: categoryIds ? {
          deleteMany: {},
          create: categoryIds.map((catId: string) => ({
            categoryId: catId
          }))
        } : undefined
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        ville: true
      }
    });

    return {
      message: "Événement mis à jour avec succès",
      event: updatedEvent
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la mise à jour de l'événement",
    });
  }
});

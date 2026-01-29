import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const body = await readBody(event);

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

  if (!title || !description || !location || !eventDate || !startDate || !image || !villeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tous les champs obligatoires doivent être remplis",
    });
  }

  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location,
        eventDate: new Date(eventDate),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        image,
        userId: user.id,
        villeId,
        categories: {
          create: categoryIds?.map((catId: string) => ({
            categoryId: catId
          })) || []
        }
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
      message: "Événement créé avec succès",
      event: newEvent
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la création de l'événement",
    });
  }
});

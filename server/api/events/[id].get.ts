import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de l'événement requis",
    });
  }

  try {
    const eventData = await prisma.event.findUnique({
      where: { id },
      include: {
        ville: true,
        category: true,
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    return eventData;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: "Événement non trouvé",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la récupération de l'événement",
    });
  }
});

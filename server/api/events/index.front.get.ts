import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        ville: true,
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return events;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la récupération des événements",
    });
  }
});

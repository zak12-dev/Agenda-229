import { prisma } from "~~/server/utils/prisma";
import { getRequestIP } from "h3";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const ip = getRequestIP(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de l'événement requis",
    });
  }

// vérifier si la vue existe déja
const existingView = await prisma.eventView.findFirst({
  where: {
    eventId: id, //0196740100
    ipAddress: ip,
  },
});

if (!existingView) {
  await prisma.eventView.create({
    data: {
      eventId: id,
      ipAddress: ip,
    },
  });

  await prisma.event.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });
}

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
    
    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: "Événement non trouvé",
      });
    } 

    return eventData;
  })
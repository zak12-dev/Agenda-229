import { prisma } from "~~/server/utils/prisma";

import { getCookie, setCookie, getRouterParam, createError } from "h3";
import { auth } from "~~/server/utils/auth";

function generateVisitorId() {
  return crypto.randomUUID();
}

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, "id");

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de l'événement requis",
    });
  }

  // session utilisateur
  const session = await auth.api.getSession({ headers: event.headers });
  const userId = session?.user?.id ?? null;

  // gestion visiteur anonyme
  let visitorId = getCookie(event, "visitor_id");

  if (!visitorId) {
    visitorId = generateVisitorId();

    setCookie(event, "visitor_id", visitorId, {
      maxAge: 60 * 60 * 24 , // 1 jour
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }

  // Vérifier si la vue existe déjà
  const existingView = await prisma.eventView.findFirst({
    where: userId
      ? {
          eventId,
          userId,
        }
      : {
          eventId,
          visitorId,
        },
  });

  // Si la vue n'existe pas
  if (!existingView) {
    await prisma.$transaction([
      prisma.eventView.create({
        data: {
          eventId,
          userId,
          visitorId: userId ? null : visitorId,
        },
      }),

      prisma.event.update({
        where: { id: eventId },
        data: {
          views: {
            increment: 1,
          },
        },
      }),
    ]);
  }

  // récupérer l'événement
  const eventData = await prisma.event.findUnique({
    where: { id: eventId },
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

   // 🔥 Récupérer événements similaires
  const similarEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: eventData.categoryId,
      NOT: { id: eventId },
    },
    include: {
      category: true,
      images: true,
    },
    take: 3,
    orderBy: {
      eventDate: "asc",
    },
  });


return {
    ...eventData,
    similarEvents
  }});

 
import { prisma } from "~~/server/utils/prisma";
import { getRequestIP } from "h3";
import { auth } from "~~/server/utils/auth"; // pour récupérer l'utilisateur connecté

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, "id");
  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: "ID de l'événement requis" });
  }

  // Récupérer session utilisateur si connecté
  const session = await auth.api.getSession({ headers: event.headers });
  const userId = session?.user?.id ?? null;
  const ip = getRequestIP(event);

  // Vérifier si la vue existe déjà
  const existingView = await prisma.eventView.findFirst({
    where: userId
      ? { eventId, userId }        // utilisateur connecté
      : { eventId, ipAddress: ip } // visiteur anonyme
  });

  if (!existingView) {
    // Créer la vue
    await prisma.eventView.create({
      data: {
        eventId,
        userId,
        ipAddress: userId ? null : ip, // on met l'IP seulement si pas connecté
      },
    });

    // Incrémenter le compteur de vues
    await prisma.event.update({
      where: { id: eventId },
      data: {
        views: { increment: 1 },
      },
    });
  }

  // Retourner l'événement avec les relations
  const eventData = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      ville: true,
      category: true,
      images: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  if (!eventData) {
    throw createError({ statusCode: 404, statusMessage: "Événement non trouvé" });
  }

  return eventData;
});
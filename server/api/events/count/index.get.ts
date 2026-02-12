import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const organizers = await prisma.user.findMany({
      where: { roleId: 2 },
      include: {
        _count: { select: { events: true } },
        organizerProfile: true,
      },
      orderBy: {
        events: { _count: "desc" },
      },
    });

    return organizers.map((o) => ({
      organizerId: o.id,
      name: o.name,
      image: o.image,
      description: o.organizerProfile?.description ?? null,
      count: o._count?.events ?? 0,
      period: {
        start: "Depuis le début",
        end: "Maintenant",
      },
    }));
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage:
        "Erreur lors de la récupération du décompte des événements",
    });
  }
});

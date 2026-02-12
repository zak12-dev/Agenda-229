import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const organizerId = getRouterParam(event, "organizerId");

  // 🔒 séparation claire
  if (!organizerId || organizerId === "index") {
    throw createError({
      statusCode: 404,
      statusMessage: "Endpoint invalide. Utilisez /api/events/count",
    });
  }

  const query = getQuery(event);
  const startDate = query.startDate as string | undefined;
  const endDate = query.endDate as string | undefined;

  const where: any = {
    userId: organizerId,
  };

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw createError({
          statusCode: 400,
          statusMessage: "Date de début invalide",
        });
      }
      where.createdAt.gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw createError({
          statusCode: 400,
          statusMessage: "Date de fin invalide",
        });
      }
      where.createdAt.lte = end;
    }
  }

  const count = await prisma.event.count({ where });

  return {
    organizerId,
    count,
    period: {
      start: startDate ?? "Depuis le début",
      end: endDate ?? "Maintenant",
    },
  };
});

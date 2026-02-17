import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: user.id,
    },
    include: {
      event: {
        include: {
          ville: true,
          category: true,
          images: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return favorites;
});
import { prisma } from "~~/server/utils/prisma";
import { requireAdmin } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  // Récupération de TOUTES les demandes d'organisateur (pending, approved, rejected)
  const allRequests = await prisma.organizerRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          roleId: true,
          organizerStatus: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return allRequests;
});

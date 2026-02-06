import { prisma } from "~~/server/utils/prisma";
import { requireAdmin } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const organizers = await prisma.user.findMany({
    where: {
      roleId: 4, // 4 = organizer
    },
    include: {
      role: true,
      organizerProfile: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return organizers;
});

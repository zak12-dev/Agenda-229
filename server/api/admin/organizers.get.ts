import { prisma } from "~~/server/utils/prisma";
import { requireAdmin } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const requests = await prisma.user.findMany({
    where: {
      organizerStatus: "pending",
    },
    include: {
      role: true,
    },
  });

  return requests;
});

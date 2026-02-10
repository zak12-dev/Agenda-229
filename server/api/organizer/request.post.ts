import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      organizerStatus: "pending",
    },
  });

  return { success: true };
});

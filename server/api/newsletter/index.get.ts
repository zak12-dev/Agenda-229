import { requireAdmin } from "~~/server/utils/protect";
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  return await prisma.newsletter.findMany();
});

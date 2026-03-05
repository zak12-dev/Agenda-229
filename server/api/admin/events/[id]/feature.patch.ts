import { requireAdmin } from "~~/server/utils/requireAdmin";
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");

  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: { privilege: !existingEvent?.privilege }, 
  });

  return updatedEvent;
});
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID manquant",
    });
  }

  await prisma.event.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return {
    message: "Vue enregistrée",
  };
});
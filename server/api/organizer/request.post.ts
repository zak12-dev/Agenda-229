import { prisma } from "~~/server/utils/prisma";
import { requireAuth } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const { name, description, website, phone } = await readBody(event);

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le nom de l'organisation est requis",
    });
  }

  // ✅ Vérifier si une demande est déjà en attente
  const existingRequest = await prisma.organizerRequest.findFirst({
    where: {
      userId: user.id,
      status: "pending",
    },
  });

  if (existingRequest) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vous avez déjà une demande en attente.",
    });
  }

  // ✅ Transaction sécurisée
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        organizerStatus: "pending",
        organizerProfile: {
          upsert: {
            create: {
              name,
              description,
              website,
              phone,
            },
            update: {
              name,
              description,
              website,
              phone,
            },
          },
        },
      },
    }),

   prisma.organizerRequest.create({
      data: {
        userId: user.id,
        status: "pending",
      },
    }),
  ]);

  return { success: true };
});
 
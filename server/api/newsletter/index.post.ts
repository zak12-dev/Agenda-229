import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email requis",
    });
  }

  try {
    const newsletter = await prisma.newsletter.create({
      data: {
        email: body.email,
      },
    });

    return {
      message: "Inscription réussie",
      data: newsletter,
    };
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email déjà inscrit",
    });
  }
});


import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de la catégorie manquant",
    });
  }

  try {
    const category = await prisma.categorie.findUnique({
      where: { id },
    });

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: "Catégorie non trouvée",
      });
    }

    return category;
  } catch (error: any) {
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la récupération de la catégorie",
    });
  }
});

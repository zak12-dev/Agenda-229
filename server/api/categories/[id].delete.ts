import { prisma } from "~~/server/utils/prisma";
import { requireAdmin } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  // Protection: admin
  requireAdmin(event);

  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de la catégorie manquant",
    });
  }

  try {
    await prisma.categorie.delete({
      where: { id },
    });

    return {
      message: "Catégorie supprimée avec succès",
    };
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: "Catégorie non trouvée",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la suppression de la catégorie",
    });
  }
});

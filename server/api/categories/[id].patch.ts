import { prisma } from "~~/server/utils/prisma";
import { requireModerator } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  // Protection: au moins modérateur
  requireModerator(event);

  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { name } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de la catégorie manquant",
    });
  }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: "Le nom de la catégorie est requis",
    });
  }

  try {
    const updatedCategory = await prisma.categorie.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });

    return {
      message: "Catégorie mise à jour avec succès",
      category: updatedCategory,
    };
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: "Cette catégorie existe déjà",
      });
    }
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: "Catégorie non trouvée",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la mise à jour de la catégorie",
    });
  }
});

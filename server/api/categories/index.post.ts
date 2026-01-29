import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: "Le nom de la catégorie est requis",
    });
  }

  try {
    const newCategory = await prisma.categorie.create({
      data: {
        name: name.trim(),
      },
    });

    return {
      message: "Catégorie créée avec succès",
      category: newCategory,
    };
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: "Cette catégorie existe déjà",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la création de la catégorie",
    });
  }
});

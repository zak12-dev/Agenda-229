import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { nomVille } = body;

  if (!nomVille || typeof nomVille !== 'string' || nomVille.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: "nomVille est requis et ne doit pas être vide",
    });
  }

  try {
    const newVille = await prisma.ville.create({
      data: {
        nomVille: nomVille.trim(),
      },
    });

    return {
      message: "Ville créée avec succès",
      ville: newVille,
    };
  } catch (error: any) {
    // Erreur P2002 = violation de contrainte d'unicité
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: "Cette ville existe déjà",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de la création de la ville",
    });
  }
});

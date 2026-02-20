import { prisma } from "~~/server/utils/prisma";
import type { PrismaClient } from "@prisma/client/edge";
import { requireAdmin } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  //  Vérifier admin
  requireAdmin(event);

  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID manquant"
    });
  }

  //  Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id },
    include: { organizerProfile: true }
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Utilisateur introuvable"
    });
  }

  //  Récupérer le rôle USER
  const userRole = await prisma.role.findUnique({
    where: { role: "user simple" } 
  });

  if (!userRole) {
    throw createError({
      statusCode: 500,
      statusMessage: "Role USER introuvable"
    });
  }

  // Transaction
  await prisma.$transaction(async (tx: PrismaClient) => {

    // supprimer profile organizer si existe
    if (user.organizerProfile) {
      await tx.organizer_profile.delete({
        where: { userId: id }
      });
    }

    // update user
    await tx.user.update({
      where: { id },
      data: {
        roleId: userRole.id,
        organizerStatus: "none"
      }
    });

  });

  return {
    message: "Organizer supprimé avec succès et converti en utilisateur simple"
  };
});

import { prisma } from "~~/server/utils/prisma";
import { requireAdmin } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  // Récupération des utilisateurs en attente
  const users = await prisma.user.findMany({
    where: {
      organizerStatus: "pending",
    },
    include: {
      role: true,               // info sur le rôle
      organizerProfile: true,   // inclut le profil de l’organisateur
    },
  });

  // On transforme les données pour correspondre à OrganizerRequest
  const requests = users.map(user => ({
    id: user.id,
    name: user.organizerProfile?.name || '',
    email: user.email,
    organization: user.organizerProfile?.name || '',
    phone: user.organizerProfile?.phone,
    website: user.organizerProfile?.website,
    description: user.organizerProfile?.description,
    status: user.organizerStatus as 'pending' | 'approved' | 'rejected',
    createdAt: user.createdAt.toISOString(),
  }));

  return requests;
});

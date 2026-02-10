import { prisma } from "~~/server/utils/prisma";
import { requireAdmin } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event);

  const { userId, action, comment } = await readBody(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing userId",
    });
  }

  if (!["approve", "reject"].includes(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid action. Must be 'approve' or 'reject'.",
    });
  }

  const isApproved = action === "approve";
  const newStatus = isApproved ? "approved" : "rejected";

  await prisma.$transaction([
    // mise à jour le statut de l'utilisateur
    prisma.user.update({
      where: { id: userId },
      data: {
        roleId: isApproved ? 4 : 3, // 4 = organizer, 3 = user simple
        organizerStatus: newStatus,
      },
    }),
    // mise à jour la demande dans la table OrganizerRequest
    prisma.organizerRequest.updateMany({
      where: {
        userId: userId,
        status: "pending",
      },
      data: {
        status: isApproved ? "approved" : "rejected",
        comment: comment || null,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    }),
  ]);

  return { success: true };
});

// fichier : api/admin/organizer/validate.post.ts
import { prisma } from "~~/server/utils/prisma";
import { requireAdmin } from "~~/server/utils/protect";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const { userId, action } = await readBody(event);

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

  await prisma.user.update({
    where: { id: userId },
    data: {
      roleId: isApproved ? 2 : 3, // 2 = organizer, 3 = user simple
      organizerStatus: isApproved ? "approved" : "rejected",
    },
  });

  return { success: true, status: isApproved ? "approved" : "rejected" };
});

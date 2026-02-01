import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Use our new helper
  requireAdmin(event);

  const userId = getRouterParam(event, "id");
  const body = await readBody(event);
  const { status } = body;

  if (!status) {
    throw createError({
      statusCode: 400,
      statusMessage: "status is required",
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return {
      message: "User status updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update user status",
    });
  }
});

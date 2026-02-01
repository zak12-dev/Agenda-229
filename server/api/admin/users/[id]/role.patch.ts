import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Use our new helper
  requireAdmin(event);

  const userId = getRouterParam(event, "id");
  const body = await readBody(event);
  const { roleId } = body;

  if (!roleId) {
    throw createError({
      statusCode: 400,
      statusMessage: "roleId is required",
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: Number(roleId) },
      include: { role: true },
    });

    return {
      message: "User role updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update user role",
    });
  }
});

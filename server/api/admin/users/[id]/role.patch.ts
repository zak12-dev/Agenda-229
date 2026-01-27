import { auth } from "~~/server/utils/auth";
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Check if current user is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (currentUser?.role.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Only admin can modify roles",
    });
  }

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

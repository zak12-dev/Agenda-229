import { prisma } from "~~/server/utils/prisma";
import { auth } from "~~/server/utils/auth";

export async function requireAdmin(event: any) {
  const session = await auth.api.getSession({
    headers: event.node.req.headers,
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Non authentifié",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.roleId !== 1) {
    throw createError({
      statusCode: 403,
      statusMessage: "Accès refusé",
    });
  }

  return user;
}
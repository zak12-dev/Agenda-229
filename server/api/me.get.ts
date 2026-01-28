import { auth } from "~~/server/utils/auth";
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    return {
      user: null,
      session: null,
    };
  }

  const userWithRole = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  return {
    ...session,
    user: {
      ...session.user,
      role: userWithRole?.role.role,
    },
  };
});

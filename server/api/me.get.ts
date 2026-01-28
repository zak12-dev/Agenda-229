import { auth } from "~~/server/utils/auth";
import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  const session = event.context.session;

  if (!user || !session) {
    return {
      user: null,
      session: null,
    };
  }

  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });

  return {
    user: {
      ...user,
      role: userWithRole?.role.role,
    },
    session,
  };
});

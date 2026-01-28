import { H3Event } from "h3";

/**
 * Ensures the user is authenticated.
 */
export const requireAuth = (event: H3Event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: You must be logged in.",
    });
  }
  return event.context.user;
};

/**
 * Ensures the user has the admin role.
 */
export const requireAdmin = (event: H3Event) => {
  const user = requireAuth(event);

  // Based on our seed: 1 = admin
  if (user.roleId !== 1) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }
  return user;
};

/**
 * Ensures the user has at least moderator or admin role.
 */
export const requireModerator = (event: H3Event) => {
  const user = requireAuth(event);

  // Based on our seed: 1 = admin, 2 = moderator
  if (user.roleId !== 1 && user.roleId !== 2) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Moderator access required.",
    });
  }
  return user;
};

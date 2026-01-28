import { auth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  // We skip session check for the auth handlers themselves to avoid recursion if any
  if (event.path.startsWith("/api/auth")) {
    return;
  }

  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (session) {
    // Check if account is active
    if (session.user.status === "inactive") {
      event.context.session = null;
      event.context.user = null;
      return;
    }

    event.context.session = session.session;
    event.context.user = session.user;
  } else {
    event.context.session = null;
    event.context.user = null;
  }
});

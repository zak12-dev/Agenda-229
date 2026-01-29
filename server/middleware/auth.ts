import { auth } from "~~/server/utils/auth";
import { sendRedirect } from "h3";

export default defineEventHandler(async (event) => {
  // Ne pas intercepter les routes Better Auth
  if (event.path.startsWith("/api/auth")) return;

  // Seules les pages protégées
  const protectedPaths = ["/admin", "/user" ];
  if (!protectedPaths.some(p => event.path.startsWith(p))) return;

  const session = await auth.api.getSession({ headers: event.node.req.headers });
  console.log("Session récupérée côté serveur :", session);

  if (!session?.user) {
    // Redirection côté serveur vers la page de login
    return sendRedirect(event, '/auth/login', 302);
  }

  // Sinon on attache l'utilisateur au contexte
  event.context.session = session;
  event.context.user = session.user;
});

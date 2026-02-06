import { useAuth } from "~~/composables/useAuth";

export default defineNuxtRouteMiddleware(async () => {
  if (process.server) return;

  const { session, fetchSession } = useAuth();

  if (!session.value?.user) {
    await fetchSession();
  }

  if (!session.value?.user) {
    return navigateTo('/auth/login');
  }

 const roleId = session.value?.user.roleId

   // Rôles autorisés : admin(1), organizer(2)
  if (![1, 2].includes(roleId)) {
    return navigateTo('/')
  }
});
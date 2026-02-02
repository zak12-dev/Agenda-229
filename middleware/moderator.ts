import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuth } from '../composables/useAuth'
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session, fetchSession } = useAuth();

  if (!session.value) {
    await fetchSession();
  }

  if (!session.value) {
    return navigateTo("/auth/login");
  }

  const role = session.value.user.role;
  if (role !== "admin" && role !== "organizer") {
    return navigateTo("/dashboard");
  }
});

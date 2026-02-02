import { useAuth } from '../composables/useAuth'
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session, fetchSession } = useAuth();

  if (!session.value) {
    await fetchSession();
  }

  if (!session.value) {
    return navigateTo("/auth/login");
  }

  if (session.value.user.role !== 'admin') {
    return navigateTo("/");
  }
});

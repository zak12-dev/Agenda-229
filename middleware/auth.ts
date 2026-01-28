export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session, fetchSession } = useAuth();

  // Make sure we have the latest session info
  if (!session.value) {
    await fetchSession();
  }

  if (!session.value) {
    return navigateTo("/auth/login");
  }
});

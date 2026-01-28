export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session, fetchSession } = useAuth();

  if (!session.value) {
    await fetchSession();
  }

  if (!session.value) {
    return navigateTo("/auth/login");
  }

  if (session.value.role !== "admin") {
    return navigateTo("/");
  }
});

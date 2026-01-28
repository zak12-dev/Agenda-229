export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session, fetchSession } = useAuth();

  if (!session.value) {
    await fetchSession();
  }

  if (!session.value) {
    return navigateTo("/auth/login");
  }

  const role = session.value.role;
  if (role !== "admin" && role !== "moderator") {
    return navigateTo("/");
  }
});

import { useAuth } from '../composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session, fetchSession } = useAuth()

  if (!session.value) {
    await fetchSession()
  }

  if (!session.value) {
    return navigateTo("/auth/login")
  }

  // Vérifie que le user est admin (roleId = 1 par exemple)
  if (session.value.user.roleId !== 1) {
    return navigateTo("/dashboard")
  }
})

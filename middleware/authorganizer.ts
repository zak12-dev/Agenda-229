// middleware/auth-organizer.ts
// Vérifie que l'utilisateur est connecté avant d'accéder à /organizerForm

import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session, fetchSession } = useAuth()

  // Recharge la session si elle n'est pas encore disponible
  if (!session.value) {
    await fetchSession()
  }

  // Toujours pas connecté → redirige vers login avec le chemin de retour
  if (!session.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  // Déjà organisateur (roleId === 2) → redirige vers le dashboard
  if (session.value?.user?.roleId === 2) {
    return navigateTo('/dashboard/events')
  }
})
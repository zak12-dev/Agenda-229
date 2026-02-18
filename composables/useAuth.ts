// composables/useAuth.ts
import { createAuthClient } from 'better-auth/client'
import { ref, computed } from 'vue'

// =====================
// TYPES
// =====================
export interface CustomSession {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    roleId: number
    status: string
    createdAt: string
    updatedAt: string
  }

  expires?: string
}

type Role = 'user' | 'organizer' | 'admin'

// =====================
// COMPOSABLE
// =====================
export const useAuth = () => {
  const authClient = createAuthClient({
    baseURL: useRuntimeConfig().public.apiBase,
    fetchOptions: { credentials: 'include' },
  })

  // Session globale
  const session = useState<CustomSession | null>('session', () => null)

  /* =====================
     AUTH SOCIAL
  ===================== */
  const loginWithGoogle = async () => {
    return authClient.signIn.social({ provider: 'google' })
  }

  const loginWithFacebook = async () => {
    return authClient.signIn.social({ provider: 'facebook' })
  }

  /* =====================
     INSCRIPTION
  ===================== */
  const createUser = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match')
    }

    const result = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: '/auth/login', // Important
    })

    if (result?.error) throw new Error(result.error.message)
    return result
  }

  const tokenReady = ref(false)

  const refreshCaptcha = () => {
    if ((window as any).turnstile) {
      ;(window as any).turnstile.reset()
      tokenReady.value = false
      setTimeout(() => {
        tokenReady.value = true
      }, 100) // attendre que le token soit prêt
    }
  }

  /* =====================
     LOGIN EMAIL
  ===================== */
  const loginWithEmail = async (email: string, password: string, rememberMe = true) => {
    const result = await authClient.signIn.email({ email, password, rememberMe })
    if (result?.error) throw new Error(result.error.message)

    // Recharge la session
    await fetchSession()

    // Redirection accueil
    await navigateTo('/')
  }

  /* =====================
     LOGOUT
  ===================== */
  const logout = async () => {
    await authClient.signOut()
    session.value = null
    refreshCaptcha()
    await navigateTo('/auth/signup')
  }

  /* =====================
     FETCH SESSION
  ===================== */
  const fetchSession = async () => {
    try {
      const user: CustomSession | null = await $fetch('/api/me', {
        credentials: 'include',
      })

      session.value = user || null
    } catch {
      session.value = null
    }
  }

  /* =====================
     ROLES HELPERS
  ===================== */
  const role = computed<Role | null>(() => {
    if (!session.value) return null
    switch (session.value.user.roleId) {
      case 1:
        return 'admin'
      case 2:
        return 'organizer'
      case 3:
        return 'user'
      default:
        return 'user'
    }
  })

  const isUser = computed(() => role.value === 'user')
  const isOrganizer = computed(() => role.value === 'organizer')
  const isAdmin = computed(() => role.value === 'admin')

  return {
    // State
    session,

    // Auth
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    logout,
    createUser,

    // Session
    fetchSession,

    // Roles
    role,
    isUser,
    isOrganizer,
    isAdmin,
  }
}

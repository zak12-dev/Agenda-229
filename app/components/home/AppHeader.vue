<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '../../../composables/useAuth'
import { navigateTo, useRoute } from '#app'
import { log } from 'node:console'

const sessionLoaded = ref(false)

onMounted(async () => {
  await fetchSession()
  sessionLoaded.value = true
})

// ====== AUTH ======
const { session, logout, fetchSession } = useAuth()
const isLoggedIn = computed(() => !!session.value?.user)
console.log('User session:', session.value, isLoggedIn.value)

// ====== STATE ======
const route = useRoute()
const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

// ====== FETCH SESSION AU MONTAGE ======
if (process.client) {
  onMounted(async () => {
    await fetchSession()
    const handleScroll = () => (isScrolled.value = window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))
  })
}

// ====== WATCH ======
watch(
  () => route.path,
  () => (mobileMenuOpen.value = false)
)
watch(mobileMenuOpen, (isOpen) => {
  if (process.client) document.body.style.overflow = isOpen ? 'hidden' : ''
})

// ====== NAVIGATION ======
function goToLogin() {
  navigateTo('/auth/login')
  mobileMenuOpen.value = false
}
function goToSignUp() {
  navigateTo('/auth/signup')
  mobileMenuOpen.value = false
}

// ====== NAV ITEMS ======
const navitems = computed<NavigationMenuItem[]>(() => {
  // Tout le monde voit "Evènements"
  const items: NavigationMenuItem[] = [
    { label: 'Evènements', to: '/events', active: route.path.startsWith('/events') },
  ]

  // Si l'utilisateur est connecté, ajouter "Favoris"
  if (isLoggedIn.value) {
    items.push({
      label: 'Favoris',
      to: '/favorites',
      active: route.path === '/favorites',
      icon: 'i-lucide-heart',
    })
  }

  return items
})

// ====== DROPDOWN ITEMS ======
const dropdownitems = computed<DropdownMenuItem[][]>(() => {
  if (isLoggedIn.value) {
    // Section principale
    const mainItems: DropdownMenuItem[] = [
      { label: 'Mon profil', icon: 'i-lucide-user', onClick: () => navigateTo('/profile') },
    ]

    // Si admin ou organisateur, ajouter "Dashboard"
    if (session.value?.user?.roleId === 1 || session.value?.user?.roleId === 2) {
      mainItems.push({
        label: 'Dashboard',
        icon: 'i-lucide-layout',
        onClick: () => navigateTo('/dashboard/events'),
      })
    }

    // Ajouter déconnexion
    mainItems.push({
      label: 'Déconnexion',
      icon: 'i-lucide-log-out',
      onClick: async () => {
        await logout()
        navigateTo('/')
      },
    })

    return [mainItems, [{ label: "Centre d'aide", icon: 'i-lucide-help-circle' }]]
  } else {
    // Utilisateur non connecté
    return [
      [
        { label: 'Connexion', icon: 'i-lucide-log-in', onClick: goToLogin },
        { label: 'Inscriptions', icon: 'i-lucide-user-plus', onClick: goToSignUp },
      ],
      [{ label: "Centre d'aide", icon: 'i-lucide-help-circle' }],
    ]
  }
})
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-700 bg-white/95 backdrop-blur-xl border-b border-gray-200/50"
  >
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-16 lg:h-18">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 sm:gap-3 z-50">
          <div
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-500 bg-gradient-to-br from-orange-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
          >
            WLE
          </div>
          <span
            class="hidden sm:block text-base lg:text-3xl font-bold tracking-tight transition-all duration-500 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600"
            >WeLoveEvents</span
          >
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav
          class="hidden md:flex items-center gap-0.5 px-2 py-1.5 rounded-full transition-all duration-500 bg-gray-100/90"
        >
          <NuxtLink
            v-for="item in navitems"
            :key="item.to"
            :to="item.to"
            class="px-4 lg:px-5 py-2 text-xs lg:text-sm font-medium rounded-full transition-all duration-300 bg-white text-purple-600 shadow-sm text-gray-600 hover:text-purple-600"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="hidden sm:block"><AppSearch /></div>

          <div class="hidden md:block">
            <UDropdownMenu :items="dropdownitems" :ui="{ content: 'w-56' }">
              <button
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wide transition-all duration-500 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 rounded-full"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span class="hidden lg:inline">{{ isLoggedIn ? 'Mon profil' : 'Compte' }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </UDropdownMenu>
          </div>

          <!-- Mobile Burger -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            :class="[
              'md:hidden p-2 rounded-lg transition-all duration-300 bg-white/10 backdrop-blur-sm text-black border border-white/10',
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        @click="mobileMenuOpen = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="-translate-y-full"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed top-14 sm:top-16 left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-gray-200/50 z-40 md:hidden max-h-[85vh] overflow-y-auto"
      >
        <div class="px-4 py-4 border-b border-gray-100 sm:hidden"><AppSearch /></div>
        <nav class="px-4 py-4 space-y-1">
          <NuxtLink
            v-for="item in navitems"
            :key="item.to"
            :to="item.to"
            class="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
            :class="item.active ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
        <<!-- Mobile actions -->
        <div class="px-4 py-4 border-t border-gray-100 space-y-2">
          <template v-if="!isLoggedIn">
            <button
              @click="goToLogin"
              class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-xl"
            >
              Connexion
            </button>
            <button
              @click="goToSignUp"
              class="w-full py-2.5 border border-purple-600 text-purple-600 text-sm font-medium rounded-xl"
            >
              Inscription
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>

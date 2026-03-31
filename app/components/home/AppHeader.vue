<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '../../../composables/useAuth'
import { navigateTo, useRoute } from '#app'

const { session, logout, fetchSession } = useAuth()
const isLoggedIn = computed(() => !!session.value?.user)
const userName = computed(() => session.value?.user?.name || session.value?.user?.email || 'Utilisateur')
const userAvatar  = computed(() => session.value?.user?.image || null)
const userInitial = computed(() => (userName.value?.[0] ?? 'U').toUpperCase())
const userRole    = computed(() => {
  const roleId = session.value?.user?.roleId
  if (roleId === 1) return 'Administrateur'
  if (roleId === 2) return 'Organisateur'
  return 'Utilisateur'
})
const isOrganizer = computed(() => session.value?.user?.roleId === 1 || session.value?.user?.roleId === 2)

const route      = useRoute()
const isScrolled = ref(false)
const drawerOpen = ref(false)

if (process.client) {
  onMounted(async () => {
    await fetchSession()
    const handleScroll = () => (isScrolled.value = window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))
  })
}

watch(() => route.path, () => (drawerOpen.value = false))
watch(drawerOpen, (open) => { if (process.client) document.body.style.overflow = open ? 'hidden' : '' })

const navitems = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
    { label: 'Évènements', to: '/events', active: route.path.startsWith('/events') },
  ]
  if (isLoggedIn.value) items.push({ label: 'Favoris', to: '/favoris', active: route.path === '/favoris' })
  return items
})

const mobileNavLinks = computed(() => [
  { label: 'Accueil',    to: '/',       icon: 'i-heroicons-home',          active: route.path === '/'               },
  { label: 'Évènements', to: '/events', icon: 'i-heroicons-calendar-days', active: route.path.startsWith('/events') },
  ...(isLoggedIn.value ? [{ label: 'Favoris', to: '/favoris', icon: 'i-heroicons-heart', active: route.path === '/favoris' }] : []),
])

const mobileOrgaLinks = computed(() => isOrganizer.value ? [
  { label: 'Dashboard',          to: '/dashboard/events',        icon: 'i-heroicons-squares-2x2' },
  { label: 'Créer un événement', to: '/dashboard/events/create', icon: 'i-heroicons-plus-circle' },
  { label: 'Statistiques',       to: '/dashboard/analytics',     icon: 'i-heroicons-chart-bar'   },
] : [])

const dropdownitems = computed<DropdownMenuItem[][]>(() => {
  if (isLoggedIn.value) {
    const main: DropdownMenuItem[] = [
      { label: 'Mon profil', icon: 'i-heroicons-user-circle', onClick: () => navigateTo('/profile') },
    ]
    if (isOrganizer.value) main.push({ label: 'Mon dashboard', icon: 'i-heroicons-squares-2x2', onClick: () => navigateTo('/dashboard/events') })
    main.push({ label: 'Déconnexion', icon: 'i-heroicons-arrow-right-on-rectangle', onClick: async () => { await logout(); navigateTo('/') } })
    return [main, [{ label: "Centre d'aide", icon: 'i-heroicons-lifebuoy' }]]
  }
  return [
    [
      { label: 'Connexion',   icon: 'i-heroicons-arrow-right-on-rectangle', onClick: () => navigateTo('/auth/login')  },
      { label: 'Inscription', icon: 'i-heroicons-user-plus',                onClick: () => navigateTo('/auth/signup') },
    ],
    [{ label: "Centre d'aide", icon: 'i-heroicons-lifebuoy' }],
  ]
})

const getAvatarGradient = (name: string) => {
  const colors = [['#ea6c1e','#f59e0b'],['#5b47e0','#818cf8'],['#059669','#34d399'],['#dc2626','#f87171'],['#0891b2','#67e8f9'],['#7c3aed','#c4b5fd']]
  const i = (name.charCodeAt(0) || 0) % colors.length
  return `linear-gradient(135deg, ${colors[i][0]}, ${colors[i][1]})`
}

async function handleLogout() {
  drawerOpen.value = false
  await logout()
  navigateTo('/')
}
</script>

<template>

  <header :class="['fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-outfit', isScrolled ? 'bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#ede8e0] shadow-[0_2px_24px_rgba(0,0,0,0.06)]' : 'bg-[#faf8f5]/80 backdrop-blur-sm border-b border-[#ede8e0]/60']">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-14 sm:h-16 gap-4">

        <NuxtLink to="/" class="flex items-center gap-2 flex-shrink-0 group">
          <svg width="32" height="32" viewBox="0 0 100 110" class="transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
            <circle cx="50" cy="18" r="16" fill="#ea6c1e"/>
            <path d="M10 55 Q10 95 30 95 Q40 95 50 80 Q60 95 70 95 Q90 95 90 55 L90 50 Q90 40 80 40 L70 40 Q60 40 60 50 L60 68 Q60 75 50 75 Q40 75 40 68 L40 50 Q40 40 30 40 L20 40 Q10 40 10 50 Z" fill="#ea6c1e"/>
          </svg>
          <span class="text-[16px] sm:text-[17px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">WeLoveEvent</span>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white border border-[#ede8e0] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <NuxtLink v-for="item in navitems" :key="item.to" :to="item.to" :class="['px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200', item.active ? 'bg-[#f5f0e8] text-[#ea6c1e] shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]' : 'text-[#8a8078] hover:text-[#1a1612] hover:bg-[#faf5ee]']">{{ item.label }}</NuxtLink>
        </nav>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="hidden sm:block"><AppSearch /></div>

          <div class="hidden md:block">
            <UDropdownMenu :items="dropdownitems" :ui="{ content: 'bg-[#faf8f5] border border-[#ede8e0] shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl p-1.5 w-56', item: 'font-outfit text-[13px] font-medium text-[#4a3f32] rounded-xl px-3 py-2.5 hover:bg-white hover:shadow-[0_1px_6px_rgba(0,0,0,0.06)] transition-all duration-150', separator: 'bg-[#ede8e0]' }">
              <button v-if="isLoggedIn" class="group flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.05)] hover:border-[#ea6c1e]/40 hover:shadow-[0_2px_16px_rgba(234,108,30,0.12)] transition-all duration-200">
                <div class="relative">
                  <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="w-7 h-7 rounded-xl object-cover" />
                  <div v-else class="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-xs" :style="`background: ${getAvatarGradient(userName)}`">{{ userInitial }}</div>
                </div>
                <div class="text-left">
                  <p class="text-[12px] font-semibold text-[#1a1612] leading-tight truncate max-w-[100px]">{{ userName }}</p>
                  <p class="text-[10px] text-[#b0a898] capitalize leading-tight">{{ userRole }}</p>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 text-[#c0b8ad] group-hover:text-[#ea6c1e] transition-colors flex-shrink-0" />
              </button>
              <button v-else class="flex items-center gap-2 pl-3 pr-3 py-2 rounded-2xl group bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.05)] hover:border-[#ea6c1e]/40 hover:shadow-[0_2px_16px_rgba(234,108,30,0.12)] transition-all duration-200">
                <div class="w-6 h-6 rounded-lg bg-[#f5f0e8] border border-[#ede8e0] flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-[#8a8078] group-hover:text-[#ea6c1e] transition-colors" />
                </div>
                <span class="text-[13px] font-medium text-[#4a3f32]">Compte</span>
                <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 text-[#c0b8ad] group-hover:text-[#ea6c1e] transition-colors" />
              </button>
            </UDropdownMenu>
          </div>

          <!-- BURGER animé -->
          <button @click="drawerOpen = !drawerOpen"
            :class="['md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200', drawerOpen ? 'bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] shadow-[0_2px_12px_rgba(234,108,30,0.3)]' : 'bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.05)] hover:border-[#ea6c1e]/40']"
            aria-label="Menu">
            <div class="w-[16px] h-[12px] flex flex-col justify-between">
              <span :class="['block h-[2px] rounded-full transition-all duration-300 origin-center', drawerOpen ? 'bg-white rotate-45 translate-y-[5px]' : 'bg-[#4a3f32]']" />
              <span :class="['block h-[2px] rounded-full transition-all duration-200', drawerOpen ? 'bg-white opacity-0 scale-x-0' : 'bg-[#4a3f32]']" />
              <span :class="['block h-[2px] rounded-full transition-all duration-300 origin-center', drawerOpen ? 'bg-white -rotate-45 -translate-y-[5px]' : 'bg-[#4a3f32]']" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Overlay -->
  <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="drawerOpen" class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden" @click="drawerOpen = false" />
  </Transition>

  <!-- Drawer latéral gauche -->
  <Transition enter-active-class="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" enter-from-class="translate-x-full" enter-to-class="translate-x-0" leave-active-class="transition-transform duration-250 ease-in" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
    <div v-if="drawerOpen" class="fixed top-0 right-0 bottom-0 w-[290px] z-50 flex flex-col bg-[#faf8f5] border-l border-[#ede8e0] shadow-[-6px_0_40px_rgba(0,0,0,0.10)] md:hidden">

      <!-- Header drawer -->
      <div class="flex items-center justify-between px-5 h-14 border-b border-[#ede8e0] flex-shrink-0">
        <NuxtLink to="/" @click="drawerOpen = false" class="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 100 110" class="flex-shrink-0">
            <circle cx="50" cy="18" r="16" fill="#ea6c1e"/>
            <path d="M10 55 Q10 95 30 95 Q40 95 50 80 Q60 95 70 95 Q90 95 90 55 L90 50 Q90 40 80 40 L70 40 Q60 40 60 50 L60 68 Q60 75 50 75 Q40 75 40 68 L40 50 Q40 40 30 40 L20 40 Q10 40 10 50 Z" fill="#ea6c1e"/>
          </svg>
          <span class="text-[15px] font-bold text-[#1a1612]">WeLove<span class="text-[#ea6c1e]">Event</span></span>
        </NuxtLink>
        <button @click="drawerOpen = false" class="w-7 h-7 rounded-lg bg-white border border-[#ede8e0] flex items-center justify-center hover:border-[#ea6c1e]/40 transition-colors">
          <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5 text-[#8a8078]" />
        </button>
      </div>

      <!-- Contenu scrollable -->
      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-5">

        <!-- Carte user connecté -->
        <div v-if="isLoggedIn" class="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#ede8e0] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div class="relative flex-shrink-0">
            <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="w-10 h-10 rounded-xl object-cover" />
            <div v-else class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" :style="`background: ${getAvatarGradient(userName)}`">{{ userInitial }}</div>
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[13px] font-bold text-[#1a1612] truncate">{{ userName }}</p>
            <p class="text-[11px] text-[#b0a898] capitalize">{{ userRole }}</p>
          </div>
          <span class="px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-600 uppercase tracking-wide flex-shrink-0">● En ligne</span>
        </div>



        <!-- Navigation -->
        <div>
          <p class="section-label">Navigation</p>
          <div class="space-y-0.5">
            <NuxtLink v-for="link in mobileNavLinks" :key="link.to" :to="link.to" @click="drawerOpen = false" :class="['drawer-link', link.active ? 'drawer-link--active' : 'drawer-link--default']">
              <div :class="['drawer-icon', link.active ? 'drawer-icon--orange' : 'drawer-icon--neutral']">
                <UIcon :name="link.icon" class="w-3.5 h-3.5" :class="link.active ? 'text-[#ea6c1e]' : 'text-[#b0a898]'" />
              </div>
              <span class="flex-1">{{ link.label }}</span>
              <span v-if="link.active" class="w-1.5 h-1.5 rounded-full bg-[#ea6c1e]" />
            </NuxtLink>
          </div>
        </div>

        <!-- Espace organisateur -->
        <div v-if="isLoggedIn && isOrganizer">
          <p class="section-label">Espace organisateur</p>
          <div class="space-y-0.5">
            <NuxtLink v-for="link in mobileOrgaLinks" :key="link.to" :to="link.to" @click="drawerOpen = false" :class="['drawer-link', route.path.startsWith(link.to) ? 'drawer-link--indigo' : 'drawer-link--default']">
              <div :class="['drawer-icon', route.path.startsWith(link.to) ? 'drawer-icon--indigo' : 'drawer-icon--neutral']">
                <UIcon :name="link.icon" class="w-3.5 h-3.5" :class="route.path.startsWith(link.to) ? 'text-[#5b47e0]' : 'text-[#b0a898]'" />
              </div>
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>

        <!-- Mon compte -->
        <div v-if="isLoggedIn">
          <p class="section-label">Mon compte</p>
          <div class="space-y-0.5">
            <NuxtLink to="/profile" @click="drawerOpen = false" class="drawer-link drawer-link--default">
              <div class="drawer-icon drawer-icon--neutral"><UIcon name="i-heroicons-user-circle" class="w-3.5 h-3.5 text-[#b0a898]" /></div>Mon profil
            </NuxtLink>
            <NuxtLink to="/contact" @click="drawerOpen = false" class="drawer-link drawer-link--default">
              <div class="drawer-icon drawer-icon--neutral"><UIcon name="i-heroicons-lifebuoy" class="w-3.5 h-3.5 text-[#b0a898]" /></div>Centre d'aide
            </NuxtLink>
          </div>
        </div>

      </div>

      <!-- Footer drawer -->
      <div class="px-4 pt-3 pb-5 border-t border-[#ede8e0] space-y-2 flex-shrink-0">
        <NuxtLink v-if="isLoggedIn && !isOrganizer" to="/organizerForm" @click="drawerOpen = false"
          class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-[#5b47e0] bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors">
          <div class="w-6 h-6 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center">
            <UIcon name="i-heroicons-megaphone" class="w-3 h-3 text-[#5b47e0]" />
          </div>Devenir organisateur
        </NuxtLink>
        <button v-if="isLoggedIn" @click="handleLogout"
          class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[12.5px] font-medium text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
          <div class="w-6 h-6 rounded-lg bg-red-100 border border-red-100 flex items-center justify-center">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-3 h-3 text-red-500" />
          </div>Déconnexion
        </button>
        <!-- Auth si non connecté -->
        <template v-if="!isLoggedIn">
          <NuxtLink to="/auth/login" @click="drawerOpen = false" class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0] shadow-[0_4px_14px_rgba(234,108,30,0.2)] hover:opacity-90 transition-opacity">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />Se connecter
          </NuxtLink>
          <NuxtLink to="/auth/signup" @click="drawerOpen = false" class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-bold text-[#ea6c1e] bg-white border border-[#ede8e0] hover:border-[#ea6c1e]/40 transition-all">
            <UIcon name="i-heroicons-user-plus" class="w-4 h-4" />Créer un compte
          </NuxtLink>
        </template>
        <div class="flex items-center justify-center gap-3 pt-1">
          <NuxtLink to="/helps/terms" @click="drawerOpen = false" class="text-[10.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">CGU</NuxtLink>
          <span class="w-1 h-1 rounded-full bg-[#d4cec5]" />
          <NuxtLink to="/privacy" @click="drawerOpen = false" class="text-[10.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Confidentialité</NuxtLink>
          <span class="w-1 h-1 rounded-full bg-[#d4cec5]" />
          <NuxtLink to="/contact" @click="drawerOpen = false" class="text-[10.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Contact</NuxtLink>
        </div>
      </div>

    </div>
  </Transition>

</template>

<style scoped>

.section-label {
  font-size: 10px; font-weight: 700; color: #c0b8ad;
  text-transform: uppercase; letter-spacing: 0.1em;
  margin-bottom: 6px; padding-left: 4px;
  font-family: 'Outfit', sans-serif;
}
.drawer-link {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 12px;
  font-size: 13px; font-weight: 500;
  font-family: 'Outfit', sans-serif;
  transition: all 0.15s; text-decoration: none;
  cursor: pointer; width: 100%;
}
.drawer-link--default  { color: #8a8078; }
.drawer-link--default:hover { background: white; color: #1a1612; }
.drawer-link--active   { background: white; color: #1a1612; box-shadow: 0 1px 6px rgba(0,0,0,0.05); border: 1px solid #ede8e0; }
.drawer-link--indigo   { background: white; color: #5b47e0; box-shadow: 0 1px 6px rgba(91,71,224,0.08); border: 1px solid #e0ddfa; }
.drawer-icon {
  width: 28px; height: 28px; border-radius: 8px; border: 1px solid;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.drawer-icon--neutral { background: #f5f3ef; border-color: #ede8e0; }
.drawer-icon--orange  { background: #fff5ee; border-color: #fde4cc; }
.drawer-icon--indigo  { background: #eeedfb; border-color: #d4d0f7; }
</style>
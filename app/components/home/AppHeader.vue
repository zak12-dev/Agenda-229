<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '../../../composables/useAuth'
import { navigateTo, useRoute } from '#app'

// ====== AUTH ======
const { session, logout, fetchSession } = useAuth()
const isLoggedIn  = computed(() => !!session.value?.user)
const isOrganizer = computed(() => session.value?.user?.roleId === 2)
const isAdmin     = computed(() => session.value?.user?.roleId === 1)

// ====== USER INFOS ======
const userName    = computed(() => session.value?.user?.name || session.value?.user?.email || 'Utilisateur')
const userAvatar  = computed(() => session.value?.user?.image || null)
const userInitial = computed(() => (userName.value?.[0] ?? 'U').toUpperCase())
const userRole    = computed(() => {
  const roleId = session.value?.user?.roleId
  if (roleId === 1) return 'Administrateur'
  if (roleId === 2) return 'Organisateur'
  return 'Utilisateur'
})

// ====== STATE ======
const route          = useRoute()
const isScrolled     = ref(false)
const drawerOpen     = ref(false)

// ====== LIFECYCLE ======
if (process.client) {
  onMounted(async () => {
    await fetchSession()
    const handleScroll = () => (isScrolled.value = window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))
  })
}

// Ferme le drawer à chaque changement de route
watch(() => route.path, () => (drawerOpen.value = false))

// Bloque le scroll body quand le drawer est ouvert
watch(drawerOpen, (isOpen) => {
  if (process.client) document.body.style.overflow = isOpen ? 'hidden' : ''
})

// ====== HELPERS ======
function goToLogin()  { navigateTo('/auth/login');  drawerOpen.value = false }
function goToSignup() { navigateTo('/auth/signup'); drawerOpen.value = false }

const getAvatarGradient = (name: string) => {
  const colors = [
    ['#ea6c1e','#f59e0b'], ['#5b47e0','#818cf8'], ['#059669','#34d399'],
    ['#dc2626','#f87171'], ['#0891b2','#67e8f9'], ['#7c3aed','#c4b5fd'],
  ]
  const i = (name.charCodeAt(0) || 0) % colors.length
  return `linear-gradient(135deg, ${colors[i][0]}, ${colors[i][1]})`
}

// ====== NAV ITEMS ======
const navItems = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
    { label: 'Évènements', to: '/events',  active: route.path.startsWith('/events')  },
  ]
  if (isLoggedIn.value) {
    items.push({ label: 'Favoris', to: '/favoris', active: route.path === '/favoris' })
  }
  return items
})

// ====== ORGANISATEUR NAV ======
const orgaItems = [
  { label: 'Mes événements',  icon: 'i-heroicons-calendar-days',  to: '/dashboard/events'    },
  { label: 'Créer un événement', icon: 'i-heroicons-plus-circle', to: '/dashboard/events/new' },
  { label: 'Analytiques',     icon: 'i-heroicons-chart-bar',      to: '/dashboard/analytic'  },
]

// ====== DROPDOWN DESKTOP ======
const dropdownItems = computed<DropdownMenuItem[][]>(() => {
  if (isLoggedIn.value) {
    const main: DropdownMenuItem[] = [
      { label: 'Mon profil', icon: 'i-heroicons-user-circle', onClick: () => navigateTo('/profile') },
    ]
    if (isAdmin.value || isOrganizer.value) {
      main.push({
        label: 'Mon dashboard',
        icon: 'i-heroicons-squares-2x2',
        onClick: () => navigateTo('/dashboard/events'),
      })
    }
    main.push({
      label: 'Déconnexion',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onClick: async () => { await logout(); navigateTo('/') },
    })
    return [main, [{ label: "Centre d'aide", icon: 'i-heroicons-lifebuoy', onClick: () => navigateTo('/contact') }]]
  }
  return [
    [
      { label: 'Connexion',   icon: 'i-heroicons-arrow-right-on-rectangle', onClick: goToLogin  },
      { label: 'Inscription', icon: 'i-heroicons-user-plus',                onClick: goToSignup },
    ],
    [{ label: "Centre d'aide", icon: 'i-heroicons-lifebuoy', onClick: () => navigateTo('/contact') }],
  ]
})
</script>

<template>
  <!-- ═══════════════════════════════════════════
       HEADER FIXE
  ═══════════════════════════════════════════ -->
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-outfit',
      isScrolled
        ? 'bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#ede8e0] shadow-[0_2px_24px_rgba(0,0,0,0.06)]'
        : 'bg-[#faf8f5]/80 backdrop-blur-sm border-b border-[#ede8e0]/60'
    ]"
  >
    <div class="max-w-8xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-14 sm:h-16 gap-4">

        <!-- ══ LOGO ══ -->
        <NuxtLink to="/" class="flex items-center gap-2.5 flex-shrink-0 group">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center
                      bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0]
                      shadow-[0_4px_14px_rgba(234,108,30,0.3)]
                      group-hover:shadow-[0_4px_20px_rgba(234,108,30,0.45)]
                      transition-all duration-300 group-hover:scale-105">
            <span class="text-[10px] font-black text-white tracking-tight">WLE</span>
          </div>
          <span class="text-[16px] sm:text-[17px] font-bold tracking-tight text-[#1a1612]
                       group-hover:text-[#ea6c1e] transition-colors duration-300">
            WeLove<span class="text-[#ea6c1e]">Events</span>
          </span>
        </NuxtLink>

        <!-- ══ NAV DESKTOP ══ -->
        <nav class="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white border border-[#ede8e0]
                    shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <NuxtLink
            v-for="item in navItems" :key="item.to" :to="item.to"
            :class="[
              'px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200',
              item.active
                ? 'bg-[#f5f0e8] text-[#ea6c1e] shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]'
                : 'text-[#8a8078] hover:text-[#1a1612] hover:bg-[#faf5ee]'
            ]"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- ══ DROITE ══ -->
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="hidden sm:block"><AppSearch /></div>

          <!-- Dropdown desktop -->
          <div class="hidden md:block">
            <UDropdownMenu
              :items="dropdownItems"
              :ui="{
                content: 'bg-[#faf8f5] border border-[#ede8e0] shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl p-1.5 w-56',
                item: 'font-outfit text-[13px] font-medium text-[#4a3f32] rounded-xl px-3 py-2.5 hover:bg-white hover:shadow-[0_1px_6px_rgba(0,0,0,0.06)] transition-all duration-150',
                separator: 'bg-[#ede8e0]',
              }"
            >
              <!-- Trigger connecté -->
              <button v-if="isLoggedIn"
                class="group flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl
                       bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.05)]
                       hover:border-[#ea6c1e]/40 hover:shadow-[0_2px_16px_rgba(234,108,30,0.12)]
                       transition-all duration-200">
                <div class="relative">
                  <img v-if="userAvatar" :src="userAvatar" :alt="userName"
                    class="w-7 h-7 rounded-xl object-cover" />
                  <div v-else class="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                    :style="`background: ${getAvatarGradient(userName)}`">
                    {{ userInitial }}
                  </div>
                  <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-[1.5px] border-white" />
                </div>
                <div class="text-left">
                  <p class="text-[12px] font-semibold text-[#1a1612] leading-tight truncate max-w-[100px]">{{ userName }}</p>
                  <p class="text-[10px] text-[#b0a898] capitalize leading-tight">{{ userRole }}</p>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 text-[#c0b8ad] group-hover:text-[#ea6c1e] transition-colors flex-shrink-0" />
              </button>

              <!-- Trigger non connecté -->
              <button v-else
                class="flex items-center gap-2 pl-3 pr-3 py-2 rounded-2xl
                       bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.05)]
                       hover:border-[#ea6c1e]/40 hover:shadow-[0_2px_16px_rgba(234,108,30,0.12)]
                       transition-all duration-200 group">
                <div class="w-6 h-6 rounded-lg bg-[#f5f0e8] border border-[#ede8e0] flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-[#8a8078] group-hover:text-[#ea6c1e] transition-colors" />
                </div>
                <span class="text-[13px] font-medium text-[#4a3f32]">Compte</span>
                <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 text-[#c0b8ad] group-hover:text-[#ea6c1e] transition-colors" />
              </button>
            </UDropdownMenu>
          </div>

          <!-- ══ BURGER MOBILE ══ -->
          <button
            @click="drawerOpen = !drawerOpen"
            class="md:hidden relative flex items-center justify-center w-9 h-9 rounded-xl
                   bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.05)]
                   hover:border-[#ea6c1e]/40 transition-all duration-200"
            aria-label="Menu"
          >
            <!-- Icône animée hamburger → X -->
            <span class="relative w-4 h-3.5 flex flex-col justify-between">
              <span :class="['block h-0.5 rounded-full bg-[#4a3f32] transition-all duration-300 origin-center',
                drawerOpen ? 'rotate-45 translate-y-[6px]' : '']" />
              <span :class="['block h-0.5 rounded-full bg-[#4a3f32] transition-all duration-200',
                drawerOpen ? 'opacity-0 scale-x-0' : '']" />
              <span :class="['block h-0.5 rounded-full bg-[#4a3f32] transition-all duration-300 origin-center',
                drawerOpen ? '-rotate-45 -translate-y-[6px]' : '']" />
            </span>
            <!-- Dot orange si connecté -->
            <span v-if="isLoggedIn"
              class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ea6c1e] border-[1.5px] border-white" />
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- ═══════════════════════════════════════════
       OVERLAY
  ═══════════════════════════════════════════ -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0" enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-250"
    leave-from-class="opacity-100" leave-to-class="opacity-0"
  >
    <div v-if="drawerOpen"
      class="fixed inset-0 z-[60] bg-[#1a1612]/40 backdrop-blur-sm md:hidden"
      @click="drawerOpen = false"
    />
  </Transition>

  <!-- ═══════════════════════════════════════════
       DRAWER LATÉRAL GAUCHE
  ═══════════════════════════════════════════ -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-250 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <aside v-if="drawerOpen"
      class="fixed top-0 left-0 bottom-0 z-[70] w-[300px] max-w-[85vw]
             bg-[#faf8f5] border-r border-[#ede8e0]
             shadow-[4px_0_32px_rgba(0,0,0,0.10)]
             flex flex-col md:hidden font-outfit overflow-hidden"
    >

      <!-- ── HEADER DRAWER ── -->
      <div class="bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] px-5 pt-12 pb-6 relative overflow-hidden flex-shrink-0">
        <!-- Motif points -->
        <div class="absolute inset-0 opacity-10"
          style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 18px 18px;" />
        <!-- Vague bas -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 300 16" preserveAspectRatio="none" class="w-full h-4">
            <path d="M0,16 C75,0 225,0 300,16 L300,16 L0,16 Z" fill="#faf8f5"/>
          </svg>
        </div>

        <div class="relative">
          <!-- Connecté : avatar + nom -->
          <template v-if="isLoggedIn">
            <div class="flex items-center gap-3">
              <div class="relative">
                <img v-if="userAvatar" :src="userAvatar" :alt="userName"
                  class="w-12 h-12 rounded-2xl object-cover border-2 border-white/30" />
                <div v-else
                  class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg
                         border-2 border-white/30"
                  :style="`background: ${getAvatarGradient(userName)}`">
                  {{ userInitial }}
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div>
                <p class="text-[15px] font-bold text-white leading-tight truncate max-w-[160px]">{{ userName }}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10.5px] text-white/70 capitalize">{{ userRole }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Non connecté : logo + tagline -->
          <template v-else>
            <div class="flex items-center gap-2.5 mb-1">
              <div class="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <span class="text-[10px] font-black text-white">WLE</span>
              </div>
              <span class="text-[17px] font-bold text-white">WeLove<span class="text-white/80">Events</span></span>
            </div>
            <p class="text-[12px] text-white/65">Découvrez les meilleurs événements du Bénin</p>
          </template>
        </div>
      </div>

      <!-- ── CONTENU SCROLLABLE ── -->
      <div class="flex-1 overflow-y-auto px-3 py-4 space-y-5">

        <!-- Section : Navigation -->
        <div>
          <p class="text-[10px] font-bold text-[#c0b8ad] uppercase tracking-widest mb-2 px-2">Navigation</p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in navItems" :key="item.to" :to="item.to"
              @click="drawerOpen = false"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150',
                item.active
                  ? 'bg-white shadow-[0_1px_8px_rgba(0,0,0,0.06)] text-[#1a1612] ring-1 ring-[#ede8e0]'
                  : 'text-[#8a8078] hover:bg-white hover:text-[#1a1612]'
              ]"
            >
              <span :class="['w-1.5 h-1.5 rounded-full flex-shrink-0',
                item.active ? 'bg-[#ea6c1e]' : 'bg-[#d4cec5]']" />
              {{ item.label }}
              <span v-if="item.active" class="ml-auto w-1.5 h-1.5 rounded-full bg-[#ea6c1e]" />
            </NuxtLink>
          </div>
        </div>

        <!-- Section : Organisateur (si connecté orga/admin) -->
        <div v-if="isLoggedIn && (isOrganizer || isAdmin)">
          <p class="text-[10px] font-bold text-[#c0b8ad] uppercase tracking-widest mb-2 px-2">Organisateur</p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in orgaItems" :key="item.to" :to="item.to"
              @click="drawerOpen = false"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150',
                route.path.startsWith(item.to)
                  ? 'bg-indigo-50 text-[#5b47e0] border border-indigo-100'
                  : 'text-[#8a8078] hover:bg-white hover:text-[#1a1612]'
              ]"
            >
              <div :class="['w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                route.path.startsWith(item.to) ? 'bg-indigo-100 border border-indigo-200' : 'bg-[#f5f3ef] border border-[#ede8e0]']">
                <UIcon :name="item.icon" class="w-3.5 h-3.5"
                  :class="route.path.startsWith(item.to) ? 'text-[#5b47e0]' : 'text-[#8a8078]'" />
              </div>
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>

        <!-- Section : Compte (si connecté) -->
        <div v-if="isLoggedIn">
          <p class="text-[10px] font-bold text-[#c0b8ad] uppercase tracking-widest mb-2 px-2">Mon compte</p>
          <div class="space-y-1">
            <NuxtLink to="/profile" @click="drawerOpen = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium
                     text-[#8a8078] hover:bg-white hover:text-[#1a1612] transition-all duration-150">
              <div class="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-user-circle" class="w-3.5 h-3.5 text-[#ea6c1e]" />
              </div>
              Mon profil
            </NuxtLink>
            <NuxtLink to="/contact" @click="drawerOpen = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium
                     text-[#8a8078] hover:bg-white hover:text-[#1a1612] transition-all duration-150">
              <div class="w-7 h-7 rounded-lg bg-[#f5f3ef] border border-[#ede8e0] flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-lifebuoy" class="w-3.5 h-3.5 text-[#8a8078]" />
              </div>
              Centre d'aide
            </NuxtLink>
          </div>
        </div>

        <!-- Section : Devenir organisateur (si connecté mais pas orga) -->
        <div v-if="isLoggedIn && !isOrganizer && !isAdmin">
          <button
            @click="navigateTo('/organizerForm'); drawerOpen = false"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold
                   bg-gradient-to-r from-[#ea6c1e]/10 to-[#5b47e0]/10
                   border border-[#ea6c1e]/20 text-[#ea6c1e]
                   hover:from-[#ea6c1e]/15 hover:to-[#5b47e0]/15
                   transition-all duration-150"
          >
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0]
                        flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-megaphone" class="w-3.5 h-3.5 text-white" />
            </div>
            Devenir organisateur
            <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 ml-auto" />
          </button>
        </div>

      </div>

      <!-- ── FOOTER DRAWER ── -->
      <div class="px-3 pb-6 pt-3 border-t border-[#ede8e0] flex-shrink-0 space-y-2">

        <!-- Connecté : Déconnexion -->
        <button v-if="isLoggedIn"
          @click="logout(); navigateTo('/'); drawerOpen = false"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                 text-red-500 bg-red-50 border border-red-100
                 hover:bg-red-100 transition-colors duration-150"
        >
          <div class="w-7 h-7 rounded-lg bg-red-100 border border-red-100 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-3.5 h-3.5 text-red-500" />
          </div>
          Déconnexion
        </button>

        <!-- Non connecté : CTA login/signup -->
        <template v-else>
          <button @click="goToLogin"
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-bold
                   text-white bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                   shadow-[0_4px_14px_rgba(234,108,30,0.25)] hover:opacity-90 transition-opacity">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
            Se connecter
          </button>
          <button @click="goToSignup"
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold
                   text-[#4a3f32] bg-white border border-[#ede8e0]
                   hover:border-[#ea6c1e]/40 transition-all">
            <UIcon name="i-heroicons-user-plus" class="w-4 h-4 text-[#ea6c1e]" />
            S'inscrire gratuitement
          </button>
        </template>

        <!-- Version -->
        <p class="text-center text-[10px] text-[#c0b8ad] pt-1">WeLoveEvents · v1.0</p>
      </div>

    </aside>
  </Transition>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
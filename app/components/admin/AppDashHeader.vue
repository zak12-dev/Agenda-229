<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useToast } from '#imports'
import { navigateTo } from '#app'
import type { DropdownMenuItem } from '@nuxt/ui'

const { session, logout, role: userRole } = useAuth()
const route = useRoute()
const toast = useToast()

const userName = computed(
  () => session.value?.user.name || session.value?.user.email || 'Utilisateur'
)
const userAvatar = computed(() => session.value?.user.image || null)
const userInitial = computed(() => (userName.value?.[0] ?? 'U').toUpperCase())

// ─── Dropdown ───
const dropdownItems = ref<DropdownMenuItem[][]>([
  [
    {
      label: 'Mon profil',
      icon: 'i-heroicons-user-circle',
      to: '/dashboard/profileDash',
    },
  ],
  [
    {
      label: "Centre d'aide",
      icon: 'i-heroicons-lifebuoy',
      to: '/contact',
    },
  ],
  [
    {
      label: 'Se déconnecter',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onClick: async () => {
        try {
          await logout()
          toast.add({ title: '✓ Déconnecté', color: 'green' })
          await navigateTo('/')
        } catch {
          toast.add({ title: '✗ Erreur lors de la déconnexion', color: 'red' })
        }
      },
    },
  ],
])

// ─── Pages config ───
const pagesConfig: Record<string, { title: string; icon: string; description?: string }> = {
  'admin-index': {
    title: "Vue d'ensemble",
    icon: 'i-heroicons-squares-2x2',
    description: 'Tableau de bord et statistiques globales',
  },
  'admin-event': {
    title: 'Événements',
    icon: 'i-heroicons-calendar-days',
    description: 'Gérez vos événements à venir',
  },
  'admin-categories': {
    title: 'Catégories',
    icon: 'i-heroicons-tag',
    description: 'Organisez votre contenu par thématiques',
  },
  'admin-historique': {
    title: 'Historique',
    icon: 'i-heroicons-clock',
    description: "Toutes les demandes d'organisateur",
  },
  'admin-villes': {
    title: 'Villes',
    icon: 'i-heroicons-map-pin',
    description: 'Gérez les villes disponibles pour les événements',
  },
  'admin-organizer': {
    title: 'Organisateurs',
    icon: 'i-heroicons-user-group',
    description: 'Gérez les organisateurs',
  },
  'admin-demande': {
    title: 'Demandes',
    icon: 'i-heroicons-inbox',
    description: 'Liste de toutes vos demandes',
  },
  'admin-analytics': {
    title: 'Analytiques',
    icon: 'i-heroicons-chart-bar',
    description: 'Suivez vos performances',
  },
  'admin-settings': {
    title: 'Paramètres',
    icon: 'i-heroicons-cog-8-tooth',
    description: 'Configuration du dashboard',
  },
  'admin-profile': {
    title: 'Profil',
    icon: 'i-heroicons-user-circle',
    description: "Profil de l'utilisateur connecté",
  },
}

const currentPage = computed(
  () =>
    pagesConfig[route.name as string] || {
      title: 'Dashboard',
      icon: 'i-heroicons-home',
      description: 'Accueil',
    }
)

// ─── Breadcrumb ───
const breadcrumb = computed(() => {
  const crumbs = [{ label: 'Dashboard', to: '/dashboard/index' }]
  if (currentPage.value.title !== 'Dashboard') {
    crumbs.push({ label: currentPage.value.title, to: route.path })
  }
  return crumbs
})

// ─── Date du jour ───
const today = computed(() => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
})

// ─── Titre mobile : icône + nom de page courte ───
// Sur mobile on affiche juste l'icône + un label court pour gagner de la place
const mobileTitle = computed(() => {
  // Raccourcis pour les labels longs
  const shorts: Record<string, string> = {
    "Vue d'ensemble": 'Accueil',
    Événements: 'Événements',
    Catégories: 'Catégories',
    Historique: 'Historique',
    Villes: 'Villes',
    Organisateurs: 'Organisateurs',
    Demandes: 'Demandes',
    Analytiques: 'Analytics',
    Paramètres: 'Paramètres',
    Profil: 'Profil',
  }
  return shorts[currentPage.value.title] ?? currentPage.value.title
})
</script>

<template>
  <header
    class="sticky top-0 z-20 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#ede8e0] shadow-[0_1px_16px_rgba(0,0,0,0.04)]"
  >
    <div class="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
      <!-- ── Gauche : Icône + Titre ── -->
      <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
       

        <div class="min-w-0">
          <!-- Breadcrumb discret — desktop uniquement -->
          <div class="hidden md:flex items-center gap-1 mb-0.5">
            <NuxtLink
              v-for="(crumb, i) in breadcrumb"
              :key="crumb.to"
              :to="crumb.to"
              class="flex items-center gap-1"
            >
              <span
                :class="[
                  'font-outfit text-[10.5px] tracking-wide transition-colors',
                  i === breadcrumb.length - 1
                    ? 'text-[#ea6c1e] font-semibold cursor-default pointer-events-none'
                    : 'text-[#c0b8ad] hover:text-[#8a8078]',
                ]"
                >{{ crumb.label }}</span
              >
              <UIcon
                v-if="i < breadcrumb.length - 1"
                name="i-heroicons-chevron-right"
                class="w-2.5 h-2.5 text-[#d4cec5]"
              />
            </NuxtLink>
          </div>

          <!-- Titre desktop (sm+) -->
          <h1
            class="hidden sm:block font-outfit font-bold text-[18px] leading-tight text-[#1a1612] tracking-tight truncate"
          >
            {{ currentPage.title }}
          </h1>

          <!-- Titre mobile : label court + pill section active -->
          <div class="flex sm:hidden items-center gap-2">
            <div class="px-1 pt-4 pb-3 ">
              <NuxtLink to="/" class="block group">
                <h2
                  class="font-outfit font-bold text-[17px] tracking-tight text-[#1a1612] leading-none"
                >
                  WeLove
                  <span
                    class="bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0] bg-clip-text text-transparent"
                  >
                    Event
                  </span>
                </h2>
                <p class="mt-1 text-[10px] uppercase tracking-[0.05em] text-[#b0a898] font-medium">
                  Dashboard Admin
                </p>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Droite : Date + Séparateur + Avatar Dropdown ── -->
      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <!-- Date du jour — desktop uniquement -->
        <div
          class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#ede8e0]"
        >
          <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5 text-[#c0b8ad]" />
          <span class="font-outfit text-[11.5px] font-medium text-[#8a8078] capitalize">
            {{ today }}
          </span>
        </div>

        <!-- Séparateur desktop -->
        <div class="hidden lg:block h-6 w-px bg-[#ede8e0]" />

        <!-- Dropdown utilisateur -->
        <UDropdownMenu
          :items="dropdownItems"
          :ui="{
            content:
              'bg-[#faf8f5] border border-[#ede8e0] shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl p-1.5 w-56',
            item: 'font-outfit text-[13px] font-medium text-[#4a3f32] rounded-xl px-3 py-2.5 hover:bg-white hover:shadow-[0_1px_6px_rgba(0,0,0,0.06)] transition-all duration-150',
            separator: 'bg-[#ede8e0]',
          }"
        >
          <!-- Trigger -->
          <button
            class="group flex items-center gap-2 sm:gap-2.5 pl-1 pr-2 sm:pr-3 py-1 rounded-2xl bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.05)] hover:border-[#ea6c1e]/30 hover:shadow-[0_2px_12px_rgba(234,108,30,0.1)] transition-all duration-200"
          >
            <!-- Avatar -->
            <div class="relative">
              <img
                v-if="userAvatar"
                :src="userAvatar"
                :alt="userName"
                class="w-7 h-7 rounded-xl object-cover"
              />
              <div
                v-else
                class="w-7 h-7 rounded-xl bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] flex items-center justify-center text-white font-bold text-xs"
              >
                {{ userInitial }}
              </div>
              <!-- Online dot -->
              <span
                class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-[1.5px] border-white"
              />
            </div>

            <!-- Nom + rôle — masqué sur mobile -->
            <div class="hidden sm:block text-left">
              <p class="font-outfit text-[12px] font-semibold text-[#1a1612] leading-tight">
                {{ userName }}
              </p>
              <p class="font-outfit text-[10px] text-[#b0a898] capitalize leading-tight">
                {{ userRole ?? 'utilisateur' }}
              </p>
            </div>

            <!-- Chevron -->
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-3 h-3 text-[#c0b8ad] group-hover:text-[#ea6c1e] transition-colors"
            />
          </button>
        </UDropdownMenu>
      </div>
    </div>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
</style>

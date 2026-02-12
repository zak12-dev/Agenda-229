<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

// Récupérer la route actuelle
const route = useRoute()

// Lire la meta custom "headerAction" de la page
const headerAction = computed(() => route.meta.headerAction as { label: string; to: string; class?: string } | undefined)

// Configuration des pages avec icônes et descriptions
const pagesConfig: Record<string, { title: string; icon: string; description?: string }> = {
  'admin-index': {
    title: 'Vue d\'ensemble',
    icon: 'i-heroicons-squares-2x2',
    description: 'Tableau de bord et statistiques globales'
  },
  'admin-events': {
    title: 'Evenements',
    icon: 'i-heroicons-document-duplicate',
    description: 'Gérez vos evenements à venir'
  },
  'admin-categories': {
    title: 'Catégories',
    icon: 'i-heroicons-folder',
    description: 'Organisez votre contenu par thématiques'
  },
  'admin-organizer': {
    title: 'Organisateur',
    icon: 'i-heroicons-user-group',
    description: 'Gérez les organisateur'
  },
  'admin-analytics': {
    title: 'Analytiques',
    icon: 'i-heroicons-chart-bar',
    description: 'Suivez vos performances'
  },
  'admin-settings': {
    title: 'Paramètres',
    icon: 'i-heroicons-cog-8-tooth',
    description: 'Configuration du dashboard'
  },
  'profile': {
    title: 'Profile',
    icon: 'i-heroicons-cog-8-tooth',
    description: 'Profile de l\'utilisateur connecté'
  }
}

const currentPage = computed(() => pagesConfig[route.name as string] || {
  title: 'Dashboard',
  icon: 'i-heroicons-home',
  description: 'Accueil'
})

const pageTitle = computed(() => currentPage.value.title)
const pageIcon = computed(() => currentPage.value.icon)
const pageDescription = computed(() => currentPage.value.description)
</script>

<template>
  <div class="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-orange-200/50 dark:border-indigo-800/50">
    <div class="px-6 py-5">
      <div class="flex items-center justify-between">
        <!-- Section Titre avec icône -->
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 via-indigo-600 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/20">
            <UIcon :name="pageIcon" class="w-6 h-6 text-white" />
          </div>
          
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-orange-600 via-indigo-600 to-orange-700 bg-clip-text text-transparent">
              {{ pageTitle }}
            </h1>
            <p v-if="pageDescription" class="text-sm text-orange-600/70 dark:text-indigo-400/70 font-medium mt-0.5">
              {{ pageDescription }}
            </p>
          </div>
        </div>

        <!-- Actions et utilitaires -->
        <div class="flex items-center gap-3">
          <!-- Bouton de recherche rapide 
          <UButton
            icon="i-heroicons-magnifying-glass"
            color="gray"
            variant="ghost"
            square
            size="lg"
            class="hidden md:flex !text-orange-600 dark:!text-indigo-400 hover:!bg-orange-100/50 dark:hover:!bg-indigo-900/30 !rounded-xl transition-all duration-300"
          />-->

          <!-- Notifications 
          <UButton
            icon="i-heroicons-bell"
            color="gray"
            variant="ghost"
            square
            size="lg"
            class="relative !text-orange-600 dark:!text-indigo-400 hover:!bg-orange-100/50 dark:hover:!bg-indigo-900/30 !rounded-xl transition-all duration-300"
          >
            <span class="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-orange-500 to-indigo-500 rounded-full ring-2 ring-white dark:ring-gray-950"></span>
          </UButton>-->

          <!-- Action principale de la page (si définie) -->
          <UButton
            v-if="headerAction"
            :to="headerAction.to"
            :class="headerAction.class"
            icon="i-heroicons-plus"
            size="lg"
            class="!bg-gradient-to-r !from-orange-600 !via-indigo-600 !to-orange-700 hover:!from-orange-700 hover:!via-indigo-700 hover:!to-orange-800 !text-white !font-semibold !rounded-xl !shadow-lg !shadow-orange-500/40 hover:!shadow-xl hover:!shadow-orange-500/50 !transition-all !duration-300 hover:!scale-105"
          >
            {{ headerAction.label }}
          </UButton>
        </div>
      </div>

      <!-- Breadcrumb optionnel (peut être masqué sur mobile) -->
      <div class="hidden lg:flex items-center gap-2 mt-4 text-sm">
        <UButton
          to="/admin"
          variant="link"
          size="xs"
          class="!text-orange-600/70 dark:!text-indigo-400/70 hover:!text-orange-700 dark:hover:!text-indigo-300 !no-underline !font-medium"
        >
          Dashboard
        </UButton>
        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-orange-400 dark:text-indigo-600" />
        <span class="text-orange-700 dark:text-indigo-300 font-semibold">{{ pageTitle }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation de backdrop blur au scroll */
.sticky {
  transition: all 0.3s ease;
}
</style>
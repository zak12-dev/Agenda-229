<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '../../../composables/useAuth'
import { useToast } from '#imports'
import { ref, computed } from 'vue'
import { navigateTo } from '#app'

const toast = useToast()
const { logout, session } = useAuth() // récupère la session et logout

// Infos dynamiques de l'utilisateur connecté
const userName = computed(() => session.value?.name || session.value?.email || 'Utilisateur')
const userAvatar = computed(() => session.value?.image || 'https://github.com/benjamincanac.png')

// Dropdown dynamique
const dropdownItems = ref<DropdownMenuItem[][]>([
  [
    {
      label: userName.value,
      avatar: { src: userAvatar.value },
      type: 'label',
    },
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
    },
    {
      label: 'Settings',
      icon: 'i-lucide-cog',
      kbds: [','],
    },
  ],
  [
    {
      label: 'Support',
      icon: 'i-lucide-life-buoy',
      to: '/docs/components/dropdown-menu',
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onClick: async () => {
        try {
          await logout() // déconnexion
          toast.add({ title: '✓ Déconnecté', color: 'green' })
          await navigateTo('/') // redirection vers la page login
        } catch (err) {
          toast.add({ title: '✗ Erreur lors de la déconnexion', color: 'red' })
        }
      },
    },
  ],
])

const navItems: NavigationMenuItem[][] = [
  [
    { label: "Vue d'ensemble", icon: 'i-heroicons-squares-2x2', to: '/dashboard' },
    {
      label: 'Événements',
      icon: 'i-heroicons-document-duplicate',
      to: '/dashboard/events',
      badge: '123',
    },
    {
      label: 'Analytiques',
      icon: 'i-heroicons-document-duplicate',
      to: '/dashboard/analytics',
      badge: '123',
    },
    {
      label: 'Organisateurs',
      icon: 'i-heroicons-user-group',
      to: '/dashboard/organizers',
      badge: '123',
    },
    { label: 'Categories', icon: 'i-heroicons-chart-bar', to: '/dashboard/categorie', badge: '5' },
  ],
  [
    { label: 'Paramètres', icon: 'i-heroicons-cog-8-tooth', to: '/dashboard/settings' },
    { label: 'Support', icon: 'i-heroicons-lifebuoy', to: '/dashboard/support' },
  ],
]
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
    :ui="{
      root: 'border-r border-purple-100 dark:border-purple-900/30 bg-gradient-to-b from-white to-purple-50/30 dark:from-gray-950 dark:to-purple-950/20',
      body: 'gap-6 py-4 ',
    }"
  >
    <!-- Header -->
    <template #header="{ collapsed }">
      <div class="px-2 py-5">
        <div v-if="!collapsed" class="flex items-center gap-3">
          <div>
            <h2
              class="font-bold text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Plan tɛ wɛ
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Dashboard Admin</p>
          </div>
        </div>
        <div v-else class="flex justify-center">
          <div
            class="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
          >
            <span class="text-white font-bold text-sm relative z-10">LD</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Navigation principale -->
    <template #default="{ collapsed }">
      <div class="px-2">
        <UButton
          :label="collapsed ? undefined : 'Rechercher...'"
          icon="i-heroicons-magnifying-glass"
          color="neutral"
          variant="soft"
          block
          :square="collapsed"
          class="!bg-purple-50 dark:!bg-purple-950/30 hover:!bg-purple-100 dark:hover:!bg-purple-900/40 !text-purple-900 dark:!text-purple-100 !border !border-purple-200/50 dark:!border-purple-800/50 !rounded-xl transition-all duration-200"
        >
          <template v-if="!collapsed" #trailing>
            <UKbd
              value="⌘K"
              size="xs"
              class="!bg-purple-100 dark:!bg-purple-900/50 !text-purple-700 dark:!text-purple-300 !border-purple-300 dark:!border-purple-700"
            />
          </template>
        </UButton>
      </div>

      <div class="px-2 mt-2">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navItems[0]"
          orientation="vertical"
          :ui="{
            wrapper: 'space-y-1',
            item: {
              base: 'group relative transition-all duration-200 !rounded-xl overflow-hidden',
              padding: 'px-3 py-2.5',
              active:
                '!bg-gradient-to-r !from-purple-600 !to-indigo-600 !text-white !shadow-lg !shadow-purple-500/25 !font-semibold',
              inactive:
                '!text-gray-700 dark:!text-gray-300 hover:!bg-purple-50 dark:hover:!bg-purple-950/40 hover:!text-purple-700 dark:hover:!text-purple-300',
              icon: {
                base: 'w-5 h-5 flex-shrink-0',
                active: '!text-white',
                inactive:
                  '!text-gray-500 dark:!text-gray-400 group-hover:!text-purple-600 dark:group-hover:!text-purple-400',
              },
              label: { base: '!font-medium !text-sm truncate' },
              badge: {
                base: '!rounded-lg !px-2 !py-0.5 !text-xs !font-semibold',
                active: '!bg-white/20 !text-white',
                inactive:
                  '!bg-purple-100 dark:!bg-purple-900/50 !text-purple-700 dark:!text-purple-300',
              },
            },
          }"
        />
      </div>

      <div class="px-2 mt-auto">
        <div
          v-if="!collapsed"
          class="h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-800 to-transparent mb-4"
        />
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navItems[1]"
          orientation="vertical"
          :ui="{
            wrapper: 'space-y-1',
            item: {
              base: 'group relative transition-all duration-200 !rounded-xl',
              padding: 'px-3 py-2.5',
              active:
                '!bg-gradient-to-r !from-purple-600 !to-indigo-600 !text-white !shadow-lg !shadow-purple-500/25 !font-semibold',
              inactive:
                '!text-gray-600 dark:!text-gray-400 hover:!bg-purple-50 dark:hover:!bg-purple-950/40 hover:!text-purple-700 dark:hover:!text-purple-300',
              icon: {
                base: 'w-5 h-5 flex-shrink-0',
                active: '!text-white',
                inactive:
                  '!text-gray-500 dark:!text-gray-400 group-hover:!text-purple-600 dark:group-hover:!text-purple-400',
              },
              label: { base: '!font-medium !text-sm' },
            },
          }"
        />
      </div>
    </template>

    <!-- Footer avec infos utilisateur -->
    <template #footer="{ collapsed }">
      <UDropdownMenu :items="dropdownItems">
        <div
          class="px-2 py-4 border-t border-purple-100 dark:border-purple-900/30 bg-gradient-to-t from-purple-50/50 to-transparent dark:from-purple-950/20"
        >
          <UButton
            :avatar="{ src: userAvatar }"
            :label="collapsed ? undefined : userName"
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
          />
        </div>
      </UDropdownMenu>
    </template>
  </UDashboardSidebar>
</template>

<style scoped>
/* Styles personnalisés pour forcer les couleurs purple/indigo */
</style>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '../../../composables/useAuth'
import { useToast } from '#imports'
import { ref, computed } from 'vue'
import { navigateTo } from '#app'

const toast = useToast()
const { logout, session, role: userRole } = useAuth()

interface CustomEvent {
  id: number
  title: string
  category: string
  date: string
  location: string
  price: number | 'Free'
  duration: string
  description: string
  image: string | null
  organizer: {
    name: string
    contact: string
  }
  views: number
  createdAt: string
  updatedAt: string
  status: string
  role: 'admin' | 'organizer' | 'user'
}

const userName = computed(
  () => session.value?.user.name || session.value?.user.email || 'Utilisateur'
)
const userAvatar = computed(
  () => session.value?.user.image || 'https://github.com/benjamincanac.png'
)

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
      to: '/profile',
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

const navItems = computed<NavigationMenuItem[][]>(() => {
  const mainMenu: NavigationMenuItem[] = []

  // Événements disponible pour tous
  mainMenu.push({
    label: 'Événements',
    icon: 'i-heroicons-document-duplicate',
    to: '/dashboard/events',
    //badge: '123',
  })

  // Ajouter Analytique seulement si ce n'est pas un admin
  if (userRole.value !== 'admin') {
    mainMenu.push({
      label: 'Analytiques',
      icon: 'i-heroicons-document-duplicate',
      to: '/dashboard/analytic',
      //badge: '123',
    })
  }

  if (userRole.value === 'admin') {
    mainMenu.push(
      //{ label: "Vue d'ensemble", icon: 'i-heroicons-squares-2x2', to: '/dashboard' },
      {
        label: 'Categories',
        icon: 'i-heroicons-chart-bar',
        to: '/dashboard/categorie',
        //badge: '5',
      },
      {
        label: 'Organisateurs',
        icon: 'i-heroicons-chart-bar',
        to: '/dashboard/organizer',
        // badge: '5',
      },
      {
        label: 'Demandes',
        icon: 'i-heroicons-user-group',
        to: '/dashboard/demandes',
        //badge: '123',
      }
    )
  }

  const bottomMenu: NavigationMenuItem[] = [
    // { label: 'Paramètres', icon: 'i-heroicons-cog-8-tooth', to: '/dashboard/settings' },
    { label: 'Support', icon: 'i-heroicons-lifebuoy', to: '/contact' },
  ]

  return [mainMenu, bottomMenu]
})
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
    :ui="{
      root: 'border-r border-orange-100 dark:border-orange-900/30 bg-gradient-to-b from-white to-orange-50/30 dark:from-gray-950 dark:to-orange-950/20',
      body: 'gap-6 py-4 ',
    }"
  >
    <!-- Header -->
    <template #header="{ collapsed }">
      <div class="px-2 py-5">
        <div v-if="!collapsed" class="flex items-center gap-3">
          <NuxtLink to="/">
            <div>
              <h2
                class="font-bold text-2xl bg-gradient-to-r from-orange-600 to-indigo-600 bg-clip-text text-transparent"
              >
                WeLoveEvent
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Dashboard Admin</p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="flex justify-center">
          <div
            class="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
          >
            <span class="text-white font-bold text-sm relative z-10">LD</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Navigation principale -->
    <template #default="{ collapsed }">
      <div class="px-2">
       <!-- <UButton
          :label="collapsed ? undefined : 'Rechercher...'"
          icon="i-heroicons-magnifying-glass"
          color="neutral"
          variant="soft"
          block
          :square="collapsed"
          class="!bg-orange-50 dark:!bg-orange-950/30 hover:!bg-orange-100 dark:hover:!bg-orange-900/40 !text-orange-900 dark:!text-orange-100 !border !border-orange-200/50 dark:!border-orange-800/50 !rounded-xl transition-all duration-200"
        >
          <template v-if="!collapsed" #trailing>
            <UKbd
              value="⌘K"
              size="xs"
              class="!bg-orange-100 dark:!bg-orange-900/50 !text-orange-700 dark:!text-orange-300 !border-orange-300 dark:!border-orange-700"
            />
          </template>
        </UButton>-->
      </div>

      <div class="-mx-3 mt-2">
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
                '!bg-gradient-to-r !from-orange-600 !to-indigo-600 !text-white !shadow-lg !shadow-orange-500/25 !font-semibold',
              inactive:
                '!text-gray-700 dark:!text-gray-300 hover:!bg-orange-50 dark:hover:!bg-orange-950/40 hover:!text-orange-700 dark:hover:!text-orange-300',
              icon: {
                base: 'w-5 h-5 flex-shrink-0',
                active: '!text-white',
                inactive:
                  '!text-gray-500 dark:!text-gray-400 group-hover:!text-orange-600 dark:group-hover:!text-orange-400',
              },
              label: { base: '!font-medium !text-sm truncate' },
              badge: {
                base: '!rounded-lg !px-2 !py-0.5 !text-xs !font-semibold',
                active: '!bg-white/20 !text-white',
                inactive:
                  '!bg-orange-100 dark:!bg-orange-900/50 !text-orange-700 dark:!text-orange-300',
              },
            },
          }"
        />
      </div>

      <div class="px-2 mt-auto -mx-3">
        <div
          v-if="!collapsed"
          class="h-px bg-gradient-to-r from-transparent via-orange-300 dark:via-orange-800 to-transparent mb-4"
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
                '!bg-gradient-to-r !from-orange-600 !to-indigo-600 !text-white !shadow-lg !shadow-orange-500/25 !font-semibold',
              inactive:
                '!text-gray-600 dark:!text-gray-400 hover:!bg-orange-50 dark:hover:!bg-orange-950/40 hover:!text-orange-700 dark:hover:!text-orange-300',
              icon: {
                base: 'w-5 h-5 flex-shrink-0',
                active: '!text-white',
                inactive:
                  '!text-gray-500 dark:!text-gray-400 group-hover:!text-orange-600 dark:group-hover:!text-orange-400',
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
          class="-mx-3 px-2 py-4 border-t border-orange-100 dark:border-orange-900/30 bg-gradient-to-t from-orange-50/50 to-transparent dark:from-orange-950/20"
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
/* Styles personnalisés pour forcer les couleurs orange/indigo */
</style>

<script setup lang="ts">
import { ref, computed, onMounted, h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Category } from '../../../types/categorie'

const UCard = resolveComponent('UCard')
const USkeleton = resolveComponent('USkeleton')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')

// Type Catégorie
type Category = {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  color: string
  articlesCount: number
  status: 'Active' | 'Inactive'
  createdAt: string
  parentCategory?: string
}

// Données
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref('')

// L'URL de ton API interne Nuxt (par exemple server/api/categories.get.ts)
const fetchCategories = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<Category[]>('/api/categories') // ton endpoint Nuxt
    categories.value = data
  } catch (err: any) {
    console.error('Erreur API interne:', err)
    error.value = 'Impossible de récupérer les catégories.'
  } finally {
    loading.value = false
  }
}
// Appel au montage
onMounted(() => fetchCategories())

 // Fonction de suppression
const deleteCategory = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return

  loading.value = true
  try {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    // Retirer la catégorie du tableau local pour mise à jour instantanée
    categories.value = categories.value.filter(c => c.id !== id)
  } catch (err: any) {
    console.error('Erreur suppression:', err)
    alert('Impossible de supprimer la catégorie.')
  } finally {
    loading.value = false
  }
}


// Colonnes
const columns: TableColumn<Category>[] = [
  {
    accessorKey: 'name',
    header: 'Catégorie',
    cell: ({ row }) => {
      const name = row.getValue('name')
      const { icon, color, description } = row.original
      return h('div', { class: 'flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h('div', { 
          class: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm',
          style: { backgroundColor: color + '20' }
        }, [
          h(UIcon, { 
            name: icon, 
            class: 'w-6 h-6',
            style: { color: color }
          })
        ]),
        h('div', { class: 'flex flex-col flex-1' }, [
          h('span', { class: 'font-semibold text-gray-900 dark:text-gray-100' }, name),
          h('span', { class: 'text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs' }, description)
        ])
      ])
    }
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => {
      const slug = row.getValue('slug')
      return h('div', { class: 'flex items-center gap-2 px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h('code', { class: 'px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-indigo-400 rounded border border-gray-200 dark:border-gray-700' }, 
          '/' + slug
        )
      ])
    }
  },
  {
    accessorKey: 'articlesCount',
    header: 'Articles',
    cell: ({ row }) => {
      const count = row.getValue('articlesCount') || 0
      return h('div', { class: 'flex items-center gap-2 px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h('div', { 
          class: 'flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30'
        }, [
          h('span', { class: 'text-sm font-bold text-purple-700 dark:text-indigo-400' }, count)
        ])
      ])
    }
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status')
      const isActive = status === 'Active'
      return h('div', { class: 'flex items-center gap-2 px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h('div', { 
          class: `w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}` 
        }),
        h('span', { 
          class: `text-sm font-medium ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}` 
        }, isActive ? 'Active' : 'Inactive')
      ])
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Créée le',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return h('div', { class: 'flex flex-col px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h('span', { class: 'text-sm font-medium text-gray-700 dark:text-gray-300' }, 
          date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        ),
        h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, 
          date.toLocaleDateString('fr-FR', { year: 'numeric' })
        )
      ])
    }
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-1 px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h(UButton, { 
          icon: 'i-heroicons-eye',
          variant: 'ghost',
          color: 'gray',
          square: true,
          size: 'sm',
          class: '!text-blue-600 dark:!text-blue-400 hover:!bg-blue-100/50 dark:hover:!bg-blue-900/30',
          title: 'Voir les articles'
        }),
        h(UButton, { 
          icon: 'i-heroicons-pencil-square',
          variant: 'ghost',
          color: 'gray',
          square: true,
          size: 'sm',
          class: '!text-purple-600 dark:!text-indigo-400 hover:!bg-purple-100/50 dark:hover:!bg-indigo-900/30',
          title: 'Modifier'
        }),
        h(UButton, { 
          icon: 'i-heroicons-trash',
          variant: 'ghost',
          color: 'gray',
          square: true,
          size: 'sm',
          class: '!text-red-500 dark:!text-red-400 hover:!bg-red-100/50 dark:hover:!bg-red-900/30',
          title: 'Supprimer',
          onClick: () => deleteCategory(row.original.id)
        })
      ])
    }
  }
]

// Stats calculées
const stats = computed(() => [
  {
    label: 'Catégories actives',
    value: categories.value.filter(c => c.status === 'Active').length,
    icon: 'i-heroicons-check-circle',
    trend: '+2',
    trendUp: true
  },
  {
    label: 'Catégories inactives',
    value: categories.value.filter(c => c.status === 'Inactive').length,
    icon: 'i-heroicons-no-symbol',
    trend: '0',
    trendUp: false
  },
  {
    label: 'Total d\'articles',
    value: categories.value.reduce((sum, c) => sum + (c.articlesCount || 0), 0).toLocaleString(),
    icon: 'i-heroicons-document-text',
    trend: '+15%',
    trendUp: true
  },
  {
    label: 'Total catégories',
    value: categories.value.length,
    icon: 'i-heroicons-tag',
    trend: '+1',
    trendUp: true
  }
])
</script>

<template>
  <div class="space-y-6  overflow-y-auto">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        v-if="!loading"
        class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 p-6 hover:border-purple-300/60 dark:hover:border-indigo-700/60 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-indigo-50/50 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="relative flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ stat.value }}</p>
            <div class="flex items-center gap-1 mt-2">
              <UIcon 
                :name="stat.trendUp ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
                :class="stat.trendUp ? 'text-emerald-500' : 'text-amber-500'"
                class="w-4 h-4"
              />
              <span :class="stat.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'" class="text-sm font-semibold">{{ stat.trend }}</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <UIcon :name="stat.icon" class="w-6 h-6 text-purple-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      <!-- Skeleton Stats -->
      <div v-else v-for="i in 4" :key="'stat-skeleton-' + i" class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 p-6">
        <USkeleton class="h-4 w-24 mb-3 rounded" />
        <USkeleton class="h-8 w-16 mb-3 rounded" />
        <USkeleton class="h-4 w-16 rounded" />
      </div>
    </div>

    <!-- Table Card -->
    <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-gray-200/60 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 via-purple-50/30 to-indigo-50/50 dark:from-gray-900/50 dark:via-purple-950/20 dark:to-indigo-950/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <UIcon name="i-heroicons-tag" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Liste des catégories</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Gérez et organisez vos catégories d'articles</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-funnel"
              variant="ghost"
              color="gray"
              square
              class="!text-purple-600 dark:!text-indigo-400 hover:!bg-purple-100/50 dark:hover:!bg-indigo-900/30"
              title="Filtrer"
            />
            <UButton
              icon="i-heroicons-arrows-up-down"
              variant="ghost"
              color="gray"
              square
              class="!text-purple-600 dark:!text-indigo-400 hover:!bg-purple-100/50 dark:hover:!bg-indigo-900/30"
              title="Trier"
            />
            <UButton
              icon="i-heroicons-arrow-path"
              variant="ghost"
              color="gray"
              square
              class="!text-purple-600 dark:!text-indigo-400 hover:!bg-purple-100/50 dark:hover:!bg-indigo-900/30"
              title="Actualiser"
              @click="loading = true; setTimeout(() => loading = false, 1000)"
            />
          </div>
        </div>
      </div>

      <!-- Skeletons et Table -->
      <div class="p-6 max-h-[500px] overflow-y-auto">
        <template v-if="loading">
          <div v-for="i in 5" :key="'skeleton-' + i" class="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800/50">
            <USkeleton class="h-12 w-12 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-3/4 rounded" />
              <USkeleton class="h-3 w-1/2 rounded" />
            </div>
            <USkeleton class="h-8 w-20 rounded-full" />
            <USkeleton class="h-8 w-16 rounded" />
            <USkeleton class="h-8 w-24 rounded" />
          </div>
        </template>

        <template v-else>
          <UTable :data="categories" :columns="columns" class="min-w-full" />
        </template>
      </div>

      <!-- Footer avec pagination (optionnel) -->
      <div v-if="!loading && categories.length > 0" class="px-6 py-4 border-t border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 ">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Affichage de <span class="font-semibold text-gray-900 dark:text-gray-100">{{ categories.length }}</span> catégories
          </p>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-chevron-left"
              variant="ghost"
              color="gray"
              size="sm"
              disabled
            />
            <div class="flex items-center gap-1">
              <UButton variant="solid" color="primary" size="sm">1</UButton>
              <UButton variant="ghost" color="gray" size="sm">2</UButton>
              <UButton variant="ghost" color="gray" size="sm">3</UButton>
            </div>
            <UButton
              icon="i-heroicons-chevron-right"
              variant="ghost"
              color="gray"
              size="sm"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && categories.length === 0" class="p-12 text-center">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
          <UIcon name="i-heroicons-tag" class="w-10 h-10 text-purple-600 dark:text-indigo-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucune catégorie</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Créez votre première catégorie pour commencer à organiser vos articles</p>
        <UButton color="primary" icon="i-heroicons-plus">
          Créer une catégorie
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar personnalisée */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, rgb(147, 51, 234), rgb(79, 70, 229));
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, rgb(168, 85, 247), rgb(99, 102, 241));
}

/* Animation pour le pulse du statut actif */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
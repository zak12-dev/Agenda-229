<script setup lang="ts">
import { ref, computed, onMounted, h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Post } from '../../../types/post'
const UTable = resolveComponent('UTable')



const UCard = resolveComponent('UCard')
const USkeleton = resolveComponent('USkeleton')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')

// Type Article
type Article = {
  id: number
  title: string
  status: 'Publié' | 'Brouillon'
  date: string
  views?: number
  category?: string
}

// Données
const articles = ref<Article[]>([])
const loading = ref(true)


const error = ref('')

const fetchPosts = async () => {
  loading.value = true
  error.value = ''
  try {
    // Récupération via $fetch côté Nuxt 3
    const data = await $fetch<Post[]>('/api/posts')

    // Transformation pour correspondre à ton type Article
    articles.value = data.map(post => ({
      id: post.id,
      title: post.title,
      category: post.subCategory || 'Sans catégorie',
      date: post.createdAt, // Prisma renvoie camelCase
      status: 'Publié',
      views: 0
    }))
  } catch (err: any) {
    console.error('Erreur API interne:', err)
    error.value = 'Impossible de récupérer les articles.'
    articles.value = []
  } finally {
    loading.value = false
  }
}

// Appel initial
fetchPosts()
// Fonction pour supprimer un article
async function deleteArticle(id: number) {
  try {
    const confirmed = confirm('Voulez-vous vraiment supprimer cet article ?')
    if (!confirmed) return

    const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Erreur lors de la suppression de l’article')

    // Retirer l’article de la liste locale
    articles.value = articles.value.filter(a => a.id !== id)
    alert('Article supprimé avec succès ✅')
  } catch (error) {
    console.error(error)
    alert('Impossible de supprimer l’article ❌')
  }
}

// Fonction pour modifier un article
// ✅ Variables pour contrôler le modal et l'article à éditer
const isModalOpen = ref(false)         // pour ouvrir/fermer le modal
const articleToEdit = ref<Post | null>(null) // pour passer l'article à éditer

// Exemple de fonction pour ouvrir le modal en mode édition
const editArticle = (article: Post) => {
  articleToEdit.value = article
  isModalOpen.value = true
}


// Colonnes
const columns: TableColumn<Article>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => {
      const title = row.getValue('title')
      return h('div', { class: 'flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h('div', { class: 'w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center' }, [
          h(UIcon, { name: 'i-heroicons-document-text', class: 'w-5 h-5 text-purple-600 dark:text-indigo-400' })
        ]),
        h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'font-semibold text-gray-900 dark:text-gray-100' }, title),
          h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, row.original.category)
        ])
      ])
    }
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status')
      const isPublished = status === 'Publié'
      return h('div', { class: 'flex items-center gap-2 px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h('div', { 
          class: `w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}` 
        }),
        h('span', { 
          class: `text-sm font-medium ${isPublished ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}` 
        }, status)
      ])
    }
  },
  {
    accessorKey: 'views',
    header: 'Vues',
    cell: ({ row }) => {
      const views = row.getValue('views') || 0
      return h('div', { class: 'flex items-center gap-2 text-gray-600 dark:text-gray-400 px-4 py-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-transparent hover:to-indigo-50/30 dark:hover:from-purple-950/10 dark:hover:via-transparent dark:hover:to-indigo-950/10 transition-all duration-200' }, [
        h(UIcon, { name: 'i-heroicons-eye', class: 'w-4 h-4' }),
        h('span', { class: 'text-sm font-medium' }, views.toLocaleString())
      ])
    }
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'))
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
    const article = row.original
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
        onClick: () => {
          articleToEdit.value = article
          isModalOpen.value = true
}
      }),
      h(UButton, { 
        icon: 'i-heroicons-trash',
        variant: 'ghost',
        color: 'gray',
        square: true,
        size: 'sm',
        class: '!text-red-500 dark:!text-red-400 hover:!bg-red-100/50 dark:hover:!bg-red-900/30',
        onClick: () => deleteArticle(article.id)
      })
    ])
  }
},

]
// Stats calculées
const stats = computed(() => [
  {
    label: 'Evenements publiés',
    value: articles.value.filter(a => a.status === 'Publié').length,
    icon: 'i-heroicons-check-circle',
    trend: '+12%',
    trendUp: true
  },
  {
    label: 'Brouillons',
    value: articles.value.filter(a => a.status === 'Brouillon').length,
    icon: 'i-heroicons-document-text',
    trend: '-3%',
    trendUp: false
  },
  {
    label: 'Vues totales',
    value: articles.value.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString(),
    icon: 'i-heroicons-eye',
    trend: '+24%',
    trendUp: true
  },
  {
    label: 'Total',
    value: articles.value.length,
    icon: 'i-heroicons-squares-2x2',
    trend: '+2',
    trendUp: true
  }
])
</script>

<template>
  <div class="space-y-6 max-h-[500px] overflow-y-auto">
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
<div>
    <!-- Table Card -->
    <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Liste des evenements</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Gérez et organisez vos evenements</p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-funnel"
              variant="ghost"
              color="gray"
              square
              
              class="!text-purple-600 dark:!text-indigo-400 hover:!bg-purple-100/50 dark:hover:!bg-indigo-900/30"
            />
            <UButton
              icon="i-heroicons-arrows-up-down"
              variant="ghost"
              color="gray"
              square
              
              class="!text-purple-600 dark:!text-indigo-400 hover:!bg-purple-100/50 dark:hover:!bg-indigo-900/30"
            />
             <UButton
              icon="i-heroicons-arrow-path"
              variant="ghost"
              color="gray"
              square
              class="!text-purple-600 dark:!text-indigo-400 hover:!bg-purple-100/50 dark:hover:!bg-indigo-900/30"
              title="Actualiser"
              @click="fetchPosts"
            />
          </div>
        </div>
      </div>

      <!-- Skeletons et Table corrigés -->
<div class="p-6 max-h-[500px] overflow-y-auto">
  <template v-if="loading">
    <div v-for="i in 5" :key="'skeleton-' + i" class="flex items-center gap-4 mb-4">
      <USkeleton class="h-10 w-10 rounded-lg" />
      <div class="flex-1 space-y-2">
        <USkeleton class="h-4 w-3/4 rounded" />
        <USkeleton class="h-3 w-1/2 rounded" />
      </div>
      <USkeleton class="h-8 w-20 rounded-full" />
      <USkeleton class="h-8 w-16 rounded" />
    </div>
  </template>

  <template v-else>
    <UTable :data="articles" :columns="columns" class="min-w-full " />
  </template>
</div>
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

</style>
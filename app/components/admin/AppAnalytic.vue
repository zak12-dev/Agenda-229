<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Event {
  id: number
  title: string
  description: string
eventDate: string
  location: string
  price: number
views: number
  status: string
  createdAt: string
  updatedAt: string
  userId: number
  categoryId: number
  villeId: number
  ville: {
    id: number
    name: string
  }
  category: {
    id: number
    name: string
  }
  user: {
    id: number
    name: string
    email: string
    image: string | null
  }
}

interface OrganizerCount {
  organizerId: string
  count: number
  period: {
    start: string
    end: string
  }
}

const events = ref<Event[]>([])
const loading = ref(true)
const selectedView = ref< 'events'>('events')
const currentUserId = ref<string | null>(null)
const organizerEventCount = ref<OrganizerCount | null>(null)
const dateRange = ref({
  startDate: '',
  endDate: ''
})

const fetchCurrentUser = async () => {
  try {
    const data = await $fetch('/api/me')
    currentUserId.value = data.user?.id || null
  } catch (err) {
    console.error('Erreur récupération utilisateur:', err)
  }
}

const fetchEvents = async () => {
  loading.value = true
  try {
    const data = await $fetch<Event[]>('/api/events')
  
    events.value = data
  } catch (err) {
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

const fetchOrganizerCount = async () => {
  if (!currentUserId.value) return
  
  try {
    const params: any = {}
    if (dateRange.value.startDate) params.startDate = dateRange.value.startDate
    if (dateRange.value.endDate) params.endDate = dateRange.value.endDate

    const data = await $fetch<OrganizerCount>(`/api/events/count/${currentUserId.value}`, {
      query: params
    })
    organizerEventCount.value = data
  } catch (err) {
    console.error('Erreur comptage:', err)
  }
}

const applyDateFilter = async () => {
  await fetchOrganizerCount()
}

const resetDateFilter = async () => {
  dateRange.value.startDate = ''
  dateRange.value.endDate = ''
  await fetchOrganizerCount()
}

// Métriques calculées
const metrics = computed(() => {
  const total = events.value.length
  const actifs = events.value.filter(e => e.status === 'published' || e.status === 'active').length
  const termines = events.value.filter(e => e.status === 'completed' || e.status === 'past').length
  const brouillons = events.value.filter(e => e.status === 'draft').length
  const totalviews = events.value.reduce((sum, e) => sum + (e.views || 0), 0)
  
  return {
    totalEvents: total,
    activeEvents: actifs,
    completedEvents: termines,
    draftEvents: brouillons,
    totalviews,
    avgviewPerEvent: total > 0 ? Math.round(totalviews/ total) : 0,
  }
})

// Événements récents (5 derniers)
const recentEvents = computed(() => {
  return [...events.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(event => ({
      id: event.id,
      name: event.title,
      date: formatDate(event.date),
      category: event.category.name,
      location: event.ville.name,
      maxAttendees: event.views,
      status: getStatusLabel(event.status),
      statusColor: getStatusColor(event.status)
    }))
})

// Événements par catégorie
const eventsByCategory = computed(() => {
  const categories = new Map<string, number>()
  
  events.value.forEach(event => {
    const catName = event.category.name
    categories.set(catName, (categories.get(catName) || 0) + 1)
  })
  
  return Array.from(categories.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// Événements par ville
const eventsByCity = computed(() => {
  const cities = new Map<string, number>()
  
  events.value.forEach(event => {
    const cityName = event.ville.name
    cities.set(cityName, (cities.get(cityName) || 0) + 1)
  })
  
  return Array.from(cities.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// Événements par période (derniers 7 jours)
const eventsByPeriod = computed(() => {
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  return {
    last7Days: events.value.filter(e => new Date(e.createdAt) >= last7Days).length,
    last30Days: events.value.filter(e => new Date(e.createdAt) >= last30Days).length,
    last90Days: events.value.filter(e => new Date(e.createdAt) >= last90Days).length
  }
})

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'published': 'Publié',
    'active': 'Actif',
    'draft': 'Brouillon',
    'completed': 'Terminé',
    'past': 'Passé',
    'cancelled': 'Annulé'
  }
  return labels[status] || status
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'published': 'bg-green-500',
    'active': 'bg-green-500',
    'draft': 'bg-amber-500',
    'completed': 'bg-gray-500',
    'past': 'bg-gray-500',
    'cancelled': 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}



const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num)
const formatCurrency = (num: number) => new Intl.NumberFormat('fr-FR', { 
  style: 'currency', 
  currency: 'XOF', 
  minimumFractionDigits: 0 
}).format(num)

onMounted(async () => {
  await fetchCurrentUser()
  await fetchEvents()
  await fetchOrganizerCount()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 -mt-2 overflow-auto h-[100px]">
    <div class="max-w-7xl mx-auto space-y-6 ">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mt-1">Vue d'ensemble de vos événements</p>
        </div>

        <!--  <div class="flex bg-white rounded-lg border border-gray-200 p-1">
          <button
            @click="selectedView = 'overview'"
            :class="[
              'px-4 py-2 rounded text-sm font-medium transition-all',
              selectedView === 'overview' ? 'bg-gray-900 text-white' : 'text-gray-600'
            ]"
          >
            Vue d'ensemble
          </button>
          <button
            @click="selectedView = 'events'"
            :class="[
              'px-4 py-2 rounded text-sm font-medium transition-all',
              selectedView === 'events' ? 'bg-gray-900 text-white' : 'text-gray-600'
            ]"
          >
            Événements
          </button>
        </div>-->
      </div>

      <!-- Date Range Filter 
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Filtrer par période</label>
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="flex-1">
                <label class="block text-xs text-gray-600 mb-1">Date début</label>
                <input
                  v-model="dateRange.startDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div class="flex-1">
                <label class="block text-xs text-gray-600 mb-1">Date fin</label>
                <input
                  v-model="dateRange.endDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="applyDateFilter"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all"
            >
              Appliquer
            </button>
            <button
              @click="resetDateFilter"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
            >
              Réinitialiser
            </button>
          </div>
        </div>-->

        <!-- Period Info
        <div v-if="organizerEventCount" class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-orange-600" />
              <span class="text-sm text-gray-600">Période:</span>
              <span class="text-sm font-semibold text-gray-900">
                {{ organizerEventCount.period.start }} - {{ organizerEventCount.period.end }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-blue-600" />
              <span class="text-sm text-gray-600">Événements dans cette période:</span>
              <span class="text-sm font-bold text-blue-600">{{ organizerEventCount.count }}</span>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-600">Total événements</p>
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-orange-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ metrics.totalEvents }}</p>
          <div class="flex items-center gap-4 mt-2 text-xs">
            <span class="text-green-600">{{ metrics.activeEvents }} actifs</span>
            <span class="text-gray-500">{{ metrics.completedEvents }} terminés</span>
          </div>
        </div>

       <!-- <div class="bg-white rounded-lg border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-600">Brouillons</p>
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-amber-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ metrics.draftEvents }}</p>
          <p class="text-xs text-gray-500 mt-2">En attente de publication</p>
        </div> -->

        <div class="bg-white rounded-lg border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-600">Nombres de vues </p>
            <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-blue-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatNumber(metrics.totalviews) }}</p>
          <p class="text-xs text-gray-500 mt-2">Moy: {{ metrics.avgviewPerEvent }}/événement</p>
        </div>

       
      </div>

      <!-- Activity by Period -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="font-bold text-gray-900 mb-4">Activité par période</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="border-l-4 border-blue-600 pl-4">
            <p class="text-sm text-gray-600 mb-1">7 derniers jours</p>
            <p class="text-2xl font-bold text-gray-900">{{ eventsByPeriod.last7Days }}</p>
          </div>
          <div class="border-l-4 border-orange-600 pl-4">
            <p class="text-sm text-gray-600 mb-1">30 derniers jours</p>
            <p class="text-2xl font-bold text-gray-900">{{ eventsByPeriod.last30Days }}</p>
          </div>
          <div class="border-l-4 border-indigo-600 pl-4">
            <p class="text-sm text-gray-600 mb-1">90 derniers jours</p>
            <p class="text-2xl font-bold text-gray-900">{{ eventsByPeriod.last90Days }}</p>
          </div>
        </div>
      </div>

      <!-- Overview Tab -->
      <!--div v-if="selectedView === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">-->
        
        <!-- Événements par catégorie 
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Événements par catégorie</h3>
          <div class="space-y-3">
            <div v-if="!loading" v-for="cat in eventsByCategory" :key="cat.name" class="flex items-center justify-between">
              <div class="flex items-center gap-3 flex-1">
                <div class="w-2 h-2 bg-orange-600 rounded-full"></div>
                <span class="text-sm text-gray-700">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                  <div 
                    class="h-full bg-orange-600 rounded-full"
                    :style="{ width: `${(cat.count / metrics.totalEvents) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-semibold text-gray-900 w-8 text-right">{{ cat.count }}</span>
              </div>
            </div>

            <div v-if="loading" v-for="i in 5" :key="i" class="flex items-center justify-between">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-4 w-16" />
            </div>

            <div v-if="!loading && eventsByCategory.length === 0" class="text-center py-8 text-gray-500 text-sm">
              Aucune donnée disponible
            </div>
          </div>
        </div>-->

        <!-- Événements par ville 
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Événements par ville</h3>
          <div class="space-y-3">
            <div v-if="!loading" v-for="city in eventsByCity" :key="city.name" class="flex items-center justify-between">
              <div class="flex items-center gap-3 flex-1">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span class="text-sm text-gray-700">{{ city.name }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                  <div 
                    class="h-full bg-blue-600 rounded-full"
                    :style="{ width: `${(city.count / metrics.totalEvents) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-semibold text-gray-900 w-8 text-right">{{ city.count }}</span>
              </div>
            </div>

            <div v-if="loading" v-for="i in 5" :key="i" class="flex items-center justify-between">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-4 w-16" />
            </div>

            <div v-if="!loading && eventsByCity.length === 0" class="text-center py-8 text-gray-500 text-sm">
              Aucune donnée disponible
            </div>
          </div>
        </div>-->

     <!-- </div>-->

      <!-- Events Tab -->
      <div v-if="selectedView === 'events'" class="bg-white rounded-lg border border-gray-200 overflow-y-auto ">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="font-bold text-gray-900">Tous les événements</h2>
        </div>

        <div class="overflow-x-auto max-h-[500px]">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Événement</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Catégorie</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ville</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Vues</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="!loading" v-for="event in events" :key="event.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <p class="font-semibold text-gray-900">{{ event.title }}</p>
                  <p class="text-xs text-gray-500 line-clamp-1">{{ event.description }}</p>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-700">{{ event.category.name }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-700">{{ event.ville.name }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-sm font-semibold text-gray-900">{{ event.views }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                    <div :class="['w-1.5 h-1.5 rounded-full', getStatusColor(event.status)]"></div>
                    {{ getStatusLabel(event.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-700">{{ formatDate(event.eventDate) }}
</span>
                </td>
              </tr>

              <tr v-if="loading" v-for="i in 5" :key="i">
                <td class="px-6 py-4"><USkeleton class="h-4 w-48" /></td>
                <td class="px-6 py-4"><USkeleton class="h-4 w-24" /></td>
                <td class="px-6 py-4"><USkeleton class="h-4 w-24" /></td>
                <td class="px-6 py-4"><USkeleton class="h-4 w-16 mx-auto" /></td>
                <td class="px-6 py-4"><USkeleton class="h-6 w-20 mx-auto rounded-full" /></td>
                <td class="px-6 py-4"><USkeleton class="h-4 w-20" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!loading && events.length === 0" class="p-12 text-center">
          <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-600">Aucun événement</p>
        </div>
      </div>

      <!-- Recent Events 
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="font-bold text-gray-900">Événements récents</h2>
        </div>

        <div class="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
          <div v-if="!loading" v-for="event in recentEvents" :key="event.id" class="px-6 py-4 hover:bg-gray-50 transition-all">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div :class="['w-2 h-2 rounded-full', event.statusColor]"></div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ event.name }}</h3>
                  <p class="text-sm text-gray-600">{{ event.category }} • {{ event.location }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ formatNumber(event.views) }}</p>
                <p class="text-sm text-gray-500">max vues</p>
              </div>
            </div>
          </div>

          <div v-if="loading" v-for="i in 3" :key="i" class="px-6 py-4">
            <div class="flex items-center gap-4">
              <USkeleton class="h-2 w-2 rounded-full" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-1/3" />
                <USkeleton class="h-3 w-1/4" />
              </div>
            </div>
          </div>

          <div v-if="!loading && recentEvents.length === 0" class="px-6 py-8 text-center text-gray-500 text-sm">
            Aucun événement récent
          </div>
        </div>
      </div>-->

    </div>
  </div>
</template>
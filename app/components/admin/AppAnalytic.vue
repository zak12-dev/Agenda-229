<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const selectedView = ref<'overview' | 'events'>('overview')

const metrics = ref({
  totalEvents: 12,
  activeEvents: 8,
  completedEvents: 4,
  totalViews: 3450,
  totalPartage: 892,
  avgParticipantsPerEvent: 74,
  revenue: 45680,
  avgRevenuePerEvent: 3807
})

const recentEvents = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  recentEvents.value = [
    { id: 1, name: 'Concert Jazz', date: '2026-02-10', participants: 340, status: 'Actif' },
    { id: 2, name: 'Festival Afrobeat', date: '2026-02-15', participants: 280, status: 'Actif' },
    { id: 3, name: 'Expo Art Moderne', date: '2026-01-28', participants: 180, status: 'Terminé' }
  ]
  
  loading.value = false
}

onMounted(fetchData)

const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num)
const formatCurrency = (num: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(num)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 -mt-2 overflow-auto">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p class="text-sm text-gray-600 mt-1">Dernière mise à jour: Il y a 5 min</p>
        </div>

        <div class="flex bg-white rounded-lg border border-gray-200 p-1">
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
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4  ">
        <div class="bg-white rounded-lg border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-600">Total événements</p>
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-purple-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ metrics.totalEvents }}</p>
          <div class="flex items-center gap-4 mt-2 text-xs">
            <span class="text-green-600">{{ metrics.activeEvents }} actifs</span>
            <span class="text-gray-500">{{ metrics.completedEvents }} terminés</span>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-600">Vues</p>
            <UIcon name="i-heroicons-eye" class="w-5 h-5 text-blue-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatNumber(metrics.totalViews) }}</p>
          <p class="text-xs text-gray-500 mt-2">Total des vues</p>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-600">Partages</p>
            <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-green-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatNumber(metrics.totalPartage) }}</p>
          <p class="text-xs text-gray-500 mt-2">Moy: {{ metrics.avgParticipantsPerEvent }}/événement</p>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-600">Revenus</p>
            <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-amber-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(metrics.revenue) }}</p>
          <p class="text-xs text-gray-500 mt-2">Moy: {{ formatCurrency(metrics.avgRevenuePerEvent) }}/événement</p>
        </div>
      </div>

      <!-- Recent Events -->
      <div class="bg-white rounded-lg border border-gray-200 h-[200px] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="font-bold text-gray-900">Événements récents</h2>
        </div>

        <div class="divide-y divide-gray-200">
          <div v-if="!loading" v-for="event in recentEvents" :key="event.id" class="px-6 py-4 hover:bg-gray-50 transition-all">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-2 h-2 rounded-full" :class="event.status === 'Actif' ? 'bg-green-500' : 'bg-gray-400'"></div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ event.name }}</h3>
                  <p class="text-sm text-gray-600">{{ event.date }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ formatNumber(event.participants) }}</p>
                <p class="text-sm text-gray-500">participants</p>
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
        </div>
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface OrganizerRequest {
  id: number
  userId: number
  status: string
  createdAt: string
  updatedAt: string
}

const requests = ref<OrganizerRequest[]>([])
const loading = ref(true)
const filterStatus = ref<string>('all')

const fetchRequests = async () => {
  loading.value = true
  try {
    const data = await $fetch<OrganizerRequest[]>('/api/organizer/request')
    console.log('DATA', data)
    requests.value = data
    
  } catch (err) {
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, any> = {
    pending: {
      label: 'En attente',
      icon: 'i-heroicons-clock',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-500'
    },
    approved: {
      label: 'Approuvée',
      icon: 'i-heroicons-check-circle',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      dotColor: 'bg-green-500'
    },
    rejected: {
      label: 'Rejetée',
      icon: 'i-heroicons-x-circle',
      gradient: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500'
    }
  }
  return configs[status] || configs.pending
}

const filteredRequests = computed(() => {
  if (filterStatus.value === 'all') return requests.value
  return requests.value.filter(r => r.status === filterStatus.value)
})

const stats = computed(() => ({
  total: requests.value.length,
  pending: requests.value.filter(r => r.status === 'pending').length,
  approved: requests.value.filter(r => r.status === 'approved').length,
  rejected: requests.value.filter(r => r.status === 'rejected').length
}))

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(fetchRequests)
</script>

<template>
  <div class="min-h-screen bg-white p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Mes demandes</h1>
        <p class="text-gray-600">{{ requests.length }} demande(s) au total</p>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          @click="filterStatus = 'all'"
          :class="[
            'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
            filterStatus === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Toutes ({{ stats.total }})
        </button>
        <button
          @click="filterStatus = 'pending'"
          :class="[
            'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
            filterStatus === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          ]"
        >
          En attente ({{ stats.pending }})
        </button>
        <button
          @click="filterStatus = 'approved'"
          :class="[
            'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
            filterStatus === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          ]"
        >
          Approuvées ({{ stats.approved }})
        </button>
        <button
          @click="filterStatus = 'rejected'"
          :class="[
            'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
            filterStatus === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          ]"
        >
          Rejetées ({{ stats.rejected }})
        </button>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Loading -->
        <div v-if="loading" v-for="i in 6" :key="i" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <USkeleton class="h-32 w-full" />
          <div class="p-6">
            <USkeleton class="h-6 w-3/4 mb-4" />
            <USkeleton class="h-4 w-full mb-2" />
            <USkeleton class="h-4 w-2/3" />
          </div>
        </div>

        <!-- Cards -->
        <div
          v-else
          v-for="request in filteredRequests"
          :key="request.id"
          class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
        >
          <!-- Header gradient -->
          <div :class="['h-32 bg-gradient-to-br relative', getStatusConfig(request.status).gradient]">
            <div class="absolute inset-0 bg-black/10"></div>
            <div class="absolute top-4 right-4">
              <div :class="['w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center']">
                <UIcon :name="getStatusConfig(request.status).icon" class="w-6 h-6 text-white" />
              </div>
            </div>
            <div class="absolute bottom-4 left-4 text-white">
              <p class="text-xs opacity-80">Demande</p>
              <p class="text-lg font-bold">#{{ request.id }}</p>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <span 
                :class="[
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold',
                  getStatusConfig(request.status).bgColor,
                  getStatusConfig(request.status).textColor
                ]"
              >
                <div :class="['w-2 h-2 rounded-full animate-pulse', getStatusConfig(request.status).dotColor]"></div>
                {{ getStatusConfig(request.status).label }}
              </span>
            </div>

            <div class="space-y-3 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                <span>{{ formatDate(request.createdAt) }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                <span>Mis à jour le {{ formatDate(request.updatedAt) }}</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-100">
              <button class="w-full py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                Voir les détails
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredRequests.length === 0" class="text-center py-16">
        <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune demande</h3>
        <p class="text-gray-600">{{ filterStatus === 'all' ? 'Vous n\'avez pas encore de demande' : 'Aucune demande avec ce statut' }}</p>
      </div>

    </div>
  </div>
</template>
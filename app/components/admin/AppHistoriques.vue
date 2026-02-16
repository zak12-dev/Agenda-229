<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface OrganizerRequest {
  id: number
  userId: number
  status: string
  createdAt: string
  updatedAt: string
  reviewedAt: string | null
  reviewerId: number | null
  user: {
    id: number
    name: string
    email: string
    image: string | null
    roleId: number
    organizerStatus: string | null
  }
  reviewer: {
    id: number
    name: string
    email: string
  } | null
}

const requests = ref<OrganizerRequest[]>([])
const loading = ref(true)
const filterStatus = ref<string>('all')
const searchQuery = ref('')

const fetchRequests = async () => {
  loading.value = true
  try {
    const data = await $fetch<OrganizerRequest[]>('/api/admin/organizer/all-requests')
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
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300'
    },
    approved: {
      label: 'Approuvée',
      icon: 'i-heroicons-check-circle',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300'
    },
    rejected: {
      label: 'Rejetée',
      icon: 'i-heroicons-x-circle',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300'
    }
  }
  return configs[status] || configs.pending
}

const filteredRequests = computed(() => {
  let result = [...requests.value]
  
  // Filter by status
  if (filterStatus.value !== 'all') {
    result = result.filter(r => r.status === filterStatus.value)
  }
  
  // Search
  if (searchQuery.value) {
    result = result.filter(r =>
      r.user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return result
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchRequests)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-600">Total</p>
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-purple-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-600">En attente</p>
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-amber-600" />
          </div>
          <p class="text-2xl font-bold text-amber-600">{{ stats.pending }}</p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-600">Approuvées</p>
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
          </div>
          <p class="text-2xl font-bold text-green-600">{{ stats.approved }}</p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-600">Rejetées</p>
            <UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-red-600" />
          </div>
          <p class="text-2xl font-bold text-red-600">{{ stats.rejected }}</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <UIcon name="i-heroicons-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom ou email..."
            class="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <!-- Filters -->
        <div class="flex gap-2 overflow-x-auto">
          <button
            @click="filterStatus = 'all'"
            :class="[
              'px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
              filterStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
            ]"
          >
            Toutes
          </button>
          <button
            @click="filterStatus = 'pending'"
            :class="[
              'px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
              filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300'
            ]"
          >
            En attente
          </button>
          <button
            @click="filterStatus = 'approved'"
            :class="[
              'px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
              filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
            ]"
          >
            Approuvées
          </button>
          <button
            @click="filterStatus = 'rejected'"
            :class="[
              'px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
              filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300'
            ]"
          >
            Rejetées
          </button>
        </div>
      </div>

      <!-- Results count -->
      <div v-if="searchQuery || filterStatus !== 'all'" class="text-sm text-gray-600">
        <span class="font-semibold text-gray-900">{{ filteredRequests.length }}</span> 
        résultat{{ filteredRequests.length > 1 ? 's' : '' }} trouvé{{ filteredRequests.length > 1 ? 's' : '' }}
      </div>

      <!-- Cards List -->
      <div class="space-y-4">
        <!-- Loading -->
        <div v-if="loading" v-for="i in 5" :key="i" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-start gap-4">
            <USkeleton class="h-12 w-12 rounded-full" />
            <div class="flex-1 space-y-3">
              <USkeleton class="h-5 w-1/3" />
              <USkeleton class="h-4 w-2/3" />
              <USkeleton class="h-4 w-1/2" />
            </div>
          </div>
        </div>

        <!-- Cards -->
        <div
          v-else
          v-for="request in filteredRequests"
          :key="request.id"
          class="bg-white rounded-xl border-2 hover:shadow-lg transition-all"
          :class="getStatusConfig(request.status).borderColor"
        >
          <div class="p-6">
            <div class="flex items-start justify-between gap-4 mb-4">
              <!-- User Info -->
              <div class="flex items-start gap-4 flex-1">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  <template v-if="request.user.image">
                    <img :src="request.user.image" :alt="request.user.name" class="w-full h-full rounded-full object-cover" />
                  </template>
                  <template v-else>
                    {{ request.user.name.charAt(0).toUpperCase() }}
                  </template>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 mb-1">{{ request.user.name }}</h3>
                  <p class="text-sm text-gray-600 mb-2">{{ request.user.email }}</p>
                </div>
              </div>

              <!-- Status Badge -->
              <span 
                :class="[
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0',
                  getStatusConfig(request.status).bgColor,
                  getStatusConfig(request.status).textColor
                ]"
              >
                <UIcon :name="getStatusConfig(request.status).icon" class="w-4 h-4" />
                {{ getStatusConfig(request.status).label }}
              </span>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                <div>
                  <p class="text-xs text-gray-500">Créée le</p>
                  <p class="font-medium text-gray-900">{{ formatDate(request.createdAt) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 text-sm text-gray-600">
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                <div>
                  <p class="text-xs text-gray-500">Mise à jour</p>
                  <p class="font-medium text-gray-900">{{ formatDate(request.updatedAt) }}</p>
                </div>
              </div>

              <div v-if="request.reviewedAt" class="flex items-center gap-2 text-sm text-gray-600">
                <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
                <div>
                  <p class="text-xs text-gray-500">Examinée le</p>
                  <p class="font-medium text-gray-900">{{ formatDate(request.reviewedAt) }}</p>
                </div>
              </div>
            </div>

            <!-- Reviewer Info -->
            <div v-if="request.reviewer" class="pt-4 border-t border-gray-200">
              <div class="flex items-center gap-2 text-sm">
                <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">Examinée par:</span>
                <span class="font-semibold text-gray-900">{{ request.reviewer.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && filteredRequests.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
          <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
          <p class="text-gray-600 mb-4">Aucune demande ne correspond à vos critères</p>
          <button
            @click="searchQuery = ''; filterStatus = 'all'"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
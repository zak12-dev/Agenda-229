<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '#imports'
import { stat } from 'node:fs'

definePageMeta({
  layout: 'dashboard' as const,
})

const toast = useToast()
const router = useRouter()

type RequestStatus = 'pending' | 'approved' | 'rejected'

interface OrganizerRequest {
  id: string
  name: string
  email: string
  organization: string
  phone?: string
  website?: string
  description?: string
  status: RequestStatus
  createdAt: string
}

const requests = ref<OrganizerRequest[]>([])
const loading = ref(true)
const search = ref('')
const filterStatus = ref<RequestStatus | 'all'>('all')
const selectedRequest = ref<OrganizerRequest | null>(null)
const showModal = ref(false)

const fetchRequests = async () => {
  loading.value = true

  try {
    // Appel à l'API pour récupérer les demandes
    const data: OrganizerRequest[] = await $fetch('/api/admin/organizers') // GET par défaut
    requests.value = data
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error?.message || 'Impossible de récupérer les demandes.',
      color: 'red',
      duration: 5000,
    })
    requests.value = [] // vide si erreur
  } finally {
    loading.value = false
  }
}


onMounted(fetchRequests)

const filteredRequests = computed(() => {
  return requests.value.filter(r => {
    const matchSearch =
      r.name.toLowerCase().includes(search.value.toLowerCase()) ||
      r.email.toLowerCase().includes(search.value.toLowerCase()) ||
      r.organization.toLowerCase().includes(search.value.toLowerCase())

    const matchStatus =
      filterStatus.value === 'all' || r.status === filterStatus.value

    return matchSearch && matchStatus
  })
})

const stats = computed(() => ({
  total: requests.value.length,
  pending: requests.value.filter(r => r.status === 'pending').length,
  approved: requests.value.filter(r => r.status === 'approved').length,
  rejected: requests.value.filter(r => r.status === 'rejected').length
}))

const openDetails = (request: OrganizerRequest) => {
  selectedRequest.value = request
  showModal.value = true
}

const approveRequest = async (id: string) => {
  try {
    const res = await $fetch('/api/admin/organizer/validate', {
      method: 'POST',
      body: { userId: id, action: 'approve' }
    })
    const req = requests.value.find(r => r.id === id)
    if (req) req.status = 'approved'
    toast.add({ title: 'Succès', description: `${req?.name} est maintenant organisateur`, color: 'green' })
    showModal.value = false
  } catch (error: any) {
    toast.add({ title: 'Erreur', description: error?.statusMessage || 'Impossible de valider la demande', color: 'red' })
  }
}

const rejectRequest = async (id: string) => {
  try {
    const res = await $fetch('/api/admin/organizer/validate', {
      method: 'POST',
      body: { userId: id, action: 'reject' }
    })
    const req = requests.value.find(r => r.id === id)
    if (req) req.status = 'rejected'
    toast.add({ title: 'Demande refusée', description: `La demande de ${req?.name} a été refusée`, color: 'red' })
    showModal.value = false
  } catch (error: any) {
    toast.add({ title: 'Erreur', description: error?.statusMessage || 'Impossible de refuser la demande', color: 'red' })
  }
}




const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getRelativeTime = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffInMs = now.getTime() - past.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Aujourd'hui"
  if (diffInDays === 1) return "Hier"
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`
  return formatDate(date)
}
</script>

<template>
<div class="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-6 overflow-auto flex flex-col">    
    <!-- Header -->
    <div class="max-w-6xl   ">

      <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-gray-600 mt-1">Vous aviez {{ stats.total }} demandes</p>
          </div>
        </div>  
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="flex-1 relative">
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div class="flex gap-2">
          <button
            @click="filterStatus = 'all'"
            :class="[
              'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Tous ({{ stats.total }})
          </button>
          <button
            @click="filterStatus = 'pending'"
            :class="[
              'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            ]"
          >
            En attente ({{ stats.pending }})
          </button>
          <button
            @click="filterStatus = 'approved'"
            :class="[
              'px-4 py-2.5 rounded-lg text-sm font-medium transition-all hidden sm:block',
              filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
            ]"
          >
            Validés ({{ stats.approved }})
          </button>
        </div>
      </div>
    </div>


    <!-- Timeline List -->
    <div class="max-w-6xl max-h-[330px] overflow-y-auto">
      <div class="space-y-4">
        <div
          v-for="req in filteredRequests"
          :key="req.id"
          class="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-start justify-between gap-4">
              
              <!-- Left: Avatar & Info -->
              <div class="flex items-start gap-4 flex-1">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {{ req.name.charAt(0).toUpperCase() }}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-lg font-bold text-gray-900 truncate">{{ req.name }}</h3>
                    <span
                      :class="[
                        'flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold',
                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      ]"
                    >
                      {{
                        req.status === 'pending' ? 'En attente' :
                        req.status === 'approved' ? 'Validé' :
                        'Refusé'
                      }}
                    </span>
                  </div>

                  <p class="text-gray-600 text-sm mb-2">{{ req.email }}</p>

                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span class="font-medium text-gray-900">{{ req.organization }}</span>
                    </div>

                    <div v-if="req.phone" class="flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{{ req.phone }}</span>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ getRelativeTime(req.createdAt) }}</span>
                    </div>
                  </div>

                  <p v-if="req.description" class="text-sm text-gray-600 mt-3 line-clamp-2">
                    {{ req.description }}
                  </p>
                </div>
              </div>

              <!-- Right: Actions -->
              <div class="flex flex-col gap-2">
                <button
                  @click="openDetails(req)"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                >
                  Détails
                </button>

                <template v-if="req.status === 'pending'">
                  <button
                    @click="approveRequest(req.id)"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                  >
                    Valider
                  </button>
                  <button
                    @click="rejectRequest(req.id)"
                    class="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    Refuser
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && filteredRequests.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Aucune demande</h3>
          <p class="text-gray-500">Aucune demande ne correspond à vos critères</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div class="flex-1 space-y-3">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal (identique) -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal && selectedRequest"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="bg-gradient-to-r from-orange-600 to-indigo-600 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {{ selectedRequest.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">{{ selectedRequest.name }}</h2>
                  <p class="text-orange-100">{{ selectedRequest.email }}</p>
                </div>
              </div>
              <button
                @click="showModal = false"
                class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-600 mb-2">Organisation</h3>
              <p class="text-lg font-semibold text-gray-900">{{ selectedRequest.organization }}</p>
            </div>

            <div v-if="selectedRequest.description">
              <h3 class="text-sm font-semibold text-gray-600 mb-2">Description</h3>
              <p class="text-gray-700 leading-relaxed">{{ selectedRequest.description }}</p>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div v-if="selectedRequest.phone">
                <h3 class="text-sm font-semibold text-gray-600 mb-2">Téléphone</h3>
                <p class="text-gray-900 font-medium">{{ selectedRequest.phone }}</p>
              </div>

              <div v-if="selectedRequest.website">
                <h3 class="text-sm font-semibold text-gray-600 mb-2">Site web</h3>
                <a :href="selectedRequest.website" target="_blank" class="text-orange-600 hover:text-orange-700 font-medium">
                  {{ selectedRequest.website }}
                </a>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-600 mb-2">Date de demande</h3>
              <p class="text-gray-900 font-medium">{{ formatDate(selectedRequest.createdAt) }}</p>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-600 mb-2">Statut</h3>
              <span
                :class="[
                  'inline-flex px-4 py-2 rounded-xl text-sm font-semibold',
                  selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  selectedRequest.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                ]"
              >
                {{
                  selectedRequest.status === 'pending' ? 'En attente de validation' :
                  selectedRequest.status === 'approved' ? 'Compte validé' :
                  'Demande refusée'
                }}
              </span>
            </div>
          </div>

          <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              @click="showModal = false"
              class="px-3 py-1 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Fermer
            </button>

            <button
              v-if="selectedRequest.status === 'pending'"
              @click="rejectRequest(selectedRequest.id)"
              class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
            >
              Refuser
            </button>

            <button
              v-if="selectedRequest.status === 'pending'"
              @click="approveRequest(selectedRequest.id)"
              class="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
            >
              Valider le compte
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '#imports'



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
  await new Promise(resolve => setTimeout(resolve, 500))

  requests.value = [
    {
      id: '1',
      name: 'Zaki Agokoli',
      email: 'zaki@gmail.com',
      organization: 'EventPro Bénin',
      phone: '+229 99 99 99 99',
      website: 'https://eventpro.bj',
      description: 'Organisation d\'événements culturels et professionnels de haute qualité au Bénin.',
      status: 'pending',
      createdAt: '2026-02-02'
    },
    {
      id: '2',
      name: 'Marc Doe',
      email: 'marc@gmail.com',
      organization: 'Live Africa',
      phone: '+229 97 88 77 66',
      description: 'Concerts et festivals',
      status: 'approved',
      createdAt: '2026-01-28'
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      email: 'sarah@events.com',
      organization: 'Premium Events',
      status: 'pending',
      createdAt: '2026-02-01'
    }
  ]

  loading.value = false
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
  const req = requests.value.find(r => r.id === id)
  if (!req) return

  req.status = 'approved'

  toast.add({
    title: 'Succès',
    description: `${req.name} est maintenant organisateur`,
    color: 'green'
  })

  showModal.value = false
}

const rejectRequest = async (id: string) => {
  const req = requests.value.find(r => r.id === id)
  if (!req) return

  req.status = 'rejected'

  toast.add({
    title: 'Demande refusée',
    description: `La demande de ${req.name} a été refusée`,
    color: 'red'
  })

  showModal.value = false
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 p-4 sm:p-6 lg:p-8">
    
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Demandes d'organisateurs</h1>
          <p class="text-gray-600">Gérez les demandes de comptes organisateurs</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-600 text-sm font-medium">Total</span>
          <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats.total }}</div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-yellow-700 text-sm font-medium">En attente</span>
          <div class="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold text-yellow-700">{{ stats.pending }}</div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-green-700 text-sm font-medium">Validés</span>
          <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold text-green-700">{{ stats.approved }}</div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-red-700 text-sm font-medium">Refusés</span>
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold text-red-700">{{ stats.rejected }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher par nom, email ou organisation..."
            class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <select
          v-model="filterStatus"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
        >
          <option value="all">📋 Tous les statuts</option>
          <option value="pending">⏳ En attente</option>
          <option value="approved">✅ Validés</option>
          <option value="rejected">❌ Refusés</option>
        </select>
      </div>
    </div>

    <!-- Cards Grid -->
    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="req in filteredRequests"
        :key="req.id"
        class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
      >
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-xl font-bold">
              {{ req.name.charAt(0).toUpperCase() }}
            </div>
            <span
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-semibold',
                req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                req.status === 'approved' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              ]"
            >
              {{
                req.status === 'pending' ? '⏳ En attente' :
                req.status === 'approved' ? '✅ Validé' :
                '❌ Refusé'
              }}
            </span>
          </div>
          <h3 class="text-xl font-bold text-white mb-1">{{ req.name }}</h3>
          <p class="text-purple-100 text-sm">{{ req.email }}</p>
        </div>

        <!-- Card Body -->
        <div class="p-6 space-y-4">
          <div>
            <div class="flex items-center gap-2 text-gray-600 mb-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="text-sm font-medium">Organisation</span>
            </div>
            <p class="text-gray-900 font-semibold">{{ req.organization }}</p>
          </div>

          <div v-if="req.phone">
            <div class="flex items-center gap-2 text-gray-600 mb-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-sm font-medium">Téléphone</span>
            </div>
            <p class="text-gray-700">{{ req.phone }}</p>
          </div>

          <div v-if="req.website">
            <div class="flex items-center gap-2 text-gray-600 mb-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span class="text-sm font-medium">Site web</span>
            </div>
            <a :href="req.website" target="_blank" class="text-purple-600 hover:text-purple-700 text-sm truncate block">
              {{ req.website }}
            </a>
          </div>

          <div>
            <div class="flex items-center gap-2 text-gray-600 mb-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm font-medium">Date de demande</span>
            </div>
            <p class="text-gray-700 text-sm">{{ formatDate(req.createdAt) }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-4 border-t border-gray-100">
            <button
              @click="openDetails(req)"
              class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              Détails
            </button>
            <button
              v-if="req.status === 'pending'"
              @click="approveRequest(req.id)"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/30"
            >
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredRequests.length === 0" class="text-center py-16">
      <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Aucune demande trouvée</h3>
      <p class="text-gray-600">Modifiez vos filtres pour voir plus de résultats</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div class="h-14 bg-gray-200 rounded-xl mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Modal Détails -->
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
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sticky top-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {{ selectedRequest.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">{{ selectedRequest.name }}</h2>
                  <p class="text-purple-100">{{ selectedRequest.email }}</p>
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

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Organisation
              </h3>
              <p class="text-lg font-semibold text-gray-900">{{ selectedRequest.organization }}</p>
            </div>

            <div v-if="selectedRequest.description">
              <h3 class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description
              </h3>
              <p class="text-gray-700 leading-relaxed">{{ selectedRequest.description }}</p>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div v-if="selectedRequest.phone">
                <h3 class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Téléphone
                </h3>
                <p class="text-gray-900 font-medium">{{ selectedRequest.phone }}</p>
              </div>

              <div v-if="selectedRequest.website">
                <h3 class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Site web
                </h3>
                <a :href="selectedRequest.website" target="_blank" class="text-purple-600 hover:text-purple-700 font-medium">
                  {{ selectedRequest.website }}
                </a>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date de demande
              </h3>
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
                  selectedRequest.status === 'pending' ? '⏳ En attente de validation' :
                  selectedRequest.status === 'approved' ? '✅ Compte validé' :
                  '❌ Demande refusée'
                }}
              </span>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              @click="showModal = false"
              class="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Fermer
            </button>

            <button
              v-if="selectedRequest.status === 'pending'"
              @click="rejectRequest(selectedRequest.id)"
              class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30"
            >
              Refuser
            </button>

            <button
              v-if="selectedRequest.status === 'pending'"
              @click="approveRequest(selectedRequest.id)"
              class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/30"
            >
              Valider le compte
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
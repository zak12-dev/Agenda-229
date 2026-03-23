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
    requests.value = await $fetch<OrganizerRequest[]>('/api/admin/organizer/all-requests')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const filteredRequests = computed(() => {
  let result = [...requests.value]
  if (filterStatus.value !== 'all') result = result.filter(r => r.status === filterStatus.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.user.name.toLowerCase().includes(q) || r.user.email.toLowerCase().includes(q)
    )
  }
  return result
})

const stats = computed(() => ({
  total:    requests.value.length,
  pending:  requests.value.filter(r => r.status === 'pending').length,
  approved: requests.value.filter(r => r.status === 'approved').length,
  rejected: requests.value.filter(r => r.status === 'rejected').length,
}))

const getStatusConfig = (status: string) => ({
  pending:  { label: 'En attente', dot: 'bg-amber-500',   classes: 'bg-amber-50 text-amber-700 border-amber-200',   icon: 'i-heroicons-clock' },
  approved: { label: 'Approuvée',  dot: 'bg-emerald-500', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'i-heroicons-check-circle' },
  rejected: { label: 'Rejetée',    dot: 'bg-red-500',     classes: 'bg-red-50 text-red-600 border-red-200',          icon: 'i-heroicons-x-circle' },
}[status] ?? { label: status, dot: 'bg-[#c0b8ad]', classes: 'bg-[#f5f0e8] text-[#8a8078] border-[#ede8e0]', icon: 'i-heroicons-question-mark-circle' })

const getAvatarGradient = (name: string) => {
  const colors = [
    ['#ea6c1e','#f59e0b'],['#5b47e0','#818cf8'],['#059669','#34d399'],
    ['#dc2626','#f87171'],['#0891b2','#67e8f9'],['#7c3aed','#c4b5fd'],
  ]
  const i = name.charCodeAt(0) % colors.length
  return `linear-gradient(135deg, ${colors[i][0]}, ${colors[i][1]})`
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const formatDateTime = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

onMounted(fetchRequests)
</script>

<template>
  <div class="bg-[#f5f3ef] px-4 pt-4 pb-32 sm:px-6 sm:pb-12 font-outfit w-full min-h-screen overflow-y-auto mb-10">
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- ── KPI Cards ── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide">Total</p>
            <div class="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5 text-indigo-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight">{{ stats.total }}</p>
        </div>

        <div class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide leading-tight">En attente</p>
            <div class="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight">{{ stats.pending }}</p>
        </div>

        <div class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide">Approuvées</p>
            <div class="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight">{{ stats.approved }}</p>
        </div>

        <div class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide">Rejetées</p>
            <div class="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <UIcon name="i-heroicons-x-circle" class="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight">{{ stats.rejected }}</p>
        </div>
      </div>

      <!-- ── Recherche + Filtres ── -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] p-4
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
        <div class="relative">
          <UIcon name="i-heroicons-magnifying-glass"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad]" />
          <input
            v-model="searchQuery" type="text"
            placeholder="Rechercher par nom ou email…"
            class="w-full pl-10 pr-9 py-2.5 bg-[#faf8f5] border border-[#ede8e0] rounded-xl
                   text-[13.5px] text-[#1a1612] placeholder:text-[#c0b8ad] font-outfit
                   focus:outline-none focus:border-[#ea6c1e] focus:ring-2 focus:ring-[#ea6c1e]/10 transition-all"
          />
          <button v-if="searchQuery" @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#8a8078] transition-colors">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <button @click="filterStatus = 'all'"
            :class="['filter-pill', filterStatus === 'all' ? 'filter-pill--indigo' : 'filter-pill--off']">
            Toutes <span class="ml-1 text-[10px] font-bold opacity-70">{{ stats.total }}</span>
          </button>
          <button @click="filterStatus = 'pending'"
            :class="['filter-pill', filterStatus === 'pending' ? 'filter-pill--amber' : 'filter-pill--off']">
            <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            En attente <span class="ml-1 text-[10px] font-bold opacity-70">{{ stats.pending }}</span>
          </button>
          <button @click="filterStatus = 'approved'"
            :class="['filter-pill', filterStatus === 'approved' ? 'filter-pill--green' : 'filter-pill--off']">
            <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            Approuvées <span class="ml-1 text-[10px] font-bold opacity-70">{{ stats.approved }}</span>
          </button>
          <button @click="filterStatus = 'rejected'"
            :class="['filter-pill', filterStatus === 'rejected' ? 'filter-pill--red' : 'filter-pill--off']">
            <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            Rejetées <span class="ml-1 text-[10px] font-bold opacity-70">{{ stats.rejected }}</span>
          </button>
        </div>
      </div>

      <!-- ── Résultats ── -->
      <p v-if="searchQuery || filterStatus !== 'all'" class="text-[12.5px] text-[#8a8078] px-1">
        <span class="font-semibold text-[#1a1612]">{{ filteredRequests.length }}</span>
        résultat{{ filteredRequests.length > 1 ? 's' : '' }}
        <span v-if="searchQuery"> pour "<span class="text-[#ea6c1e]">{{ searchQuery }}</span>"</span>
      </p>

      <!-- ── Liste ── -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-[#ede8e0] bg-[#faf8f5] flex items-center justify-between">
          <p class="text-[13px] font-semibold text-[#1a1612]">
            {{ filteredRequests.length }} entrée{{ filteredRequests.length > 1 ? 's' : '' }}
          </p>
          <button @click="fetchRequests"
            class="flex items-center gap-1.5 text-[11.5px] font-medium text-[#b0a898] hover:text-[#ea6c1e] transition-colors">
            <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="divide-y divide-[#ede8e0]">
          <div v-for="i in 5" :key="i" class="p-5 flex items-start gap-4 animate-pulse">
            <div class="w-10 h-10 rounded-full bg-[#f0ede8] flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-3.5 w-1/3 rounded" />
              <USkeleton class="h-3 w-1/4 rounded" />
              <USkeleton class="h-3 w-2/3 rounded" />
            </div>
            <USkeleton class="h-6 w-24 rounded-full flex-shrink-0" />
          </div>
        </div>

        <!-- ── MOBILE : cards ── -->
        <div v-else class="sm:hidden divide-y divide-[#ede8e0]">
          <div
            v-for="req in filteredRequests" :key="req.id"
            class="p-4 hover:bg-[#faf5ee] transition-colors"
          >
            <div class="flex items-start gap-3">
              <!-- Avatar -->
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden text-white font-bold text-[13px]"
                :style="`background: ${getAvatarGradient(req.user.name)}`"
              >
                <img v-if="req.user.image" :src="req.user.image" :alt="req.user.name" class="w-full h-full object-cover" />
                <span v-else>{{ req.user.name.charAt(0).toUpperCase() }}</span>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p class="font-semibold text-[13px] text-[#1a1612] truncate">{{ req.user.name }}</p>
                  <span :class="['status-badge border', getStatusConfig(req.status).classes]">
                    <span :class="['w-1.5 h-1.5 rounded-full', getStatusConfig(req.status).dot]" />
                    {{ getStatusConfig(req.status).label }}
                  </span>
                </div>
                <p class="text-[11.5px] text-[#8a8078] mb-2 truncate">{{ req.user.email }}</p>

                <!-- Dates mobiles -->
                <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#b0a898]">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                    {{ formatDate(req.createdAt) }}
                  </span>
                  <span v-if="req.reviewedAt" class="flex items-center gap-1">
                    <UIcon name="i-heroicons-user-circle" class="w-3 h-3" />
                    Examiné {{ formatDate(req.reviewedAt) }}
                  </span>
                </div>

                <div v-if="req.reviewer" class="mt-2 flex items-center gap-1.5 text-[11px] text-[#8a8078]">
                  <UIcon name="i-heroicons-user" class="w-3 h-3 text-[#c0b8ad]" />
                  Par <span class="font-semibold text-[#4a3f32]">{{ req.reviewer.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty mobile -->
          <div v-if="filteredRequests.length === 0" class="py-14 text-center">
            <div class="w-14 h-14 rounded-2xl bg-[#f5f0e8] border border-[#ede8e0] flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-[#c0b8ad]" />
            </div>
            <p class="text-[13px] font-medium text-[#8a8078] mb-1">Aucun résultat</p>
            <p class="text-[12px] text-[#b0a898] mb-4">Aucune demande ne correspond aux filtres</p>
            <button @click="searchQuery = ''; filterStatus = 'all'"
              class="px-5 py-2 bg-[#ea6c1e] text-white text-[12.5px] font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Réinitialiser
            </button>
          </div>
        </div>

        <!-- ── DESKTOP : tableau ── -->
        <div class="hidden sm:block overflow-x-auto overflow-y-auto max-h-[600px] mb-4">
          <table class="w-full">
            <thead class="bg-[#f5f0e8] border-b border-[#ede8e0]">
              <tr>
                <th class="th">Demandeur</th>
                <th class="th text-center">Statut</th>
                <th class="th hidden md:table-cell">Soumise le</th>
                <th class="th hidden lg:table-cell">Examinée le</th>
                <th class="th hidden lg:table-cell">Examiné par</th>
                <th class="th hidden md:table-cell">Mise à jour</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#ede8e0]">

              <!-- Rows -->
              <tr
                v-for="req in filteredRequests" :key="req.id"
                class="hover:bg-[#faf5ee] transition-colors group"
              >
                <!-- Demandeur -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
                             text-white font-bold text-[13px] transition-transform duration-200 group-hover:scale-105"
                      :style="`background: ${getAvatarGradient(req.user.name)}`"
                    >
                      <img v-if="req.user.image" :src="req.user.image" :alt="req.user.name" class="w-full h-full object-cover" />
                      <span v-else>{{ req.user.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-[13px] text-[#1a1612] truncate">{{ req.user.name }}</p>
                      <p class="text-[11px] text-[#b0a898] truncate">{{ req.user.email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Statut -->
                <td class="px-5 py-3.5 text-center">
                  <span :class="['status-badge border', getStatusConfig(req.status).classes]">
                    <span :class="['w-1.5 h-1.5 rounded-full', getStatusConfig(req.status).dot]" />
                    {{ getStatusConfig(req.status).label }}
                  </span>
                </td>

                <!-- Soumise le -->
                <td class="px-5 py-3.5 hidden md:table-cell">
                  <span class="text-[12px] text-[#8a8078]">{{ formatDateTime(req.createdAt) }}</span>
                </td>

                <!-- Examinée le -->
                <td class="px-5 py-3.5 hidden lg:table-cell">
                  <span v-if="req.reviewedAt" class="text-[12px] text-[#8a8078]">
                    {{ formatDateTime(req.reviewedAt) }}
                  </span>
                  <span v-else class="text-[12px] text-[#c0b8ad]">—</span>
                </td>

                <!-- Examiné par -->
                <td class="px-5 py-3.5 hidden lg:table-cell">
                  <div v-if="req.reviewer" class="flex items-center gap-2">
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      :style="`background: ${getAvatarGradient(req.reviewer.name)}`"
                    >
                      {{ req.reviewer.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-[12px] font-medium text-[#4a3f32] truncate max-w-[120px]">{{ req.reviewer.name }}</span>
                  </div>
                  <span v-else class="text-[12px] text-[#c0b8ad]">—</span>
                </td>

                <!-- Mise à jour -->
                <td class="px-5 py-3.5 hidden md:table-cell">
                  <span class="text-[12px] text-[#8a8078]">{{ formatDate(req.updatedAt) }}</span>
                </td>
              </tr>

              <!-- Empty desktop -->
              <tr v-if="filteredRequests.length === 0">
                <td colspan="6" class="py-16 text-center">
                  <div class="w-14 h-14 rounded-2xl bg-[#f5f0e8] border border-[#ede8e0] flex items-center justify-center mx-auto mb-4">
                    <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-[#c0b8ad]" />
                  </div>
                  <p class="text-[13px] font-medium text-[#8a8078] mb-1">Aucun résultat</p>
                  <p class="text-[12px] text-[#b0a898] mb-4">Aucune demande ne correspond aux filtres sélectionnés</p>
                  <button
                    @click="searchQuery = ''; filterStatus = 'all'"
                    class="px-5 py-2 bg-[#ea6c1e] text-white text-[12.5px] font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Réinitialiser les filtres
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

/* ── Table header ── */
.th {
  padding: 10px 20px; font-size: 10px; font-weight: 600;
  letter-spacing: 0.09em; text-transform: uppercase; color: #8a8078; text-align: left;
}

/* ── Status badge ── */
.status-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}

/* ── Filter pills ── */
.filter-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 20px; font-size: 12.5px; font-weight: 500; white-space: nowrap; border-width: 1px; border-style: solid; transition: all 0.15s; cursor: pointer; font-family: 'Outfit', sans-serif; }
.filter-pill--off    { background: #faf8f5; color: #8a8078; border-color: #ede8e0; }
.filter-pill--off:hover { border-color: #c0b8ad; color: #4a3f32; }
.filter-pill--indigo { background: #5b47e0; color: white; border-color: #5b47e0; }
.filter-pill--amber  { background: #d97706; color: white; border-color: #d97706; }
.filter-pill--green  { background: #16a34a; color: white; border-color: #16a34a; }
.filter-pill--red    { background: #dc2626; color: white; border-color: #dc2626; }

/* ── Scrollbar ── */
.scrollbar-none::-webkit-scrollbar { display: none; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
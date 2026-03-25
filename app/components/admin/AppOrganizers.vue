<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '#imports'

definePageMeta({ layout: 'dashboard' as const })

const toast = useToast()

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
const actionLoading = ref<'approve' | 'reject' | null>(null)

// ─── Fetch ───
const fetchRequests = async () => {
  loading.value = true
  try {
    requests.value = await $fetch<OrganizerRequest[]>('/api/admin/organizers')
  } catch (error: any) {
    toast.add({ title: 'Erreur', description: error?.message || 'Impossible de récupérer les demandes.', color: 'red' })
    requests.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchRequests)

// ─── Filtres ───
const filteredRequests = computed(() =>
  requests.value.filter(r => {
    const q = search.value.toLowerCase()
    const matchSearch = r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.organization.toLowerCase().includes(q)
    const matchStatus = filterStatus.value === 'all' || r.status === filterStatus.value
    return matchSearch && matchStatus
  })
)

const stats = computed(() => ({
  total:    requests.value.length,
  pending:  requests.value.filter(r => r.status === 'pending').length,
  approved: requests.value.filter(r => r.status === 'approved').length,
  rejected: requests.value.filter(r => r.status === 'rejected').length,
}))

// ─── Actions ───
const openDetails = (req: OrganizerRequest) => { selectedRequest.value = req; showModal.value = true }

const approveRequest = async (id: string) => {
  actionLoading.value = 'approve'
  try {
    await $fetch('/api/admin/organizer/validate', { method: 'POST', body: { userId: id, action: 'approve' } })
    const req = requests.value.find(r => r.id === id)
    if (req) req.status = 'approved'
    toast.add({ title: 'Succès', description: `${req?.name} est maintenant organisateur`, color: 'green' })
    showModal.value = false
  } catch (error: any) {
    toast.add({ title: 'Erreur', description: error?.statusMessage || 'Impossible de valider', color: 'red' })
  } finally { actionLoading.value = null }
}

const rejectRequest = async (id: string) => {
  actionLoading.value = 'reject'
  try {
    await $fetch('/api/admin/organizer/validate', { method: 'POST', body: { userId: id, action: 'reject' } })
    const req = requests.value.find(r => r.id === id)
    if (req) req.status = 'rejected'
    toast.add({ title: 'Demande refusée', description: `La demande de ${req?.name} a été refusée`, color: 'orange' })
    showModal.value = false
  } catch (error: any) {
    toast.add({ title: 'Erreur', description: error?.statusMessage || 'Impossible de refuser', color: 'red' })
  } finally { actionLoading.value = null }
}

// ─── Helpers ───
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const getRelativeTime = (date: string) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7) return `Il y a ${diff} jours`
  return formatDate(date)
}

const getStatusConfig = (s: RequestStatus) => ({
  pending:  { label: 'En attente', classes: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  approved: { label: 'Validé',     classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Refusé',     classes: 'bg-red-50 text-red-600 border-red-200',        dot: 'bg-red-500' },
}[s])

// Couleur avatar cyclique
const getAvatarGradient = (name: string) => {
  const colors = [
    ['#ea6c1e', '#f59e0b'], ['#5b47e0', '#818cf8'],
    ['#059669', '#34d399'], ['#dc2626', '#f87171'],
    ['#0891b2', '#67e8f9'], ['#7c3aed', '#c4b5fd'],
  ]
  const i = name.charCodeAt(0) % colors.length
  return `linear-gradient(135deg, ${colors[i][0]}, ${colors[i][1]})`
}
</script>

<template>
  <div class="bg-[#f5f3ef] px-4 pt-4 pb-32 sm:px-6 sm:pb-12 font-outfit w-full min-h-screen">
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- ── KPI Cards ── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <!-- Total -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide">Total</p>
            <div class="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <UIcon name="i-heroicons-inbox" class="w-3.5 h-3.5 text-indigo-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight">{{ stats.total }}</p>
        </div>

        <!-- En attente -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide leading-tight">En attente</p>
            <div class="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight">{{ stats.pending }}</p>
        </div>

        <!-- Validés -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide">Validés</p>
            <div class="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight">{{ stats.approved }}</p>
        </div>

        <!-- Refusés -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide">Refusés</p>
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
        <!-- Search -->
        <div class="relative">
          <UIcon name="i-heroicons-magnifying-glass"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad]" />
          <input
            v-model="search" type="text"
            placeholder="Rechercher par nom, email, organisation…"
            class="w-full pl-10 pr-9 py-2.5 bg-[#faf8f5] border border-[#ede8e0] rounded-xl
                   text-[13.5px] text-[#1a1612] placeholder:text-[#c0b8ad] font-outfit
                   focus:outline-none focus:border-[#ea6c1e] focus:ring-2 focus:ring-[#ea6c1e]/10 transition-all"
          />
          <button v-if="search" @click="search = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#8a8078] transition-colors">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <!-- Filter pills -->
        <div class="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none flex-wrap">
          <button @click="filterStatus = 'all'"
            :class="['filter-pill', filterStatus === 'all' ? 'filter-pill--indigo' : 'filter-pill--off']">
            Tous <span class="ml-1 text-[10px] font-bold opacity-70">{{ stats.total }}</span>
          </button>
          <button @click="filterStatus = 'pending'"
            :class="['filter-pill', filterStatus === 'pending' ? 'filter-pill--amber' : 'filter-pill--off']">
            <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            En attente <span class="ml-1 text-[10px] font-bold opacity-70">{{ stats.pending }}</span>
          </button>
          <button @click="filterStatus = 'approved'"
            :class="['filter-pill', filterStatus === 'approved' ? 'filter-pill--green' : 'filter-pill--off']">
            <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            Validés <span class="ml-1 text-[10px] font-bold opacity-70">{{ stats.approved }}</span>
          </button>
          <button @click="filterStatus = 'rejected'"
            :class="['filter-pill', filterStatus === 'rejected' ? 'filter-pill--red' : 'filter-pill--off']">
            <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            Refusés <span class="ml-1 text-[10px] font-bold opacity-70">{{ stats.rejected }}</span>
          </button>
        </div>
      </div>

      <!-- ── Liste des demandes ── -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-[#ede8e0] bg-[#faf8f5] flex items-center justify-between">
          <p class="text-[13px] font-semibold text-[#1a1612]">
            {{ filteredRequests.length }} demande{{ filteredRequests.length > 1 ? 's' : '' }}
            <span v-if="search" class="text-[#b0a898] font-normal text-[12px]"> pour "{{ search }}"</span>
          </p>
          <button @click="fetchRequests"
            class="flex items-center gap-1.5 text-[11.5px] font-medium text-[#b0a898] hover:text-[#ea6c1e] transition-colors">
            <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>

        <!-- ── Skeleton ── -->
        <div v-if="loading" class="divide-y divide-[#ede8e0]">
          <div v-for="i in 4" :key="i" class="p-5 flex items-start gap-4 animate-pulse">
            <div class="w-11 h-11 rounded-full bg-[#f0ede8] flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-3.5 w-1/3 rounded" />
              <USkeleton class="h-3 w-1/4 rounded" />
              <USkeleton class="h-3 w-1/2 rounded" />
            </div>
            <div class="flex flex-col gap-2">
              <USkeleton class="h-8 w-20 rounded-xl" />
              <USkeleton class="h-8 w-20 rounded-xl" />
            </div>
          </div>
        </div>

        <!-- ── Items ── -->
        <div v-else class="divide-y divide-[#ede8e0]">
          <div
            v-for="req in filteredRequests" :key="req.id"
            class="p-5 hover:bg-[#faf5ee] transition-colors group"
          >
            <div class="flex items-start gap-4">

              <!-- Avatar -->
              <div
                class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0
                       text-white font-bold text-[15px] transition-transform duration-200 group-hover:scale-105"
                :style="`background: ${getAvatarGradient(req.name)}`"
              >
                {{ req.name.charAt(0).toUpperCase() }}
              </div>

              <!-- Infos -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <p class="font-bold text-[14px] text-[#1a1612] truncate">{{ req.name }}</p>
                  <span :class="['status-badge border', getStatusConfig(req.status).classes]">
                    <span :class="['w-1.5 h-1.5 rounded-full', getStatusConfig(req.status).dot]" />
                    {{ getStatusConfig(req.status).label }}
                  </span>
                </div>

                <p class="text-[12px] text-[#8a8078] mb-2">{{ req.email }}</p>

                <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-[#8a8078]">
                  <span class="flex items-center gap-1.5">
                    <UIcon name="i-heroicons-building-office-2" class="w-3.5 h-3.5 text-[#c0b8ad]" />
                    <span class="font-medium text-[#4a3f32]">{{ req.organization }}</span>
                  </span>
                  <span v-if="req.phone" class="flex items-center gap-1.5">
                    <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-[#c0b8ad]" />
                    {{ req.phone }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-[#c0b8ad]" />
                    {{ getRelativeTime(req.createdAt) }}
                  </span>
                </div>

                <p v-if="req.description" class="text-[12px] text-[#8a8078] mt-2.5 line-clamp-2 leading-relaxed">
                  {{ req.description }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex flex-col gap-2 flex-shrink-0">
                <button @click="openDetails(req)" class="btn-ghost-sm">
                  <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
                  Détails
                </button>
                <template v-if="req.status === 'pending'">
                  <button @click="approveRequest(req.id)" class="btn-approve-sm">
                    <UIcon name="i-heroicons-check" class="w-3.5 h-3.5" />
                    Valider
                  </button>
                  <button @click="rejectRequest(req.id)" class="btn-reject-sm">
                    <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
                    Refuser
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="filteredRequests.length === 0" class="py-16 text-center">
            <div class="w-14 h-14 rounded-2xl bg-[#f5f0e8] border border-[#ede8e0]
                        flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-inbox" class="w-6 h-6 text-[#c0b8ad]" />
            </div>
            <p class="text-[13px] font-medium text-[#8a8078] mb-1">Aucune demande</p>
            <p class="text-[12px] text-[#b0a898] mb-4">
              {{ search ? `Aucun résultat pour "${search}"` : 'Aucune demande ne correspond aux filtres' }}
            </p>
            <button v-if="search" @click="search = ''"
              class="px-5 py-2 bg-[#ea6c1e] text-white text-[12.5px] font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Réinitialiser la recherche
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════
         MODAL DÉTAILS
    ══════════════════════════════════ -->
    <Transition name="fade">
      <div
        v-if="showModal && selectedRequest"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        @click.self="showModal = false"
      >
        <Transition name="slide-up">
          <div class="modal-sheet sm:max-w-2xl">

            <!-- Header -->
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                         text-white font-bold text-lg border-2 border-white/20"
                  :style="`background: ${getAvatarGradient(selectedRequest.name)}`"
                >
                  {{ selectedRequest.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-base font-bold text-white leading-tight">{{ selectedRequest.name }}</h3>
                  <p class="text-xs text-orange-100/70">{{ selectedRequest.email }}</p>
                </div>
              </div>
              <button @click="showModal = false" class="modal-close">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">

              <!-- Statut -->
              <div class="info-block">
                <div class="info-label"><UIcon name="i-heroicons-check-badge" class="w-3.5 h-3.5" />Statut</div>
                <span :class="['status-badge border', getStatusConfig(selectedRequest.status).classes]">
                  <span :class="['w-1.5 h-1.5 rounded-full', getStatusConfig(selectedRequest.status).dot]" />
                  {{ getStatusConfig(selectedRequest.status).label === 'Validé' ? 'Compte validé' :
                     getStatusConfig(selectedRequest.status).label === 'En attente' ? 'En attente de validation' :
                     'Demande refusée' }}
                </span>
              </div>

              <!-- Organisation -->
              <div class="info-block">
                <div class="info-label"><UIcon name="i-heroicons-building-office-2" class="w-3.5 h-3.5" />Organisation</div>
                <p class="text-[14px] font-bold text-[#1a1612]">{{ selectedRequest.organization }}</p>
              </div>

              <!-- Description -->
              <div v-if="selectedRequest.description" class="info-block">
                <div class="info-label"><UIcon name="i-heroicons-bars-3-bottom-left" class="w-3.5 h-3.5" />Description</div>
                <p class="text-[13px] text-[#4a3f32] leading-relaxed">{{ selectedRequest.description }}</p>
              </div>

              <!-- Grid infos -->
              <div class="grid grid-cols-2 gap-3">
                <div v-if="selectedRequest.phone" class="info-block">
                  <div class="info-label"><UIcon name="i-heroicons-phone" class="w-3.5 h-3.5" />Téléphone</div>
                  <p class="text-[13px] font-semibold text-[#1a1612]">{{ selectedRequest.phone }}</p>
                </div>
                <div v-if="selectedRequest.website" class="info-block">
                  <div class="info-label"><UIcon name="i-heroicons-globe-alt" class="w-3.5 h-3.5" />Site web</div>
                  <a :href="selectedRequest.website" target="_blank"
                    class="text-[13px] font-semibold text-[#ea6c1e] hover:underline truncate block">
                    {{ selectedRequest.website }}
                  </a>
                </div>
                <div class="info-block">
                  <div class="info-label"><UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />Date de demande</div>
                  <p class="text-[13px] font-semibold text-[#1a1612]">{{ formatDate(selectedRequest.createdAt) }}</p>
                </div>
                <div class="info-block">
                  <div class="info-label"><UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />Reçu</div>
                  <p class="text-[13px] font-semibold text-[#1a1612]">{{ getRelativeTime(selectedRequest.createdAt) }}</p>
                </div>
              </div>

              <!-- Note admin si déjà traité -->
              <div v-if="selectedRequest.status !== 'pending'"
                :class="[
                  'flex gap-3 rounded-xl p-4 border',
                  selectedRequest.status === 'approved'
                    ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                ]">
                <UIcon
                  :name="selectedRequest.status === 'approved' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="['w-4 h-4 flex-shrink-0 mt-0.5', selectedRequest.status === 'approved' ? 'text-emerald-600' : 'text-red-500']"
                />
                <p :class="['text-[12.5px]', selectedRequest.status === 'approved' ? 'text-emerald-700' : 'text-red-600']">
                  {{ selectedRequest.status === 'approved'
                    ? 'Ce compte a été validé. L\'organisateur peut désormais publier des événements.'
                    : 'Cette demande a été refusée. L\'utilisateur ne peut pas devenir organisateur.' }}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
              <button @click="showModal = false" class="btn-ghost">Fermer</button>
              <template v-if="selectedRequest.status === 'pending'">
                <button
                  @click="rejectRequest(selectedRequest.id)"
                  :disabled="actionLoading !== null"
                  class="btn-reject"
                >
                  <UIcon v-if="actionLoading === 'reject'" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
                  <UIcon v-else name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
                  Refuser
                </button>
                <button
                  @click="approveRequest(selectedRequest.id)"
                  :disabled="actionLoading !== null"
                  class="btn-approve"
                >
                  <UIcon v-if="actionLoading === 'approve'" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
                  <UIcon v-else name="i-heroicons-check" class="w-3.5 h-3.5" />
                  Valider le compte
                </button>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>


/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1); }
.slide-up-enter-from { opacity: 0; transform: translateY(40px) scale(0.97); }
.slide-up-leave-to  { opacity: 0; transform: translateY(20px) scale(0.97); }

/* ── Modal ── */
.modal-sheet {
  background: #ffffff; border-radius: 24px 24px 0 0;
  width: 100%; max-height: 92dvh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.15);
}
@media (min-width: 640px) {
  .modal-sheet { border-radius: 20px; max-height: 90vh; box-shadow: 0 24px 80px rgba(0,0,0,0.18); }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px;
  background: linear-gradient(135deg, #ea6c1e, #5b47e0); flex-shrink: 0;
}
.modal-close {
  width: 34px; height: 34px; background: rgba(255,255,255,0.15);
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  color: white; transition: background 0.2s; cursor: pointer; border: none;
}
.modal-close:hover { background: rgba(255,255,255,0.25); }

.modal-footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  padding: 14px 20px; border-top: 1px solid #ede8e0;
  background: #faf8f5; flex-shrink: 0;
}

/* ── Info blocks ── */
.info-block { background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px; padding: 12px 14px; }
.info-label { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #b0a898; margin-bottom: 6px; }

/* ── Status badge ── */
.status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }

/* ── Filter pills ── */
.filter-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 20px; font-size: 12.5px; font-weight: 500; white-space: nowrap; border-width: 1px; border-style: solid; transition: all 0.15s; cursor: pointer; font-family: 'Outfit', sans-serif; }
.filter-pill--off    { background: #faf8f5; color: #8a8078; border-color: #ede8e0; }
.filter-pill--off:hover { border-color: #c0b8ad; color: #4a3f32; }
.filter-pill--indigo { background: #5b47e0; color: white; border-color: #5b47e0; }
.filter-pill--amber  { background: #d97706; color: white; border-color: #d97706; }
.filter-pill--green  { background: #16a34a; color: white; border-color: #16a34a; }
.filter-pill--red    { background: #dc2626; color: white; border-color: #dc2626; }

/* ── Boutons inline (liste) ── */
.btn-ghost-sm {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 10px;
  font-size: 12px; font-weight: 500; color: #8a8078;
  background: white; border: 1px solid #ede8e0;
  transition: background 0.15s; font-family: 'Outfit', sans-serif; cursor: pointer;
}
.btn-ghost-sm:hover { background: #f5f0e8; }

.btn-approve-sm {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 10px;
  font-size: 12px; font-weight: 600; color: #15803d;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  transition: all 0.15s; font-family: 'Outfit', sans-serif; cursor: pointer;
}
.btn-approve-sm:hover { background: #dcfce7; }

.btn-reject-sm {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 10px;
  font-size: 12px; font-weight: 600; color: #dc2626;
  background: #fef2f2; border: 1px solid #fecaca;
  transition: all 0.15s; font-family: 'Outfit', sans-serif; cursor: pointer;
}
.btn-reject-sm:hover { background: #fee2e2; }

/* ── Boutons modal footer ── */
.btn-ghost {
  padding: 9px 18px; border-radius: 12px;
  font-size: 13px; font-weight: 500; color: #8a8078;
  background: white; border: 1px solid #ede8e0;
  transition: background 0.15s; font-family: 'Outfit', sans-serif; cursor: pointer;
}
.btn-ghost:hover { background: #f5f0e8; }

.btn-approve {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 12px;
  font-size: 13px; font-weight: 600; color: white;
  background: linear-gradient(135deg, #16a34a, #059669);
  border: none; cursor: pointer; transition: opacity 0.15s;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 4px 14px rgba(22,163,74,0.25);
}
.btn-approve:hover:not(:disabled) { opacity: 0.9; }
.btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-reject {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 12px;
  font-size: 13px; font-weight: 600; color: #dc2626;
  background: #fef2f2; border: 1px solid #fecaca;
  cursor: pointer; transition: all 0.15s;
  font-family: 'Outfit', sans-serif;
}
.btn-reject:hover:not(:disabled) { background: #fee2e2; }
.btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Scrollbar ── */
.scrollbar-none::-webkit-scrollbar { display: none; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
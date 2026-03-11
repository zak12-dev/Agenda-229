<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '../../../composables/useAuth'

// ─── Types ───
interface EventImage { id: string; url: string }

interface CustomEvent {
  id: number; title: string; categoryId: string; date: string
  location: string; price: number | 'Free'; duration: string
  description: string; image: string | null; images: EventImage[]
  privilege: boolean; organizer: { name: string; contact: string }
  views: number; createdAt: string; updatedAt: string
  status: string; category: { name: string; id: string }
}

interface Category { id: string; name: string; icon?: string }
interface Ville { id: string; name: string }

interface EventForm {
  title: string; description: string; location: string; details: string
  eventDate: string; startDate: string; endDate: string
  villeId: string; categoryId: string; images: File[]
  priceType: 'FREE' | 'PAID'; price: string; status: 'DRAFT' | 'PUBLISHED'
}

// ─── Auth ───
const { session } = useAuth()
const isAdmin = computed(() => session.value?.user.roleId === 1)

// ─── État liste ───
const searchQuery = ref('')
const filterStatus = ref<'all' | 'Publié' | 'Brouillon' | 'Recherche'>('all')
const events = ref<CustomEvent[]>([])
const loading = ref(true)
const error = ref('')
const isEditModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const selectedEvent = ref<CustomEvent | null>(null)
const modalLoading = ref(false)

// ─── État création ───
const isCreateModalOpen = ref(false)
const categories = ref<Category[]>([])
const villes = ref<Ville[]>([])
const isPublishing = ref(false)
const isSavingDraft = ref(false)
const draftId = ref<string | null>(null)
const titleMaxLength = 100
const descriptionMaxLength = 250

const form = reactive<EventForm>({
  title: '', description: '', location: '', details: '',
  eventDate: '', startDate: '', endDate: '',
  villeId: '', categoryId: '', images: [],
  priceType: 'FREE', price: '', status: 'DRAFT',
})

const isFormValid = computed(() =>
  form.title && form.description && form.location && form.details &&
  form.eventDate && form.startDate && form.villeId && form.images.length > 0 &&
  form.categoryId && (form.priceType === 'FREE' || (form.priceType === 'PAID' && form.price))
)

// ─── Filtres liste ───
const filteredEvents = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return events.value.filter(e => {
    const matchQ = e.title.toLowerCase().includes(q)
    const matchS = filterStatus.value === 'all' || e.status === filterStatus.value
    return matchQ && matchS
  })
})

// ─── Stats ───
const stats = computed(() => [
  { label: 'Total',       value: events.value.length,                                   icon: 'i-heroicons-calendar-days', bg: 'bg-orange-50',  border: 'border-orange-100',  iconColor: 'text-[#ea6c1e]' },
  { label: 'Publiés',    value: events.value.filter(e => e.status === 'Publié').length,  icon: 'i-heroicons-check-circle',  bg: 'bg-emerald-50', border: 'border-emerald-100', iconColor: 'text-emerald-600' },
  { label: 'Brouillons', value: events.value.filter(e => e.status === 'Brouillon').length, icon: 'i-heroicons-document-text', bg: 'bg-amber-50',   border: 'border-amber-100',   iconColor: 'text-amber-600' },
])

// ─── Fetch liste ───
const fetchEvents = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<any[]>('/api/events')
    if (!Array.isArray(data)) throw new Error()
    events.value = data.map(e => ({
      id: e.id, title: e.title,
      categoryId: e.categoryId || 'Sans catégorie',
      date: new Date(e.createdAt).toISOString(),
      status: e.status === 'PUBLISHED' ? 'Publié' : e.status === 'DRAFT' ? 'Brouillon' : 'Publié',
      views: e.views || 0, location: e.location || 'Non spécifié',
      price: e.price || 'Free', duration: e.duration || 'Non spécifié',
      description: e.description || '',
      image: e.images?.length ? e.images[0].url : null,
      images: e.images || [],
      organizer: e.organizer || { name: 'Inconnu', contact: '' },
      createdAt: e.createdAt, updatedAt: e.updatedAt || e.createdAt,
      category: e.category, privilege: e.privilege ?? false,
    }))
  } catch { events.value = [] }
  finally { loading.value = false }
}

// ─── Fetch catégories + villes ───
const loadFormData = async () => {
  try {
    const [catsRes, villesRes] = await Promise.all([
      fetch('/api/categories'), fetch('/api/villes')
    ])
    const catsData = await catsRes.json()
    const villesData = await villesRes.json()
    categories.value = catsData.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon || 'i-heroicons-tag' }))
    villes.value = villesData.map((v: any) => ({ id: v.id, name: v.nomVille }))
  } catch (e) { console.error(e) }
}

// ─── Actions liste ───
const togglePrivilege = async (eventItem: any) => {
  try {
    const updated = await $fetch(`/api/admin/events/${eventItem.id}/feature`, { method: 'PATCH' })
    eventItem.privilege = updated.privilege
  } catch (e) { console.error(e) }
}

const deleteEvent = async (id: number) => {
  if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return
  try {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    events.value = events.value.filter(e => e.id !== id)
  } catch { alert("Impossible de supprimer l'événement ❌") }
}

const updateEvent = async () => {
  if (!selectedEvent.value) return
  try {
    await $fetch(`/api/events/${selectedEvent.value.id}`, {
      method: 'patch',
      body: { title: selectedEvent.value.title, description: selectedEvent.value.description, status: selectedEvent.value.status === 'Publié' ? 'published' : 'draft' },
    })
    isEditModalOpen.value = false
    await fetchEvents()
  } catch (e) { console.error(e) }
}

const loadEventById = async (id: number) => {
  modalLoading.value = true
  try { selectedEvent.value = await $fetch<any>(`/api/events/${id}`) }
  catch (e) { console.error(e) }
  finally { modalLoading.value = false }
}

// ─── Actions création ───
const handleImageUpload = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  form.images = [...form.images, ...Array.from(files)].slice(0, 3)
}

const removeImageAt = (i: number) => form.images.splice(i, 1)

const resetForm = () => {
  Object.assign(form, { title: '', description: '', location: '', details: '', eventDate: '', startDate: '', endDate: '', villeId: '', categoryId: '', images: [], priceType: 'FREE', price: '' })
  draftId.value = null
}

const submit = async (status: 'DRAFT' | 'PUBLISHED') => {
  if (!isFormValid.value && status === 'PUBLISHED') return
  status === 'PUBLISHED' ? (isPublishing.value = true) : (isSavingDraft.value = true)

  const fd = new FormData()
  fd.append('title', form.title); fd.append('description', form.description)
  fd.append('location', form.location); fd.append('details', form.details)
  fd.append('eventDate', form.eventDate); fd.append('startDate', form.startDate)
  fd.append('endDate', form.endDate || ''); fd.append('villeId', form.villeId)
  fd.append('categoryId', form.categoryId); fd.append('priceType', form.priceType)
  fd.append('status', status)
  if (form.priceType === 'PAID') fd.append('price', form.price)
  form.images.forEach(f => fd.append('images', f))

  try {
    const url = draftId.value && status === 'DRAFT' ? `/api/events/${draftId.value}` : '/api/events'
    const method = draftId.value && status === 'DRAFT' ? 'PUT' : 'POST'
    const res = await fetch(url, { method, body: fd, credentials: 'include' })
    if (!res.ok) { const err = await res.json(); throw new Error(err.statusMessage) }
    const data = await res.json()
    if (status === 'DRAFT') draftId.value = data.event.id
    if (status === 'PUBLISHED') { resetForm(); draftId.value = null }
    isCreateModalOpen.value = false
    await fetchEvents()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Une erreur est survenue')
  } finally {
    isPublishing.value = false
    isSavingDraft.value = false
  }
}

const openCreateModal = () => { resetForm(); loadFormData(); isCreateModalOpen.value = true }

// ─── Helpers ───
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const formatDateLong = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const getStatusClasses = (s: string) =>
  s === 'Publié' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'

const getDot = (s: string) => s === 'Publié' ? 'bg-emerald-500' : 'bg-amber-500'

// ─── Lifecycle ───
onMounted(() => {
  fetchEvents()
  const interval = setInterval(fetchEvents, 30000)
  onUnmounted(() => clearInterval(interval))
})

let timeout: ReturnType<typeof setTimeout>
watch([searchQuery, filterStatus], () => {
  clearTimeout(timeout)
  timeout = setTimeout(fetchEvents, 500)
})
</script>

<template>
  <div class="bg-[#f5f3ef] px-4 pt-4 pb-32 sm:px-6 sm:pb-12 font-outfit w-full min-h-screen overflow-y-auto mb-10">
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- ── Stats ── -->
      <div class="grid grid-cols-3 gap-3">
        <div
          v-for="stat in stats" :key="stat.label"
          class="bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide leading-tight">{{ stat.label }}</p>
            <div :class="['w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0', stat.bg, stat.border]">
              <UIcon :name="stat.icon" :class="['w-3.5 h-3.5', stat.iconColor]" />
            </div>
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight">{{ stat.value }}</p>
        </div>
      </div>

      <!-- ── Recherche + Filtres + Bouton créer ── -->
      <div class="flex items-stretch gap-3">

        <!-- Bloc recherche + filtres -->
        <div class="flex-1 bg-white rounded-2xl border border-[#ede8e0] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
          <!-- Search -->
          <div class="relative">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad]"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un événement…"
              class="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#ede8e0] rounded-xl
                     text-[13.5px] text-[#1a1612] placeholder:text-[#c0b8ad]
                     focus:outline-none focus:border-[#ea6c1e] focus:ring-2 focus:ring-[#ea6c1e]/10
                     transition-all font-outfit"
            />
          </div>

          <!-- Filtres pills -->
          <div class="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <template v-if="isAdmin">
              <button @click="filterStatus = 'Recherche'" :class="['filter-pill', filterStatus === 'Recherche' ? 'filter-pill--indigo' : 'filter-pill--off']">
                Recherche
              </button>
            </template>
            <template v-else>
              <button @click="filterStatus = 'all'" :class="['filter-pill', filterStatus === 'all' ? 'filter-pill--orange' : 'filter-pill--off']">
                Tous <span class="ml-1.5 text-[10px] font-bold opacity-70">{{ events.length }}</span>
              </button>
              <button @click="filterStatus = 'Publié'" :class="['filter-pill', filterStatus === 'Publié' ? 'filter-pill--green' : 'filter-pill--off']">
                <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" /> Publiés
              </button>
              <button @click="filterStatus = 'Brouillon'" :class="['filter-pill', filterStatus === 'Brouillon' ? 'filter-pill--amber' : 'filter-pill--off']">
                <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" /> Brouillons
              </button>
            </template>
          </div>
        </div>

        <!-- Bouton créer — même hauteur que le bloc recherche, masqué admin -->
        <button
          v-if="!isAdmin"
          @click="openCreateModal"
          class="btn-create-aside flex-shrink-0"
        >
          <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          <span class="hidden sm:block text-[12.5px] font-semibold leading-tight">Créer<br>un événement</span>
        </button>

      </div>

      <!-- ── Liste événements ── -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-[#ede8e0] flex items-center justify-between bg-[#faf8f5]">
          <p class="text-[13px] font-semibold text-[#1a1612]">
            {{ filteredEvents.length }} événement{{ filteredEvents.length > 1 ? 's' : '' }}
          </p>
          <button @click="fetchEvents" class="flex items-center gap-1.5 text-[11.5px] font-medium text-[#b0a898] hover:text-[#ea6c1e] transition-colors">
            <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>

        <!-- MOBILE cards -->
        <div class="sm:hidden divide-y divide-[#ede8e0]">
          <div v-if="loading" v-for="i in 5" :key="'m-sk-' + i" class="p-4 space-y-2.5 animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#f0ede8] flex-shrink-0" />
              <div class="flex-1 space-y-1.5">
                <USkeleton class="h-3.5 w-3/4 rounded" />
                <USkeleton class="h-3 w-1/2 rounded" />
              </div>
            </div>
          </div>

          <div v-else v-for="event in filteredEvents" :key="event.id" class="p-4 hover:bg-[#faf5ee] transition-colors">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UIcon name="i-heroicons-calendar-days" class="w-4.5 h-4.5 text-[#ea6c1e]" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <p class="font-semibold text-[13px] text-[#1a1612] leading-tight truncate">{{ event.title }}</p>
                  <span :class="['status-badge flex-shrink-0', getStatusClasses(event.status)]">
                    <span :class="['w-1.5 h-1.5 rounded-full', getDot(event.status)]" />
                    {{ event.status }}
                  </span>
                </div>
                <div class="flex items-center gap-2.5 text-[11px] text-[#b0a898] mb-3">
                  <span>{{ event.category?.name }}</span><span>·</span>
                  <span>{{ formatDate(event.createdAt) }}</span>
                  <span class="flex items-center gap-1 ml-auto font-semibold text-[#ea6c1e]">
                    <UIcon name="i-heroicons-eye" class="w-3 h-3" />{{ event.views }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button v-if="isAdmin" @click="togglePrivilege(event)" :class="['action-btn-sm', event.privilege ? 'text-amber-500 bg-amber-50 border-amber-200' : 'text-[#c0b8ad] bg-[#faf8f5] border-[#ede8e0]']">
                    <UIcon name="i-heroicons-star" class="w-3.5 h-3.5" />
                  </button>
                  <button @click="loadEventById(event.id); isPreviewModalOpen = true" class="action-btn-sm text-indigo-500 bg-indigo-50 border-indigo-100">
                    <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
                  </button>
                  <button v-if="!isAdmin" @click="loadEventById(event.id); isEditModalOpen = true" class="action-btn-sm text-[#ea6c1e] bg-orange-50 border-orange-100">
                    <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
                  </button>
                  <button @click="deleteEvent(event.id)" class="action-btn-sm text-red-500 bg-red-50 border-red-100">
                    <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!loading && filteredEvents.length === 0" class="py-14 text-center">
            <UIcon name="i-heroicons-inbox" class="w-10 h-10 text-[#d4cec5] mx-auto mb-3" />
            <p class="text-[#b0a898] text-sm">Aucun événement trouvé</p>
          </div>
        </div>

        <!-- DESKTOP tableau -->
        <div class="hidden sm:block overflow-x-auto overflow-y-auto max-h-[600px] mb-4">
          <table class="w-full">
            <thead class="bg-[#f5f0e8] border-b border-[#ede8e0]">
              <tr>
                <th class="th">Événement</th>
                <th class="th hidden md:table-cell">Catégorie</th>
                <th class="th hidden lg:table-cell">Lieu</th>
                <th class="th text-center">Vues</th>
                <th class="th text-center hidden md:table-cell">Statut</th>
                <th class="th hidden md:table-cell">Date</th>
                <th class="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#ede8e0]">
              <tr v-if="loading" v-for="i in 6" :key="'sk-' + i" class="animate-pulse">
                <td class="px-5 py-4"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-[#f0ede8]" /><div class="space-y-1.5"><USkeleton class="h-3.5 w-40 rounded" /><USkeleton class="h-3 w-24 rounded" /></div></div></td>
                <td class="px-5 py-4 hidden md:table-cell"><USkeleton class="h-3.5 w-24 rounded" /></td>
                <td class="px-5 py-4 hidden lg:table-cell"><USkeleton class="h-3.5 w-24 rounded" /></td>
                <td class="px-5 py-4 text-center"><USkeleton class="h-3.5 w-10 mx-auto rounded" /></td>
                <td class="px-5 py-4 text-center hidden md:table-cell"><USkeleton class="h-5 w-20 mx-auto rounded-full" /></td>
                <td class="px-5 py-4 hidden md:table-cell"><USkeleton class="h-3.5 w-20 rounded" /></td>
                <td class="px-5 py-4"><USkeleton class="h-7 w-24 ml-auto rounded-lg" /></td>
              </tr>

              <tr v-else v-for="event in filteredEvents" :key="event.id" class="hover:bg-[#faf5ee] transition-colors group">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                      <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-[#ea6c1e]" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-[13px] text-[#1a1612] leading-tight truncate max-w-[200px]">{{ event.title }}</p>
                      <p class="text-[11px] text-[#b0a898] line-clamp-1">{{ event.description }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5 hidden md:table-cell"><span class="text-[12.5px] text-[#8a8078]">{{ event.category?.name }}</span></td>
                <td class="px-5 py-3.5 hidden lg:table-cell">
                  <span class="flex items-center gap-1 text-[12.5px] text-[#8a8078]">
                    <UIcon name="i-heroicons-map-pin" class="w-3 h-3 text-[#c0b8ad]" />{{ event.location }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-center"><span class="font-bold text-[13px] text-[#ea6c1e]">{{ event.views }}</span></td>
                <td class="px-5 py-3.5 text-center hidden md:table-cell">
                  <span v-if="!isAdmin" :class="['status-badge', getStatusClasses(event.status)]">
                    <span :class="['w-1.5 h-1.5 rounded-full', getDot(event.status)]" />{{ event.status }}
                  </span>
                  <span v-else class="text-[12px] text-[#b0a898]">—</span>
                </td>
                <td class="px-5 py-3.5 hidden md:table-cell"><span class="text-[12px] text-[#8a8078]">{{ formatDate(event.createdAt) }}</span></td>
                <td class="px-5 py-3.5">
                  <div class="flex items-center justify-end gap-1.5">
                    <div v-if="isAdmin" class="relative group/tip">
                      <button @click="togglePrivilege(event)" :class="['action-btn', event.privilege ? 'text-amber-500 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-[#c0b8ad] bg-white border-[#ede8e0] hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50']">
                        <UIcon name="i-heroicons-star" class="w-3.5 h-3.5" />
                      </button>
                      <div class="tooltip">{{ event.privilege ? 'Retirer' : 'Privilégier' }}</div>
                    </div>
                    <div class="relative group/tip">
                      <button @click="loadEventById(event.id); isPreviewModalOpen = true" class="action-btn text-indigo-500 bg-white border-[#ede8e0] hover:bg-indigo-50 hover:border-indigo-200">
                        <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
                      </button>
                      <div class="tooltip">Voir</div>
                    </div>
                    <div v-if="!isAdmin" class="relative group/tip">
                      <button @click="loadEventById(event.id); isEditModalOpen = true" class="action-btn text-[#ea6c1e] bg-white border-[#ede8e0] hover:bg-orange-50 hover:border-orange-200">
                        <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
                      </button>
                      <div class="tooltip">Modifier</div>
                    </div>
                    <div class="relative group/tip">
                      <button @click="deleteEvent(event.id)" class="action-btn text-red-400 bg-white border-[#ede8e0] hover:bg-red-50 hover:border-red-200">
                        <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
                      </button>
                      <div class="tooltip">Supprimer</div>
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-if="!loading && filteredEvents.length === 0">
                <td colspan="7" class="py-14 text-center">
                  <UIcon name="i-heroicons-inbox" class="w-10 h-10 text-[#d4cec5] mx-auto mb-3" />
                  <p class="text-[#b0a898] text-sm">Aucun événement trouvé</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════
         MODAL CRÉER UN ÉVÉNEMENT
    ══════════════════════════════════ -->
    <Transition name="fade">
      <div
        v-if="isCreateModalOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        @click.self="isCreateModalOpen = false"
      >
        <Transition name="slide-up">
          <div class="modal-sheet sm:max-w-3xl">

            <!-- Header -->
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Créer un événement</h3>
                  <p class="text-xs text-orange-100/70">Partagez votre événement avec la communauté</p>
                </div>
              </div>
              <button @click="isCreateModalOpen = false" class="modal-close">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">

              <!-- Titre -->
              <div class="field">
                <div class="flex items-center justify-between">
                  <label class="field-label">Titre <span class="text-red-400">*</span></label>
                  <span class="text-[11px] text-[#b0a898]">{{ form.title.length }}/{{ titleMaxLength }}</span>
                </div>
                <input v-model="form.title" :maxlength="titleMaxLength" type="text" placeholder="Ex: Concert Jazz au clair de lune" class="field-input" />
              </div>

              <!-- Description -->
              <div class="field">
                <div class="flex items-center justify-between">
                  <label class="field-label">Description courte <span class="text-red-400">*</span></label>
                  <span class="text-[11px] text-[#b0a898]">{{ form.description.length }}/{{ descriptionMaxLength }}</span>
                </div>
                <textarea v-model="form.description" :maxlength="descriptionMaxLength" rows="3" placeholder="Décrivez votre événement en quelques mots…" class="field-input resize-none" />
              </div>

              <!-- Détails -->
              <div class="field">
                <div class="flex items-center justify-between">
                  <label class="field-label">Détails <span class="text-red-400">*</span></label>
                  <span class="text-[11px] text-[#b0a898]">{{ form.details?.length || 0 }}/500</span>
                </div>
                <textarea v-model="form.details" rows="3" placeholder="Informations supplémentaires sur l'événement…" class="field-input resize-none" />
              </div>

              <!-- Prix -->
              <div class="field">
                <label class="field-label">Type de prix</label>
                <div class="flex gap-4 mt-1">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="FREE" v-model="form.priceType" class="accent-[#ea6c1e]" />
                    <span class="text-[13px] text-[#4a3f32]">Gratuit</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="PAID" v-model="form.priceType" class="accent-[#ea6c1e]" />
                    <span class="text-[13px] text-[#4a3f32]">Payant</span>
                  </label>
                </div>
              </div>

              <div v-if="form.priceType === 'PAID'" class="field">
                <label class="field-label">Prix (FCFA) <span class="text-red-400">*</span></label>
                <input v-model="form.price" type="number" min="0" step="500" placeholder="Ex: 5000" class="field-input" />
              </div>

              <!-- Lieu + Ville -->
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="field">
                  <label class="field-label">Lieu <span class="text-red-400">*</span></label>
                  <input v-model="form.location" type="text" placeholder="Ex: Palais des Congrès" class="field-input" />
                </div>
                <div class="field">
                  <label class="field-label">Ville <span class="text-red-400">*</span></label>
                  <select v-model="form.villeId" class="field-input">
                    <option value="" disabled>Sélectionnez une ville</option>
                    <option v-for="v in villes" :key="v.id" :value="v.id">{{ v.name }}</option>
                  </select>
                </div>
              </div>

              <!-- Date + Horaires -->
              <div class="grid sm:grid-cols-3 gap-4">
                <div class="field">
                  <label class="field-label">Date <span class="text-red-400">*</span></label>
                  <input v-model="form.eventDate" type="date" class="field-input" />
                </div>
                <div class="field">
                  <label class="field-label">Heure début <span class="text-red-400">*</span></label>
                  <input v-model="form.startDate" type="time" class="field-input" />
                </div>
                <div class="field">
                  <label class="field-label">Heure fin</label>
                  <input v-model="form.endDate" type="time" class="field-input" />
                </div>
              </div>

              <!-- Catégorie -->
              <div class="field">
                <label class="field-label">Catégorie <span class="text-red-400">*</span></label>
                <select v-model="form.categoryId" class="field-input">
                  <option value="" disabled>Sélectionnez une catégorie</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>

              <!-- Aperçu images -->
              <div v-if="form.images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="(img, idx) in form.images" :key="idx"
                  class="relative bg-[#faf8f5] border border-[#ede8e0] rounded-xl p-3 group"
                >
                  <p class="text-[12px] font-medium text-[#1a1612] truncate">{{ img.name }}</p>
                  <p class="text-[11px] text-[#b0a898]">{{ (img.size / 1024 / 1024).toFixed(2) }} MB</p>
                  <button
                    @click="removeImageAt(idx)" type="button"
                    class="absolute top-1.5 right-1.5 w-5 h-5 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-400 hover:bg-red-100 transition-all"
                  >
                    <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Upload zone -->
              <label v-if="form.images.length < 3" class="group cursor-pointer block">
                <div class="border-2 border-dashed border-[#d4cec5] rounded-xl p-7 text-center
                            hover:border-[#ea6c1e] hover:bg-orange-50/30 transition-all duration-200">
                  <UIcon name="i-heroicons-photo" class="w-9 h-9 mx-auto text-[#c0b8ad] group-hover:text-[#ea6c1e] transition-colors mb-2" />
                  <p class="text-[13px] font-medium text-[#8a8078] group-hover:text-[#ea6c1e]">
                    Cliquez pour ajouter jusqu'à 3 images
                  </p>
                  <p class="text-[11px] text-[#b0a898] mt-1">PNG, JPG jusqu'à 10MB</p>
                </div>
                <input type="file" accept="image/*" multiple class="hidden" @change="handleImageUpload" />
              </label>

              <!-- Aperçu date -->
              <div v-if="form.eventDate" class="flex items-start gap-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-[#ea6c1e] flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-[13px] font-medium text-[#4a3f32]">
                    Votre événement aura lieu le
                    <span class="font-bold text-[#ea6c1e]">{{ formatDateLong(form.eventDate) }}</span>
                  </p>
                  <p v-if="form.startDate" class="text-[11px] text-[#b0a898] mt-0.5">
                    De {{ form.startDate }}<span v-if="form.endDate"> à {{ form.endDate }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
              <p class="text-[11px] text-[#b0a898] mr-auto hidden sm:block"><span class="text-red-400">*</span> Champs obligatoires</p>
              <button @click="isCreateModalOpen = false" class="btn-ghost">Annuler</button>
              <button @click="submit('DRAFT')" :disabled="isSavingDraft" class="btn-draft">
                <UIcon v-if="isSavingDraft" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
                <UIcon v-else name="i-heroicons-document-text" class="w-3.5 h-3.5" />
                Brouillon
              </button>
              <button @click="submit('PUBLISHED')" :disabled="!isFormValid || isPublishing" class="btn-primary">
                <UIcon v-if="isPublishing" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                <UIcon v-else name="i-heroicons-check" class="w-4 h-4" />
                {{ isPublishing ? 'Publication…' : 'Publier' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══════════════════════════════════
         MODAL PREVIEW
    ══════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="isPreviewModalOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" @click.self="isPreviewModalOpen = false">
        <Transition name="slide-up">
          <div v-if="selectedEvent" class="modal-sheet sm:max-w-2xl">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <UIcon name="i-heroicons-eye" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Aperçu de l'événement</h3>
                  <p class="text-xs text-orange-100/70">Détails complets</p>
                </div>
              </div>
              <button @click="isPreviewModalOpen = false" class="modal-close"><UIcon name="i-heroicons-x-mark" class="w-4 h-4" /></button>
            </div>
            <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div v-if="modalLoading" class="space-y-3">
                <USkeleton class="h-5 w-full rounded" /><USkeleton class="h-4 w-2/3 rounded" />
              </div>
              <template v-else>
                <div v-if="selectedEvent.images?.length" class="space-y-2">
                  <div v-for="img in selectedEvent.images" :key="img.id" class="rounded-xl overflow-hidden">
                    <img :src="img.url" :alt="selectedEvent.title" class="w-full h-48 object-cover" />
                  </div>
                </div>
                <div class="info-block"><div class="info-label"><UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />Titre</div><p class="text-[14px] font-bold text-[#1a1612]">{{ selectedEvent.title }}</p></div>
                <div class="info-block"><div class="info-label"><UIcon name="i-heroicons-bars-3-bottom-left" class="w-3.5 h-3.5" />Description</div><p class="text-[13px] text-[#4a3f32] leading-relaxed">{{ selectedEvent.description }}</p></div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="info-block"><div class="info-label"><UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />Date</div><p class="text-[13px] font-semibold text-[#1a1612]">{{ formatDate(selectedEvent.createdAt) }}</p></div>
                  <div class="info-block"><div class="info-label"><UIcon name="i-heroicons-tag" class="w-3.5 h-3.5" />Catégorie</div><p class="text-[13px] font-semibold text-[#1a1612]">{{ selectedEvent.category?.name }}</p></div>
                  <div class="info-block"><div class="info-label"><UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />Statut</div><span :class="['status-badge', getStatusClasses(selectedEvent.status)]"><span :class="['w-1.5 h-1.5 rounded-full', getDot(selectedEvent.status)]" />{{ selectedEvent.status }}</span></div>
                  <div class="info-block"><div class="info-label"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />Vues</div><p class="text-[13px] font-bold text-[#ea6c1e]">{{ selectedEvent.views?.toLocaleString() }}</p></div>
                </div>
              </template>
            </div>
            <div class="modal-footer"><button @click="isPreviewModalOpen = false" class="btn-ghost">Fermer</button></div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══════════════════════════════════
         MODAL EDIT
    ══════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="isEditModalOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" @click.self="isEditModalOpen = false">
        <Transition name="slide-up">
          <div v-if="selectedEvent" class="modal-sheet sm:max-w-2xl">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Modifier l'événement</h3>
                  <p class="text-xs text-orange-100/70">Mettez à jour les informations</p>
                </div>
              </div>
              <button @click="isEditModalOpen = false" class="modal-close"><UIcon name="i-heroicons-x-mark" class="w-4 h-4" /></button>
            </div>
            <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div class="field"><label class="field-label">Titre <span class="text-red-400">*</span></label><input v-model="selectedEvent.title" type="text" class="field-input" /></div>
              <div class="field"><label class="field-label">Description <span class="text-red-400">*</span></label><textarea v-model="selectedEvent.description" rows="4" class="field-input resize-none" /><p class="text-[11px] text-[#b0a898] mt-1">{{ selectedEvent.description.length }} caractères</p></div>
              <div class="field"><label class="field-label">Statut <span class="text-red-400">*</span></label><select v-model="selectedEvent.status" class="field-input"><option value="Publié">Publié</option><option value="Brouillon">Brouillon</option></select></div>
              <div class="field"><label class="field-label">Lieu <span class="text-red-400">*</span></label><input v-model="selectedEvent.location" type="text" class="field-input" /></div>
              <div class="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p class="text-[12.5px] text-blue-700">Les modifications seront visibles immédiatement si le statut est <strong>Publié</strong>.</p>
              </div>
            </div>
            <div class="modal-footer">
              <button @click="isEditModalOpen = false" class="btn-ghost">Annuler</button>
              <button @click="updateEvent" class="btn-primary"><UIcon name="i-heroicons-check" class="w-4 h-4" />Enregistrer</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1); }
.slide-up-enter-from { opacity: 0; transform: translateY(40px) scale(0.97); }
.slide-up-leave-to  { opacity: 0; transform: translateY(20px) scale(0.97); }

/* ── Modales ── */
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

/* ── Boutons ── */
.btn-create-aside {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 7px; padding: 0 22px; border-radius: 20px; align-self: stretch;
  min-width: 80px; text-align: center; color: white;
  background: linear-gradient(135deg, #ea6c1e, #5b47e0);
  border: none; cursor: pointer; transition: opacity 0.15s;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 4px 18px rgba(234,108,30,0.28);
}
.btn-create-aside:hover { opacity: 0.9; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 12px;
  min-width: 80px; text-align: center; color: white;
  background: linear-gradient(135deg, #ea6c1e, #5b47e0);
  border: none; cursor: pointer; transition: opacity 0.15s;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 4px 18px rgba(234,108,30,0.28);
}
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-draft {
  display: inline-flex; align-items: center; gap: 7px;
  gap: 7px; padding: 0 22px; border-radius: 20px; align-self: stretch;
  font-size: 13px; font-weight: 500; color: #4a3f32;
  background: #f5f0e8; border: 1px solid #ede8e0;
  cursor: pointer; transition: background 0.15s;
  font-family: 'Outfit', sans-serif;
}
.btn-draft:hover:not(:disabled) { background: #ede8e0; }
.btn-draft:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  padding: 9px 18px; border-radius: 12px;
  font-size: 13px; font-weight: 500; color: #8a8078;
  background: white; border: 1px solid #ede8e0;
  transition: background 0.15s; font-family: 'Outfit', sans-serif; cursor: pointer;
}
.btn-ghost:hover { background: #f5f0e8; }

/* ── Champs ── */
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12.5px; font-weight: 600; color: #4a3f32; }
.field-input {
  width: 100%; padding: 10px 14px;
  background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px;
  font-size: 13.5px; color: #1a1612; font-family: 'Outfit', sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s; outline: none;
}
.field-input:focus { border-color: #ea6c1e; box-shadow: 0 0 0 3px rgba(234,108,30,0.1); }
.field-input::placeholder { color: #c0b8ad; }

/* ── Info blocks modal ── */
.info-block { background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px; padding: 12px 14px; }
.info-label { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #b0a898; margin-bottom: 6px; }

/* ── Status badge ── */
.status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }

/* ── Action buttons ── */
.action-btn { width: 32px; height: 32px; border-radius: 9px; border-width: 1px; border-style: solid; display: flex; align-items: center; justify-content: center; transition: all 0.15s; cursor: pointer; }
.action-btn-sm { width: 30px; height: 30px; border-radius: 9px; border-width: 1px; border-style: solid; display: flex; align-items: center; justify-content: center; transition: all 0.15s; cursor: pointer; }

/* ── Tooltip ── */
.tooltip { position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: #1a1612; color: white; font-size: 10px; font-weight: 500; font-family: 'Outfit', sans-serif; padding: 4px 8px; border-radius: 7px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.15s; z-index: 20; }
.group\/tip:hover .tooltip { opacity: 1; }

/* ── Table header ── */
.th { padding: 10px 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: #8a8078; text-align: left; }

/* ── Filter pills ── */
.filter-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 20px; font-size: 12.5px; font-weight: 500; white-space: nowrap; border-width: 1px; border-style: solid; transition: all 0.15s; cursor: pointer; font-family: 'Outfit', sans-serif; }
.filter-pill--off    { background: #faf8f5; color: #8a8078; border-color: #ede8e0; }
.filter-pill--off:hover { border-color: #c0b8ad; color: #4a3f32; }
.filter-pill--orange { background: #ea6c1e; color: white; border-color: #ea6c1e; }
.filter-pill--green  { background: #16a34a; color: white; border-color: #16a34a; }
.filter-pill--amber  { background: #d97706; color: white; border-color: #d97706; }
.filter-pill--indigo { background: #5b47e0; color: white; border-color: #5b47e0; }

/* ── Scrollbar ── */
.scrollbar-none::-webkit-scrollbar { display: none; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
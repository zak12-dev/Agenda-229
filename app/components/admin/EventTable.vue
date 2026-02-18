<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import admin from '~~/middleware/admin'
import { watch } from 'vue'

interface EventImage {
  id: string
  url: string
}

interface CustomEvent {
  id: number
  title: string
  categoryId: string
  date: string
  location: string
  price: number | 'Free'
  duration: string
  description: string
  image: string | null
  images: EventImage[]

  organizer: {
    name: string
    contact: string
  }
  views: number
  createdAt: string
  updatedAt: string
  status: string
  category: {
    name: string
    id: string
  }
}

const { session } = useAuth()
const searchQuery = ref('')
const filterStatus = ref<'all' | 'Publié' | 'Brouillon' | 'Recherche'>('Publié')
const isAdmin = computed(() => session.value?.user.roleId === 1)
const events = ref<CustomEvent[]>([])
const loading = ref(true)
const error = ref('')
const isEditModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const selectedEvent = ref<CustomEvent | null>(null)
const modalLoading = ref(false)
const viewMode = ref<'grid' | 'list'>('list')

const filteredEvents = computed(() => {
  const query = searchQuery.value.toLowerCase()

  return events.value.filter((event) => {
    const matchesQuery = event.title.toLowerCase().includes(query)
    const matchesStatus = filterStatus.value === 'all' || event.status === filterStatus.value
    return matchesQuery && matchesStatus
  })
})

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (selectedEvent.value) {
    selectedEvent.value.image = URL.createObjectURL(file)
  }
}

const fetchEvents = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<any[]>('/api/events')

    if (!Array.isArray(data)) {
      throw new Error('Les données reçues ne sont pas un tableau.')
    }

    events.value = data.map((event) => ({
      id: event.id,
      title: event.title,
      categoryId: event.categoryId || 'Sans catégorie',
      date: new Date(event.createdAt).toISOString(),
      status:
        event.status === 'PUBLISHED' ? 'Publié' : event.status === 'DRAFT' ? 'Brouillon' : 'Publié',
      views: event.views || 0,
      location: event.location || 'Non spécifié',
      price: event.price || 'Free',
      duration: event.duration || 'Non spécifié',
      description: event.description || 'Pas de description',
      image: event.images.length ? event.images[0].url : 'default.jpg',
      images: event.images,
      organizer: event.organizer || { name: 'Inconnu', contact: 'Non spécifié' },
      createdAt: event.createdAt,
      updatedAt: event.updatedAt || event.createdAt,
      category: event.category,
    }))
    console.log('Event:', events.value)
  } catch (err: any) {
    console.error('Erreur lors de la récupération des événements:', err)
    error.value = 'Impossible de récupérer les événements.'
    events.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEvents() // fetch initial

  const interval = setInterval(fetchEvents, 30000) // toutes les 30 secondes
  onUnmounted(() => clearInterval(interval)) // nettoyage
})

let timeout: ReturnType<typeof setTimeout>

watch([searchQuery, filterStatus], () => {
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    fetchEvents()
  }, 500)
})

const deleteEvent = async (id: number) => {
  try {
    const confirmed = confirm('Voulez-vous vraiment supprimer cet événement ?')
    if (!confirmed) return

    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Erreur lors de la suppression')

    events.value = events.value.filter((a) => a.id !== id)
    alert('Événement supprimé avec succès ✅')
  } catch (error) {
    console.error(error)
    alert("Impossible de supprimer l'événement ❌")
  }
}

const updateEvent = async () => {
  if (!selectedEvent.value) return

  const payload = {
    title: selectedEvent.value.title,
    description: selectedEvent.value.description,
    status: selectedEvent.value.status === 'Publié' ? 'published' : 'draft',
  }

  try {
    await $fetch(`/api/events/${selectedEvent.value.id}`, {
      method: 'patch',
      body: payload,
    })
    isEditModalOpen.value = false
    await fetchEvents()
    alert('Événement mis à jour ✅')
  } catch (e) {
    console.error(e)
    alert('Erreur lors de la mise à jour ❌')
  }
}

const loadEventById = async (id: number) => {
  modalLoading.value = true
  try {
    const event = await $fetch<any>(`/api/events/${id}`)
    selectedEvent.value = event
  } catch (e) {
    console.error(e)
    alert("Impossible de charger l'événement")
  } finally {
    modalLoading.value = false
  }
}

const stats = computed(() => [
  {
    label: 'Total',
    value: events.value.length,
    icon: 'i-heroicons-calendar-days',
    color: 'orange',
  },
  {
    label: 'Publiés',
    value: events.value.filter((a) => a.status === 'Publié').length,
    icon: 'i-heroicons-check-circle',
    color: 'green',
  },
  {
    label: 'Brouillons',
    value: events.value.filter((a) => a.status === 'Brouillon').length,
    icon: 'i-heroicons-document-text',
    color: 'amber',
  },
])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 -mt-2 overflow-auto">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!--<div class="flex bg-white border border-gray-200 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-1.5 rounded text-sm font-medium transition-all',
                viewMode === 'grid'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1.5 rounded text-sm font-medium transition-all',
                viewMode === 'list'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
            </button>
          </div> 
          <button
            @click="fetchEvents"
            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          </button>-->
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="bg-white rounded-xl p-2 border border-gray-200 shadow-sm"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-600">{{ stat.label }}</span>
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                stat.color === 'orange'
                  ? 'bg-orange-100'
                  : stat.color === 'green'
                    ? 'bg-green-100'
                    : stat.color === 'amber'
                      ? 'bg-amber-100'
                      : 'bg-blue-100',
              ]"
            >
              <UIcon
                :name="stat.icon"
                :class="[
                  'w-5 h-5',
                  stat.color === 'orange'
                    ? 'text-orange-600'
                    : stat.color === 'green'
                      ? 'text-green-600'
                      : stat.color === 'amber'
                        ? 'text-amber-600'
                        : 'text-blue-600',
                ]"
              />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom d'évènements"
            class="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <!-- Filters -->
        <!-- Filters -->
        <div class="flex gap-2 overflow-x-auto">
          <!-- Si admin, on affiche seulement le bouton Recherche -->
          <button
            v-if="isAdmin"
            @click="filterStatus = 'Recherche'"
            :class="[
              'px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
              filterStatus === 'Recherche'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300',
            ]"
          >
            Recherche
          </button>

          <!-- Si pas admin, on affiche les autres boutons -->
          <template v-else>
            <button
              @click="filterStatus = 'all'"
              :class="[
                'px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
                filterStatus === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300',
              ]"
            >
              Tous
            </button>

            <button
              @click="filterStatus = 'Publié'"
              :class="[
                'px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
                filterStatus === 'Publié'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300',
              ]"
            >
              Publié
            </button>

            <button
              @click="filterStatus = 'Brouillon'"
              :class="[
                'px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
                filterStatus === 'Brouillon'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300',
              ]"
            >
              Brouillon
            </button>
          </template>
        </div>
      </div>

      <!-- Events Grid/List -->
      <div class="max-h-[500px] overflow-y-auto">
        <!-- Grid View -->
        <div
          v-if="viewMode === 'grid'"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <!-- Loading -->
          <div
            v-if="loading"
            v-for="i in 6"
            :key="'load-' + i"
            class="bg-white rounded-xl border border-gray-200 p-5"
          >
            <USkeleton class="h-40 w-full rounded-lg mb-4" />
            <USkeleton class="h-5 w-3/4 mb-2" />
            <USkeleton class="h-4 w-1/2" />
          </div>

          <!-- Cards -->
          <div
            v-else
            v-for="event in filteredEvents"
            :key="event.id"
            class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
          >
            <div
              class="h-40 bg-gradient-to-br from-orange-400 to-indigo-400 relative overflow-hidden"
            >
              <div class="absolute inset-0 bg-black/20"></div>
              <div class="absolute top-3 right-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    event.status === 'Publié'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white',
                  ]"
                >
                  {{ event.status }}
                </span>
              </div>
              <div class="absolute bottom-3 left-3 text-white">
                <p class="text-xs opacity-80">{{ formatDate(event.createdAt) }}</p>
              </div>
            </div>

            <div class="p-5">
              <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">{{ event.title }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ event.category }}</p>
              <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ event.description }}</p>

              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center gap-1 text-sm text-gray-500">
                  <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                  <span>{{ event.views }}</span>
                </div>

                <div class="flex items-center gap-1">
                  <button
                    @click="
                      loadEventById(event.id);
                      isPreviewModalOpen = true
                    "
                    class="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-all"
                    title="Voir"
                  >
                    <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                  </button>
                  <button
                    @click="
                      loadEventById(event.id);
                      isPreviewModalOpen = true
                    "
                    class="p-1.5 hover:bg-orange-50 rounded text-orange-600 transition-all"
                    title="Modifier"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteEvent(event.id)"
                    class="p-1.5 hover:bg-red-50 rounded text-red-600 transition-all"
                    title="Supprimer"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && events.length === 0" class="col-span-full text-center py-16">
            <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-600">Aucun événement</p>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
          <!-- Loading -->
          <div v-if="loading" v-for="i in 5" :key="'list-load-' + i" class="p-5">
            <div class="flex items-center gap-4">
              <USkeleton class="h-12 w-12 rounded" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-1/2" />
                <USkeleton class="h-3 w-1/3" />
              </div>
            </div>
          </div>

          <!-- List Items -->
          <div
            v-else
            v-for="event in filteredEvents"
            :key="event.id"
            class="p-5 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <UIcon name="i-heroicons-calendar" class="w-6 h-6 text-orange-600" />
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900">{{ event.title }}</h3>
                <p class="text-sm text-gray-600">
                  {{ event.category.name }} • {{ formatDate(event.createdAt) }}
                </p>
              </div>

              <div class="flex items-center gap-3">
                <span
                  v-if="!isAdmin"
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    event.status === 'Publié'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700',
                  ]"
                >
                  {{ event.status }}
                </span>

                <div class="flex items-center gap-1">
                  <button
                    @click="
                      loadEventById(event.id);
                      isPreviewModalOpen = true
                    "
                    class="p-2 hover:bg-blue-50 rounded text-blue-600 transition-all"
                    title="Voir"
                  >
                    <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                  </button>
                  <button
                    v-if="!isAdmin"
                    @click="
                      loadEventById(event.id);
                      isEditModalOpen = true
                    "
                    class="p-2 hover:bg-orange-50 rounded text-orange-600 transition-all"
                    title="Modifier"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteEvent(event.id)"
                    class="p-2 hover:bg-red-50 rounded text-red-600 transition-all"
                    title="Supprimer"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && events.length === 0" class="p-12 text-center">
            <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-600">Aucun événement</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ MODAL PREVIEW - Vrai Modal Centré -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isPreviewModalOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="isPreviewModalOpen = false"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="selectedEvent"
            class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-orange-600 to-indigo-600 px-6 py-5 sticky top-0 z-10">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  >
                    <UIcon name="i-heroicons-eye" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white">Aperçu de l'événement</h3>
                    <p class="text-sm text-orange-100">Détails complets</p>
                  </div>
                </div>
                <button
                  @click="isPreviewModalOpen = false"
                  class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6">
              <div v-if="modalLoading" class="space-y-4">
                <USkeleton class="h-6 w-full rounded" />
                <USkeleton class="h-4 w-2/3 rounded" />
                <USkeleton class="h-4 w-3/4 rounded" />
              </div>

              <div v-else class="space-y-6">
                <!-- Image si disponible -->
                <!-- Si plusieurs images -->
                <div v-if="selectedEvent.images && selectedEvent.images.length" class="space-y-2">
                  <div
                    v-for="img in selectedEvent.images"
                    :key="img.id"
                    class="rounded-xl overflow-hidden"
                  >
                    <img
                      :src="img.url"
                      :alt="selectedEvent.title"
                      class="w-full h-64 object-cover"
                    />
                  </div>
                </div>

                <!-- Informations principales -->
                <div class="grid gap-4">
                  <div class="bg-gray-50 rounded-xl p-4">
                    <div class="flex items-center gap-2 text-gray-600 mb-2">
                      <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                      <span class="text-xs font-semibold uppercase tracking-wide">Titre</span>
                    </div>
                    <p class="text-lg font-bold text-gray-900">{{ selectedEvent.title }}</p>
                  </div>

                  <div class="bg-gray-50 rounded-xl p-4">
                    <div class="flex items-center gap-2 text-gray-600 mb-2">
                      <UIcon name="i-heroicons-bars-3-bottom-left" class="w-4 h-4" />
                      <span class="text-xs font-semibold uppercase tracking-wide">Description</span>
                    </div>
                    <p class="text-gray-700 leading-relaxed">{{ selectedEvent.description }}</p>
                  </div>

                  <!-- Grille d'infos -->
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="bg-gray-50 rounded-xl p-4">
                      <div class="flex items-center gap-2 text-gray-600 mb-2">
                        <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                        <span class="text-xs font-semibold uppercase tracking-wide">Date</span>
                      </div>
                      <p class="text-gray-900 font-semibold">
                        {{ formatDate(selectedEvent.createdAt) }}
                      </p>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-4">
                      <div class="flex items-center gap-2 text-gray-600 mb-2">
                        <UIcon name="i-heroicons-tag" class="w-4 h-4" />
                        <span class="text-xs font-semibold uppercase tracking-wide">Catégorie</span>
                      </div>
                      <p class="text-gray-900 font-semibold">{{ selectedEvent.category.name }}</p>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-4">
                      <div class="flex items-center gap-2 text-gray-600 mb-2">
                        <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
                        <span class="text-xs font-semibold uppercase tracking-wide">Statut</span>
                      </div>
                      <span
                        :class="[
                          'inline-flex px-3 py-1 rounded-full text-sm font-semibold',
                          selectedEvent.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700',
                        ]"
                      >
                        {{ selectedEvent.status }}
                      </span>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-4">
                      <div class="flex items-center gap-2 text-gray-600 mb-2">
                        <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                        <span class="text-xs font-semibold uppercase tracking-wide">Vues</span>
                      </div>
                      <p class="text-gray-900 font-semibold">
                        {{ selectedEvent.views.toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                @click="isPreviewModalOpen = false"
                class="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ✅ MODAL EDIT - Vrai Modal Centré -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="isEditModalOpen = false"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="selectedEvent"
            class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-orange-600 to-indigo-600 px-6 py-5 sticky top-0 z-10">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white">Modifier l'événement</h3>
                    <p class="text-sm text-orange-100">Mettez à jour les informations</p>
                  </div>
                </div>
                <button
                  @click="isEditModalOpen = false"
                  class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Titre de l'événement <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="selectedEvent.title"
                  type="text"
                  placeholder="Ex: Concert Live Afrobeat"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="selectedEvent.description"
                  rows="5"
                  placeholder="Décrivez votre événement..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">
                  {{ selectedEvent!.description.length }} caractères
                </p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Statut de publication <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="selectedEvent.status"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="Publié">Publié</option>
                  <option value="Brouillon">Brouillon</option>
                </select>
              </div>

              <!-- Catégorie -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2"
                  >Catégorie <span class="text-red-500">*</span></label
                >
                <input
                  v-model="selectedEvent.categoryId"
                  type="text"
                  placeholder="Ex: Concert, Sport, Théâtre..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Date -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2"
                  >Date <span class="text-red-500">*</span></label
                >
                <input
                  v-model="selectedEvent.date"
                  type="date"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <!-- Image -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Image principale <span class="text-red-500">*</span>
                </label>

                <!-- Si aucune image sélectionnée -->
                <label v-if="!selectedEvent.image" class="group cursor-pointer block">
                  <div
                    class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-orange-400 dark:hover:border-indigo-600 hover:bg-orange-50/30 dark:hover:bg-indigo-950/20 transition-all duration-200"
                  >
                    <svg
                      class="w-10 h-10 mx-auto text-gray-400 group-hover:text-orange-500 dark:group-hover:text-indigo-400 transition-colors mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p
                      class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-indigo-400"
                    >
                      Cliquez pour choisir une image
                    </p>
                    <p class="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    @change="selectedEvent.image = $event.target.files[0]"
                    class="hidden"
                  />
                </label>

                <!-- Si une image est sélectionnée -->
                <div v-else class="relative group">
                  <div
                    class="border-2 border-orange-300 dark:border-indigo-700 rounded-xl p-4 bg-orange-50/30 dark:bg-indigo-950/20"
                  >
                    <div class="flex items-center gap-3">
                      <svg
                        class="w-8 h-8 text-orange-500 dark:text-indigo-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {{ selectedEvent.image.name || selectedEvent.image }}
                        </p>
                        <p
                          v-if="selectedEvent.image.size"
                          class="text-xs text-gray-500 dark:text-gray-400"
                        >
                          {{ (selectedEvent.image.size / 1024 / 1024).toFixed(2) }} MB
                        </p>
                      </div>
                      <button
                        @click="selectedEvent.image = null"
                        type="button"
                        class="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      >
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image 
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Image <span class="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />-->

              <!-- Aperçu de l'image sélectionnée 
                <div v-if="selectedEvent.image" class="mt-3">
                  <img
                    :src="selectedEvent.image"
                    alt="Aperçu"
                    class="w-48 h-48 object-cover rounded-xl border"
                  />
                </div>
              </div>-->

              <!-- Lieu -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2"
                  >Lieu <span class="text-red-500">*</span></label
                >
                <input
                  v-model="selectedEvent.location"
                  type="text"
                  placeholder="Ex: Palais des Congrès, Cotonou..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Durée -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2"
                  >Durée <span class="text-red-500">*</span></label
                >
                <input
                  v-model="selectedEvent.date"
                  type="text"
                  placeholder="Ex: 2 heures, 1 journée..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Prix 
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Prix</label>
                <input
                  v-model="selectedEvent.price"
                  type="text"
                  placeholder="Ex: 5000, Free..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>-->

              <!-- Info box -->
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div class="flex gap-3">
                  <UIcon
                    name="i-heroicons-information-circle"
                    class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <div class="text-sm text-blue-700">
                    <p class="font-medium mb-1">Note importante</p>
                    <p>
                      Les modifications seront visibles immédiatement si le statut est "Publié".
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                @click="isEditModalOpen = false"
                class="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-all"
              >
                Annuler
              </button>

              <button
                @click="updateEvent"
                class="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                <UIcon name="i-heroicons-check" class="w-4 h-4" />
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useNuxtApp, navigateTo } from '#app'
import { NuxtImg } from '#components'
import { ref, computed, onMounted, watch } from 'vue'

// ── État ──
const searchQuery = ref('')
const activeDropdown = ref(null)
const selectedCategory = ref(null)
const selectedDate = ref(null)
const selectedLocation = ref(null)
const selectedPrice = ref(null)

const categories = ref([])
const cities = ref([])
const events = ref([])
const loading = ref(true)
const error = ref(null)

const currentPage = ref(1)
const eventsPerPage = 6

// ── Fetch ──
const fetchCategories = async () => {
  try { categories.value = await $fetch('/api/categories') } catch (e) {}
}
const fetchCities = async () => {
  try { cities.value = await $fetch('/api/villes') } catch (e) {}
}

onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([fetchCategories(), fetchCities()])
    const data = await $fetch('/api/events/index.front')
    if (Array.isArray(data)) events.value = data
  } catch (err) { error.value = err }
  finally { loading.value = false }
})

// ── Données statiques ──
const dates = ["Aujourd'hui", 'Ce week-end', 'Cette semaine', 'Ce mois-ci', 'Prochainement']
const popularTags = ['Concert', 'Exposition', 'Festival', 'Spectacle', 'Sport']

// ── Filtrage ──
const filteredEvents = computed(() => {
  const now = new Date()
  return events.value.filter((event) => {
    if (!event.eventDate) return false
    const eventDate = new Date(event.eventDate)
    if (eventDate < now) return false

    const q = searchQuery.value.toLowerCase()
    const matchQuery = !q ||
      event.title?.toLowerCase().includes(q) ||
      event.description?.toLowerCase().includes(q) ||
      event.ville?.nomVille?.toLowerCase().includes(q) ||
      event.category?.name?.toLowerCase().includes(q)

    const matchCategory = !selectedCategory.value || event.category?.name === selectedCategory.value
    const matchLocation = !selectedLocation.value ||
      event.ville?.nomVille?.toLowerCase() === selectedLocation.value.toLowerCase()

    return matchQuery && matchCategory && matchLocation
  })
})

const totalPages = computed(() => Math.ceil(filteredEvents.value.length / eventsPerPage))

const displayedEvents = computed(() => {
  const start = (currentPage.value - 1) * eventsPerPage
  return filteredEvents.value.slice(start, start + eventsPerPage)
})

const hasActiveFilters = computed(() =>
  selectedCategory.value || selectedDate.value || selectedLocation.value
)

const eventCount = computed(() => filteredEvents.value.length)

watch([searchQuery, selectedCategory, selectedDate, selectedLocation], () => {
  currentPage.value = 1
})

// ── Actions ──
const toggleDropdown = (key) => {
  activeDropdown.value = activeDropdown.value === key ? null : key
}
const selectCategory = (name) => { selectedCategory.value = name; activeDropdown.value = null }
const selectDate = (d) => { selectedDate.value = d; activeDropdown.value = null }
const selectLocation = (name) => { selectedLocation.value = name; activeDropdown.value = null }
const clearAllFilters = () => {
  selectedCategory.value = null
  selectedDate.value = null
  selectedLocation.value = null
  currentPage.value = 1
}
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

const formatDay = (date) => new Date(date).getDate()
const formatMonth = (date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short' })

// Fermer dropdowns au clic extérieur
if (process.client) {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-dropdown]')) activeDropdown.value = null
  })
}
</script>

<template>
  <div class="w-full bg-[#f5f3ef] font-outfit">

    <!-- ══ BLOC RECHERCHE ══ -->
    <div class="border-b border-[#ede8e0] py-12 sm:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">

        <!-- Titre -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4
                      bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                      text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest">
            <UIcon name="i-heroicons-magnifying-glass" class="w-3 h-3 text-[#ea6c1e]" />
            Recherche
          </div>
          <h2 class="text-[28px] sm:text-[36px] font-bold text-[#1a1612] tracking-tight mb-2">
            Trouvez votre
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
              événement idéal
            </span>
          </h2>
          <p class="text-[13.5px] text-[#b0a898]">Explorez les événements d'exception au Bénin</p>
        </div>

        <!-- Card recherche -->
        <div class="bg-white rounded-2xl border border-[#ede8e0]
                    shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 sm:p-5">

          <!-- Input recherche -->
          <div class="relative mb-4">
            <UIcon name="i-heroicons-magnifying-glass"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#c0b8ad]" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un événement, un artiste, un lieu..."
              class="w-full pl-11 pr-10 py-3.5 text-[13.5px] text-[#1a1612]
                     placeholder:text-[#c0b8ad]
                     bg-[#faf8f5] border border-[#ede8e0] rounded-xl
                     outline-none transition-all duration-200
                     focus:bg-white focus:border-[#ea6c1e]
                     focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]"
            />
            <button v-if="searchQuery" @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2
                     w-6 h-6 rounded-lg bg-[#f0ede8] flex items-center justify-center
                     hover:bg-[#ede8e0] transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5 text-[#8a8078]" />
            </button>
          </div>

          <!-- Filtres -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">

            <!-- Catégorie -->
            <div class="relative" data-dropdown>
              <button
                @click="toggleDropdown('category')"
                :class="[
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-[12.5px] font-medium transition-all duration-150',
                  activeDropdown === 'category' || selectedCategory
                    ? 'border-[#ea6c1e]/40 bg-orange-50 text-[#ea6c1e]'
                    : 'border-[#ede8e0] bg-[#faf8f5] text-[#4a3f32] hover:border-[#d4cec5]'
                ]"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-tag" class="w-3.5 h-3.5 flex-shrink-0" />
                  <span class="truncate">{{ selectedCategory || 'Catégorie' }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-down"
                  class="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                  :class="{ 'rotate-180': activeDropdown === 'category' }" />
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div v-if="activeDropdown === 'category'"
                  class="absolute z-50 top-full left-0 right-0 mt-1.5
                         bg-white rounded-xl border border-[#ede8e0]
                         shadow-[0_8px_32px_rgba(0,0,0,0.10)] overflow-hidden">
                  <div class="p-1.5 max-h-56 overflow-y-auto">
                    <button
                      class="w-full text-left px-3 py-2 rounded-lg text-[12.5px] text-[#8a8078]
                             hover:bg-[#faf5ee] hover:text-[#ea6c1e] transition-colors"
                      @click="selectCategory(null)"
                    >Toutes les catégories</button>
                    <button
                      v-for="cat in categories" :key="cat.id"
                      @click="selectCategory(cat.name)"
                      :class="[
                        'w-full text-left px-3 py-2 rounded-lg text-[12.5px] transition-colors',
                        selectedCategory === cat.name
                          ? 'bg-orange-50 text-[#ea6c1e] font-semibold'
                          : 'text-[#4a3f32] hover:bg-[#faf5ee] hover:text-[#ea6c1e]'
                      ]"
                    >{{ cat.name }}</button>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Date -->
            <div class="relative" data-dropdown>
              <button
                @click="toggleDropdown('date')"
                :class="[
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-[12.5px] font-medium transition-all duration-150',
                  activeDropdown === 'date' || selectedDate
                    ? 'border-[#ea6c1e]/40 bg-orange-50 text-[#ea6c1e]'
                    : 'border-[#ede8e0] bg-[#faf8f5] text-[#4a3f32] hover:border-[#d4cec5]'
                ]"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5 flex-shrink-0" />
                  <span class="truncate">{{ selectedDate || 'Date' }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-down"
                  class="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                  :class="{ 'rotate-180': activeDropdown === 'date' }" />
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div v-if="activeDropdown === 'date'"
                  class="absolute z-50 top-full left-0 right-0 mt-1.5
                         bg-white rounded-xl border border-[#ede8e0]
                         shadow-[0_8px_32px_rgba(0,0,0,0.10)] overflow-hidden">
                  <div class="p-1.5">
                    <button
                      v-for="d in dates" :key="d"
                      @click="selectDate(d)"
                      :class="[
                        'w-full text-left px-3 py-2 rounded-lg text-[12.5px] transition-colors',
                        selectedDate === d
                          ? 'bg-orange-50 text-[#ea6c1e] font-semibold'
                          : 'text-[#4a3f32] hover:bg-[#faf5ee] hover:text-[#ea6c1e]'
                      ]"
                    >{{ d }}</button>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Ville -->
            <div class="relative" data-dropdown>
              <button
                @click="toggleDropdown('location')"
                :class="[
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-[12.5px] font-medium transition-all duration-150',
                  activeDropdown === 'location' || selectedLocation
                    ? 'border-[#ea6c1e]/40 bg-orange-50 text-[#ea6c1e]'
                    : 'border-[#ede8e0] bg-[#faf8f5] text-[#4a3f32] hover:border-[#d4cec5]'
                ]"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 flex-shrink-0" />
                  <span class="truncate">{{ selectedLocation || 'Ville' }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-down"
                  class="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                  :class="{ 'rotate-180': activeDropdown === 'location' }" />
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div v-if="activeDropdown === 'location'"
                  class="absolute z-50 top-full left-0 right-0 mt-1.5
                         bg-white rounded-xl border border-[#ede8e0]
                         shadow-[0_8px_32px_rgba(0,0,0,0.10)] overflow-hidden">
                  <div class="p-1.5 max-h-56 overflow-y-auto">
                    <button
                      class="w-full text-left px-3 py-2 rounded-lg text-[12.5px] text-[#8a8078]
                             hover:bg-[#faf5ee] hover:text-[#ea6c1e] transition-colors"
                      @click="selectLocation(null)"
                    >Toutes les villes</button>
                    <button
                      v-for="city in cities" :key="city.id"
                      @click="selectLocation(city.nomVille)"
                      :class="[
                        'w-full text-left px-3 py-2 rounded-lg text-[12.5px] transition-colors',
                        selectedLocation === city.nomVille
                          ? 'bg-orange-50 text-[#ea6c1e] font-semibold'
                          : 'text-[#4a3f32] hover:bg-[#faf5ee] hover:text-[#ea6c1e]'
                      ]"
                    >{{ city.nomVille }}</button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Filtres actifs + bouton rechercher -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <!-- Tags actifs -->
            <div class="flex-1 flex flex-wrap gap-1.5 min-h-[28px]">
              <span v-if="selectedCategory"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                       bg-white border border-[#ede8e0] text-[11.5px] font-medium text-[#4a3f32]">
                {{ selectedCategory }}
                <button @click="selectedCategory = null"
                  class="w-3.5 h-3.5 rounded flex items-center justify-center hover:text-[#ea6c1e]">
                  <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                </button>
              </span>
              <span v-if="selectedDate"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                       bg-white border border-[#ede8e0] text-[11.5px] font-medium text-[#4a3f32]">
                {{ selectedDate }}
                <button @click="selectedDate = null"
                  class="w-3.5 h-3.5 rounded flex items-center justify-center hover:text-[#ea6c1e]">
                  <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                </button>
              </span>
              <span v-if="selectedLocation"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                       bg-white border border-[#ede8e0] text-[11.5px] font-medium text-[#4a3f32]">
                {{ selectedLocation }}
                <button @click="selectedLocation = null"
                  class="w-3.5 h-3.5 rounded flex items-center justify-center hover:text-[#ea6c1e]">
                  <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                </button>
              </span>
              <button v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="text-[11.5px] text-[#b0a898] hover:text-[#ea6c1e] underline transition-colors">
                Effacer tout
              </button>
            </div>

            <!-- Bouton rechercher -->
            <button
              @click="currentPage = 1"
              class="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                     text-white text-[13px] font-semibold
                     shadow-[0_3px_12px_rgba(234,108,30,0.25)]
                     hover:shadow-[0_5px_20px_rgba(234,108,30,0.35)]
                     hover:-translate-y-0.5 transition-all duration-200"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="w-3.5 h-3.5" />
              Rechercher
            </button>
          </div>
        </div>

        <!-- Tags populaires -->
        <div class="mt-5 text-center">
          <p class="text-[11.5px] text-[#c0b8ad] mb-2.5">Recherches populaires :</p>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="tag in popularTags" :key="tag"
              @click="searchQuery = tag"
              class="px-3.5 py-1.5 text-[12px] font-medium
                     bg-white border border-[#ede8e0] rounded-xl text-[#4a3f32]
                     hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e] hover:bg-orange-50
                     transition-all duration-150"
            >{{ tag }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ RÉSULTATS ══ -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

      <!-- Header résultats -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <h3 class="text-[20px] sm:text-[26px] font-bold text-[#1a1612] tracking-tight">
            {{ filteredEvents.length > 0
              ? `${filteredEvents.length} événement${filteredEvents.length > 1 ? 's' : ''} trouvé${filteredEvents.length > 1 ? 's' : ''}`
              : 'Événements à la une' }}
          </h3>
          <p class="text-[12.5px] text-[#b0a898] mt-0.5">
            {{ hasActiveFilters ? 'Résultats filtrés' : "Découvrez nos événements d'exception" }}
          </p>
        </div>

        <button v-if="!loading"
          @click="navigateTo('/events')"
          class="relative flex items-center gap-2 px-5 py-2.5 rounded-2xl
                 bg-[#1a1612] text-white text-[13px] font-semibold
                 shadow-[0_4px_16px_rgba(26,22,18,0.2)]
                 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(26,22,18,0.3)]
                 transition-all duration-200 overflow-hidden group"
        >
          <span class="relative z-10 flex items-center gap-2">
            Voir tous les événements
            <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
          </span>
          <!-- Badge count -->
          <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full
                       bg-[#ea6c1e] text-white text-[9px] font-bold
                       flex items-center justify-center shadow-sm">
            {{ eventCount }}
          </span>
        </button>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i"
          class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden animate-pulse">
          <div class="h-52 bg-[#f0ede8]" />
          <div class="p-4 space-y-2.5">
            <div class="h-3 bg-[#f0ede8] rounded w-1/3" />
            <div class="h-4 bg-[#f0ede8] rounded w-3/4" />
            <div class="h-3 bg-[#f0ede8] rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Grid événements -->
      <div v-else-if="displayedEvents.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <article
          v-for="event in displayedEvents" :key="event.id"
          class="group bg-white rounded-2xl border border-[#ede8e0] overflow-hidden
                 shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]
                 hover:border-[#ea6c1e]/30 hover:-translate-y-0.5
                 transition-all duration-300"
        >
          <NuxtLink :to="`/events/${event.id}`">
            <!-- Image -->
            <div class="relative h-48 sm:h-52 overflow-hidden bg-[#f0ede8]">
              <NuxtImg
                v-if="event.images?.length"
                :src="event.images[0].url"
                :alt="event.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-heroicons-calendar-days" class="w-10 h-10 text-[#c0b8ad]" />
              </div>

              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <!-- Badge catégorie -->
              <div class="absolute top-3 left-3">
                <span class="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm
                             text-[10.5px] font-semibold text-[#1a1612] shadow-sm">
                  {{ event.category?.name }}
                </span>
              </div>

              <!-- Date box -->
              <div class="absolute top-3 right-3">
                <div class="flex flex-col items-center px-2.5 py-2 rounded-xl
                            bg-white shadow-sm min-w-[40px]">
                  <span class="text-[20px] font-bold text-[#ea6c1e] leading-none">
                    {{ formatDay(event.eventDate) }}
                  </span>
                  <span class="text-[9px] font-semibold text-[#6b6560] uppercase tracking-wide mt-0.5">
                    {{ formatMonth(event.eventDate) }}
                  </span>
                  
                </div>
              </div>

              <!-- Prix bas gauche -->
              <div class="absolute bottom-3 left-3">
                <span class="text-[16px] font-bold text-white">
                  <template v-if="event?.price && Number(event.price) > 0">
                    {{ event.price }} Fcfa
                  </template>
                  <template v-else>Gratuit</template>
                </span>
              </div>
            </div>

            <!-- Contenu -->
            <div class="p-4">
              <h3 class="text-[14px] font-bold text-[#1a1612] mb-1.5 line-clamp-2
                         group-hover:text-[#ea6c1e] transition-colors leading-snug">
                {{ event.title }}
              </h3>

              <div class="flex items-center gap-1.5 text-[11.5px] text-[#b0a898] mb-2">
                <UIcon name="i-heroicons-map-pin" class="w-3 h-3 flex-shrink-0" />
                <span class="truncate">{{ event.ville?.nomVille }}</span>
              </div>

              <p class="text-[12px] text-[#6b6560] line-clamp-2 mb-4 leading-relaxed">
                {{ event.description }}
              </p>

              <!-- Footer card -->
              <div class="flex items-center justify-between pt-3 border-t border-[#ede8e0]">
                <div class="flex items-center gap-1.5 text-[11.5px] text-[#6b6560]">
                  <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
                  <span>{{ event.views }} vues</span>
                </div>
                <div class="w-8 h-8 rounded-xl bg-[#f5f0e8] border border-[#ede8e0]
                            flex items-center justify-center
                            group-hover:bg-gradient-to-br group-hover:from-[#ea6c1e] group-hover:to-[#5b47e0]
                            group-hover:border-transparent transition-all duration-200">
                  <UIcon name="i-heroicons-arrow-right"
                    class="w-3.5 h-3.5 text-[#c0b8ad] group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center py-16 text-center">
        <div class="w-14 h-14 rounded-2xl bg-white border border-[#ede8e0]
                    shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                    flex items-center justify-center mb-4">
          <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-[#c0b8ad]" />
        </div>
        <h3 class="text-[16px] font-bold text-[#1a1612] mb-1.5">Aucun événement trouvé</h3>
        <p class="text-[13px] text-[#b0a898] mb-5">Aucun événement ne correspond à vos critères</p>
        <button @click="clearAllFilters"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl
                 bg-white border border-[#ede8e0]
                 text-[13px] font-semibold text-[#4a3f32]
                 hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e]
                 transition-all duration-150">
          <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
          Réinitialiser les filtres
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-8">
        <button @click="prevPage" :disabled="currentPage === 1"
          class="px-4 py-2 rounded-xl text-[12.5px] font-semibold
                 bg-white border border-[#ede8e0] text-[#4a3f32]
                 hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e]
                 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-all duration-150">
          ← Précédent
        </button>

        <div class="px-4 py-2 rounded-xl bg-[#1a1612] text-white text-[12.5px] font-bold">
          {{ currentPage }} / {{ totalPages }}
        </div>

        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-xl text-[12.5px] font-semibold
                 bg-white border border-[#ede8e0] text-[#4a3f32]
                 hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e]
                 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-all duration-150">
          Suivant →
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
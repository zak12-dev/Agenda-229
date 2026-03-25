<template>
  <div class="w-full bg-[#f5f3ef] min-h-screen font-outfit">

    <!-- ══ HERO SECTION ══ -->
    <div class="bg-[#faf8f5] border-b border-[#ede8e0] pt-24 pb-10 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto">

        <!-- Titre -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                      bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                      text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest mb-4">
            <span class="w-1.5 h-1.5 rounded-full bg-[#ea6c1e]" />
            Découvrez nos événements
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#1a1612] leading-tight tracking-tight mb-3">
            Trouvez votre
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
              événement idéal
            </span>
          </h1>
          <p class="text-[14px] text-[#8a8078]">Explorez des événements d'exception près de chez vous</p>
        </div>

        <!-- ══ BLOC RECHERCHE ══ -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 sm:p-5">

          <!-- Barre de recherche -->
          <div class="relative mb-4">
            <div class="absolute left-4 top-1/2 -translate-y-1/2">
              <UIcon name="i-heroicons-magnifying-glass" class="w-4.5 h-4.5 text-[#c0b8ad]" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un événement, un artiste, un lieu..."
              class="w-full pl-11 pr-10 py-3.5 text-[13.5px] text-[#1a1612] placeholder-[#c0b8ad]
                     bg-[#faf8f5] border border-[#ede8e0] rounded-xl outline-none
                     focus:border-[#ea6c1e] focus:shadow-[0_0_0_3px_rgba(234,108,30,0.08)]
                     transition-all duration-200"
              @focus="showSuggestions = true"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg
                     bg-[#f0ede8] hover:bg-[#ede8e0] flex items-center justify-center transition-colors"
            >
              <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5 text-[#8a8078]" />
            </button>
          </div>

          <!-- Filtres -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">

            <!-- Filtre Catégorie -->
            <div class="relative">
              <button
                @click.stop="toggleDropdown('category')"
                :class="[
                  'filter-btn',
                  (activeDropdown === 'category' || selectedCategory) ? 'filter-btn--active' : ''
                ]"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div :class="['filter-icon', (activeDropdown === 'category' || selectedCategory) ? 'bg-orange-50 border-orange-100' : 'bg-[#f5f0e8] border-[#ede8e0]']">
                    <UIcon name="i-heroicons-tag" class="w-3 h-3" :class="(activeDropdown === 'category' || selectedCategory) ? 'text-[#ea6c1e]' : 'text-[#8a8078]'" />
                  </div>
                  <span class="text-[12.5px] font-medium truncate">{{ selectedCategory || 'Catégorie' }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-down"
                  class="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                  :class="{ 'rotate-180': activeDropdown === 'category' }" />
              </button>
              <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="activeDropdown === 'category'" class="filter-dropdown">
                  <button class="filter-option" :class="{ 'filter-option--active': !selectedCategory }" @click="selectCategory(null)">
                    Toutes les catégories
                  </button>
                  <button v-for="cat in categories" :key="cat.id" @click="selectCategory(cat.name)"
                    class="filter-option" :class="{ 'filter-option--active': selectedCategory === cat.name }">
                    {{ cat.name }}
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Filtre Date -->
            <div class="relative">
              <button
                @click.stop="toggleDropdown('date')"
                :class="['filter-btn', (activeDropdown === 'date' || selectedDate) ? 'filter-btn--active' : '']"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div :class="['filter-icon', (activeDropdown === 'date' || selectedDate) ? 'bg-orange-50 border-orange-100' : 'bg-[#f5f0e8] border-[#ede8e0]']">
                    <UIcon name="i-heroicons-calendar-days" class="w-3 h-3" :class="(activeDropdown === 'date' || selectedDate) ? 'text-[#ea6c1e]' : 'text-[#8a8078]'" />
                  </div>
                  <span class="text-[12.5px] font-medium truncate">{{ selectedDate || 'Date' }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5 flex-shrink-0 transition-transform" :class="{ 'rotate-180': activeDropdown === 'date' }" />
              </button>
              <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="activeDropdown === 'date'" class="filter-dropdown">
                  <button class="filter-option" :class="{ 'filter-option--active': !selectedDate }" @click="selectDate(null)">
                    Toutes les dates
                  </button>
                  <button v-for="date in dates" :key="date" @click="selectDate(date)"
                    class="filter-option" :class="{ 'filter-option--active': selectedDate === date }">
                    {{ date }}
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Filtre Lieu -->
            <div class="relative">
              <button
                @click.stop="toggleDropdown('location')"
                :class="['filter-btn', (activeDropdown === 'location' || selectedLocation) ? 'filter-btn--active' : '']"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div :class="['filter-icon', (activeDropdown === 'location' || selectedLocation) ? 'bg-orange-50 border-orange-100' : 'bg-[#f5f0e8] border-[#ede8e0]']">
                    <UIcon name="i-heroicons-map-pin" class="w-3 h-3" :class="(activeDropdown === 'location' || selectedLocation) ? 'text-[#ea6c1e]' : 'text-[#8a8078]'" />
                  </div>
                  <span class="text-[12.5px] font-medium truncate">{{ selectedLocation || 'Ville' }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5 flex-shrink-0 transition-transform" :class="{ 'rotate-180': activeDropdown === 'location' }" />
              </button>
              <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="activeDropdown === 'location'" class="filter-dropdown">
                  <button class="filter-option" :class="{ 'filter-option--active': !selectedLocation }" @click="selectLocation(null)">
                    Toutes les villes
                  </button>
                  <button v-for="city in cities" :key="city.id" @click="selectLocation(city.nomVille)"
                    class="filter-option" :class="{ 'filter-option--active': selectedLocation === city.nomVille }">
                    {{ city.nomVille }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Tags actifs + Bouton rechercher -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <!-- Tags filtres actifs -->
            <div class="flex-1 flex flex-wrap items-center gap-2 min-h-[32px]">
              <span v-if="!hasActiveFilters" class="text-[12px] text-[#c0b8ad]">
                Aucun filtre actif
              </span>
              <template v-else>
                <span v-if="selectedCategory" class="active-tag">
                  <UIcon name="i-heroicons-tag" class="w-3 h-3" />
                  {{ selectedCategory }}
                  <button @click="selectedCategory = null">
                    <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                  </button>
                </span>
                <span v-if="selectedDate" class="active-tag">
                  <UIcon name="i-heroicons-calendar-days" class="w-3 h-3" />
                  {{ selectedDate }}
                  <button @click="selectedDate = null">
                    <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                  </button>
                </span>
                <span v-if="selectedLocation" class="active-tag">
                  <UIcon name="i-heroicons-map-pin" class="w-3 h-3" />
                  {{ selectedLocation }}
                  <button @click="selectedLocation = null">
                    <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                  </button>
                </span>
                <button @click="clearAllFilters"
                  class="text-[11px] text-[#b0a898] hover:text-[#ea6c1e] font-medium underline underline-offset-2 transition-colors">
                  Effacer tout
                </button>
              </template>
            </div>

            <!-- Bouton rechercher -->
            <button
              @click="handleSearch"
              class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                     bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                     text-white text-[13px] font-semibold
                     shadow-[0_4px_14px_rgba(234,108,30,0.3)]
                     hover:shadow-[0_4px_20px_rgba(234,108,30,0.4)]
                     hover:opacity-95 active:scale-95
                     transition-all duration-200 flex-shrink-0"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SECTION RÉSULTATS ══ -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header résultats -->
      <div class="flex items-end justify-between mb-6 gap-4">
        <div>
          <h2 class="text-[22px] sm:text-[28px] font-bold text-[#1a1612] tracking-tight leading-tight">
            <template v-if="loading">Événements à la une</template>
            <template v-else>Événements à la une</template>
          </h2>
          <p class="text-[12.5px] text-[#b0a898] mt-0.5">
            {{ hasActiveFilters ? 'Résultats filtrés' : "Découvrez nos événements d'exception" }}
          </p>
        </div>

        <!-- Compteur résultats -->
        <div v-if="!loading && filteredEvents.length > 0"
          class="flex-shrink-0 px-3 py-1.5 bg-white border border-[#ede8e0] rounded-xl
                 text-[11.5px] font-medium text-[#8a8078] shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          {{ displayedEvents.length }} / {{ filteredEvents.length }}
        </div>
      </div>

      <!-- ── Loading skeletons ── -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AppSkeleton v-for="i in 6" :key="i" variant="event-card" />
      </div>

      <!-- ── Grille événements ── -->
      <div v-else-if="displayedEvents.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <article
          v-for="event in displayedEvents" :key="event.id"
          class="group bg-white rounded-2xl border border-[#ede8e0] overflow-hidden
                 shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]
                 hover:border-[#ea6c1e]/30
                 transition-all duration-300"
        >
          <NuxtLink :to="`/events/${event.id}`">

            <!-- Image -->
            <div class="relative overflow-hidden h-52">
              <NuxtImg
                v-if="event.images?.length"
                :src="event.images[0].url"
                :alt="event.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-[#f5f0e8] to-[#ede8e0] flex items-center justify-center">
                <UIcon name="i-heroicons-calendar-days" class="w-12 h-12 text-[#c0b8ad]" />
              </div>

              <!-- Overlay dégradé léger -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <!-- Badge catégorie -->
              <div class="absolute top-3 left-3">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                             bg-white/95 backdrop-blur-sm border border-white/50
                             text-[11px] font-semibold text-[#1a1612] shadow-sm">
                  {{ event.category?.name }}
                </span>
              </div>

              <!-- Badge date -->
              <div class="absolute top-3 right-3">
                <div class="flex flex-col items-center px-2.5 py-2 rounded-xl
                            bg-white/95 backdrop-blur-sm shadow-sm border border-white/50 min-w-[44px]">
                  <span class="text-[20px] font-bold text-[#ea6c1e] leading-none">{{ formatDay(event.eventDate) }}</span>
                  <span class="text-[9px] font-semibold text-[#8a8078] uppercase tracking-wide mt-0.5">{{ formatMonth(event.eventDate) }}</span>
                </div>
              </div>

              <!-- Prix en bas -->
              <div class="absolute bottom-3 left-3">
                <span class="inline-flex items-baseline gap-1">
                  <span class="text-[18px] font-bold text-white leading-none">
                    <template v-if="event?.price && Number(event.price) > 0">
                      {{ event.price }} Fcfa
                    </template>
                    <template v-else>Gratuit</template>
                  </span>
                  <span v-if="event?.price && Number(event.price) > 0" class="text-[11px] text-white/70">/ pers</span>
                </span>
              </div>
            </div>

            <!-- Contenu -->
            <div class="p-4">
              <!-- Titre -->
              <h3 class="text-[15px] font-bold text-[#1a1612] mb-1.5 line-clamp-2
                         group-hover:text-[#ea6c1e] transition-colors leading-snug">
                {{ event.title }}
              </h3>

              <!-- Lieu -->
              <div class="flex items-center gap-1.5 text-[12px] text-[#8a8078] mb-2">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#c0b8ad] flex-shrink-0" />
                <span class="truncate">{{ event.location }}</span>
              </div>

              <!-- Description -->
              <p class="text-[12px] text-[#b0a898] line-clamp-2 mb-4 leading-relaxed">
                {{ event.description }}
              </p>

              <!-- Footer carte -->
              <div class="flex items-center justify-between pt-3.5 border-t border-[#ede8e0]">
                <!-- Vues -->
                <div class="flex items-center gap-1.5 text-[11.5px] text-[#c0b8ad]">
                  <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
                  <span>{{ event.views }} vue{{ event.views > 1 ? 's' : '' }}</span>
                </div>

                <!-- CTA -->
                <div class="flex items-center gap-1.5 text-[12px] font-semibold text-[#ea6c1e]
                            group-hover:gap-2.5 transition-all duration-200">
                  <span>Voir</span>
                  <div class="w-6 h-6 rounded-lg bg-orange-50 border border-orange-100
                              flex items-center justify-center
                              group-hover:bg-gradient-to-r group-hover:from-[#ea6c1e] group-hover:to-[#5b47e0]
                              group-hover:border-transparent transition-all duration-300">
                    <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- ── Empty state ── -->
      <div v-else class="flex flex-col items-center py-20">
        <div class="w-16 h-16 rounded-2xl bg-white border border-[#ede8e0]
                    shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                    flex items-center justify-center mb-5">
          <UIcon name="i-heroicons-calendar-days" class="w-7 h-7 text-[#c0b8ad]" />
        </div>
        <h3 class="text-[17px] font-bold text-[#1a1612] mb-1.5">Aucun événement trouvé</h3>
        <p class="text-[13px] text-[#b0a898] mb-6 text-center max-w-sm">
          Aucun événement ne correspond à vos critères. Essayez de modifier vos filtres.
        </p>
        <button
          @click="clearAllFilters"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl
                 bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                 text-[13px] font-medium text-[#4a3f32]
                 hover:border-[#ea6c1e]/40 hover:shadow-[0_2px_12px_rgba(234,108,30,0.1)]
                 transition-all duration-200"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-[#ea6c1e]" />
          Réinitialiser les filtres
        </button>
      </div>

      <!-- ── Voir plus / Voir moins ── -->
      <div v-if="!loading && filteredEvents.length > eventsPerPage" class="flex justify-center gap-3 mt-10">
        <button
          v-if="hasMoreEvents"
          @click="showMore"
          class="flex items-center gap-2 px-6 py-3 rounded-xl
                 bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                 text-[13px] font-semibold text-[#4a3f32]
                 hover:border-[#ea6c1e]/40 hover:shadow-[0_2px_12px_rgba(234,108,30,0.1)]
                 transition-all duration-200"
        >
          Voir plus d'événements
          <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-[#ea6c1e]" />
        </button>

        <button
          v-if="!hasMoreEvents && canShowLess"
          @click="showLess"
          class="flex items-center gap-2 px-6 py-3 rounded-xl
                 bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                 text-[13px] font-semibold text-[#4a3f32]
                 hover:border-[#ea6c1e]/40 transition-all duration-200"
        >
          Voir moins
          <UIcon name="i-heroicons-chevron-up" class="w-4 h-4 text-[#ea6c1e]" />
        </button>
      </div>
    </div>

    <!-- ══ ÉVÉNEMENTS PASSÉS ══ -->
    <div class="border-t border-[#ede8e0] bg-[#faf8f5]">
      <PastEvent />
    </div>

  </div>
</template>

<script setup>
import { useNuxtApp, navigateTo } from '#app'
import { NuxtImg } from '#components'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PastEvent from '~/components/home/PastEvent.vue'
import AppSkeleton from '../../components/home/Appskeleton.vue'


const route = useRoute()
const router = useRouter()

// ── State ──
const searchQuery = ref(route.query.q || '')
const showSuggestions = ref(false)
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

// ── Fetch données ──
const fetchCategories = async () => {
  try {
    categories.value = await $fetch('/api/categories')
  } catch (e) { console.error('Erreur catégories:', e) }
}

const fetchCities = async () => {
  try {
    cities.value = await $fetch('/api/villes')
  } catch (e) { console.error('Erreur villes:', e) }
}

onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([fetchCategories(), fetchCities()])
    const data = await $fetch('/api/events/index.front', {
      method: 'GET',
      params: { q: searchQuery.value },
    })
    if (Array.isArray(data)) events.value = data
  } catch (err) {
    console.error('Erreur fetch:', err)
    error.value = err
  } finally {
    loading.value = false
  }

  // Fermer les dropdowns au clic extérieur
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const closeDropdowns = (e) => {
  if (!e.target.closest('.relative')) activeDropdown.value = null
}

// ── Options filtres ──
const dates = ["Aujourd'hui", 'Ce week-end', 'Cette semaine', 'Ce mois-ci', 'Prochainement']

// ── Filtrage ──
const filteredEvents = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return events.value
    .filter((event) => {
      if (!event.eventDate) return false
      const eventDate = new Date(event.eventDate)
      if (eventDate < today) return false

      const matchQuery = !searchQuery.value ||
        event.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        event.ville?.nomVille?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        event.category?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchCategory = !selectedCategory.value || event.category?.name === selectedCategory.value
      const matchLocation = !selectedLocation.value ||
        event.ville?.nomVille?.toLowerCase() === selectedLocation.value.toLowerCase()
      const matchPrice = !selectedPrice.value ||
        (selectedPrice.value === 'Gratuit' && (!event.price || Number(event.price) === 0))

      let matchDate = true
      if (selectedDate.value) {
        const now = new Date()
        if (selectedDate.value === "Aujourd'hui") {
          matchDate = eventDate.toDateString() === now.toDateString()
        } else if (selectedDate.value === 'Ce week-end') {
          const saturday = new Date(now)
          saturday.setDate(now.getDate() + (6 - now.getDay()))
          const sunday = new Date(saturday)
          sunday.setDate(saturday.getDate() + 1)
          matchDate = eventDate >= saturday && eventDate <= sunday
        } else if (selectedDate.value === 'Cette semaine') {
          const endWeek = new Date(now)
          endWeek.setDate(now.getDate() + 7)
          matchDate = eventDate <= endWeek
        } else if (selectedDate.value === 'Ce mois-ci') {
          matchDate = eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
        }
      }

      return matchQuery && matchCategory && matchLocation && matchPrice && matchDate
    })
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
})

// ── Pagination ──
const eventsPerPage = 6
const displayedCount = ref(eventsPerPage)
const displayedEvents = computed(() => filteredEvents.value.slice(0, displayedCount.value))
const hasMoreEvents = computed(() => displayedCount.value < filteredEvents.value.length)
const canShowLess = computed(() => displayedCount.value > eventsPerPage)
function showMore() { displayedCount.value += eventsPerPage }
function showLess() { displayedCount.value = eventsPerPage }

// ── Formatage date ──
const formatDay = (date) => new Date(date).getDate()
const formatMonth = (date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short' })

// ── Filtres ──
const hasActiveFilters = computed(() =>
  selectedCategory.value || selectedDate.value || selectedLocation.value || selectedPrice.value
)

const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}
const selectCategory = (v) => { selectedCategory.value = v; activeDropdown.value = null }
const selectDate = (v) => { selectedDate.value = v; activeDropdown.value = null }
const selectLocation = (v) => { selectedLocation.value = v; activeDropdown.value = null }

const clearAllFilters = () => {
  selectedCategory.value = null
  selectedDate.value = null
  selectedLocation.value = null
  selectedPrice.value = null
  displayedCount.value = eventsPerPage
}

const handleSearch = () => {
  displayedCount.value = eventsPerPage
}

watch([searchQuery, selectedCategory, selectedDate, selectedLocation, selectedPrice], () => {
  displayedCount.value = eventsPerPage
})
</script>

<style scoped>

/* ── Filtres ── */
.filter-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px solid #ede8e0;
  background: #faf8f5;
  color: #4a3f32;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover {
  border-color: #c0b8ad;
  background: white;
}
.filter-btn--active {
  border-color: #ea6c1e;
  background: white;
  box-shadow: 0 0 0 3px rgba(234, 108, 30, 0.08);
  color: #ea6c1e;
}
.filter-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border-width: 1px;
  border-style: solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.filter-dropdown {
  position: absolute;
  z-index: 50;
  width: 100%;
  margin-top: 6px;
  background: #faf8f5;
  border: 1px solid #ede8e0;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  overflow: hidden;
  padding: 6px;
  max-height: 240px;
  overflow-y: auto;
}
.filter-option {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: #4a3f32;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.12s;
  background: transparent;
  border: none;
  display: block;
}
.filter-option:hover { background: white; }
.filter-option--active {
  background: #faf0e8;
  color: #ea6c1e;
  font-weight: 600;
}

/* ── Tags actifs ── */
.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: white;
  border: 1px solid #ede8e0;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
  color: #4a3f32;
  font-family: 'Outfit', sans-serif;
}
.active-tag button {
  display: flex;
  align-items: center;
  color: #c0b8ad;
  transition: color 0.12s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.active-tag button:hover { color: #ea6c1e; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
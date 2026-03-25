<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 font-outfit">

    <!-- ══ HEADER ══ -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div>
        <!-- Pill label -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                    bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                    text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest mb-3">
          <span class="w-1.5 h-1.5 rounded-full bg-[#c0b8ad]" />
          Archives
        </div>
        <h2 class="text-[22px] sm:text-[28px] font-bold text-[#1a1612] tracking-tight leading-tight">
          Événements <span class="text-[#b0a898]">passés</span>
        </h2>
        <p class="text-[12.5px] text-[#b0a898] mt-0.5">Découvrez les événements qui ont déjà eu lieu</p>
      </div>

      <!-- Compteur -->
      <div v-if="!loading && pastEvents.length > 0"
        class="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 bg-white border border-[#ede8e0]
               rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <span class="w-2 h-2 rounded-full bg-[#c0b8ad]" />
        <span class="text-[12px] font-semibold text-[#8a8078]">
          {{ pastEvents.length }} événement{{ pastEvents.length > 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- ══ LOADING ══ -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in 6" :key="i"
        class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden animate-pulse">
        <div class="h-52 bg-[#f0ede8]" />
        <div class="p-5 space-y-3">
          <div class="h-3.5 bg-[#f0ede8] rounded-lg w-3/4" />
          <div class="h-3 bg-[#f0ede8] rounded-lg w-1/2" />
          <div class="h-3 bg-[#f0ede8] rounded-lg w-2/3" />
        </div>
      </div>
    </div>

    <!-- ══ GRILLE ÉVÉNEMENTS PASSÉS ══ -->
    <div v-else-if="displayedEvents.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <article
        v-for="event in displayedEvents" :key="event.id"
        class="group bg-white rounded-2xl border border-[#ede8e0] overflow-hidden
               shadow-[0_2px_12px_rgba(0,0,0,0.04)]
               hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]
               hover:border-[#d4cec5]
               transition-all duration-300 opacity-90 hover:opacity-100"
      >
        <NuxtLink :to="`/events/${event.id}`">

          <!-- Image -->
          <div class="relative overflow-hidden h-52">
            <NuxtImg
              v-if="event.images?.length"
              :src="event.images[0].url"
              :alt="event.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500
                     grayscale-[30%] group-hover:grayscale-0"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-[#f5f0e8] to-[#ede8e0]
                               flex items-center justify-center">
              <UIcon name="i-heroicons-calendar-days" class="w-12 h-12 text-[#c0b8ad]" />
            </div>

            <!-- Overlay plus sombre pour les passés -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <!-- Badge catégorie -->
            <div class="absolute top-3 left-3">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                           bg-white/90 backdrop-blur-sm border border-white/50
                           text-[11px] font-semibold text-[#1a1612] shadow-sm">
                {{ event.category?.name }}
              </span>
            </div>

            <!-- Badge "Terminé" -->
            <div class="absolute top-3 right-3">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                           bg-black/60 backdrop-blur-sm border border-white/10
                           text-[11px] font-semibold text-white/90">
                <span class="w-1.5 h-1.5 rounded-full bg-[#c0b8ad]" />
                Terminé
              </span>
            </div>

            <!-- Prix en bas -->
            <div class="absolute bottom-3 left-3">
              <span class="text-[16px] font-bold text-white/80 leading-none">
                <template v-if="event?.price && Number(event.price) > 0">
                  {{ event.price }} Fcfa
                </template>
                <template v-else>Gratuit</template>
              </span>
            </div>
          </div>

          <!-- Contenu -->
          <div class="p-4">
            <!-- Titre -->
            <h3 class="text-[15px] font-bold text-[#4a3f32] mb-1.5 line-clamp-2
                       group-hover:text-[#1a1612] transition-colors leading-snug">
              {{ event.title }}
            </h3>

            <!-- Lieu + date -->
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-1.5 text-[12px] text-[#b0a898] min-w-0">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#c0b8ad] flex-shrink-0" />
                <span class="truncate">{{ event.ville?.nomVille || event.location }}</span>
              </div>
              <!-- Date de l'événement -->
              <span class="flex-shrink-0 text-[11px] font-medium text-[#c0b8ad]">
                {{ formatDate(event.eventDate) }}
              </span>
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

              <!-- CTA consulter -->
              <div class="flex items-center gap-1.5 text-[12px] font-semibold text-[#8a8078]
                          group-hover:text-[#4a3f32] group-hover:gap-2.5 transition-all duration-200">
                <span>Consulter</span>
                <div class="w-6 h-6 rounded-lg bg-[#f5f0e8] border border-[#ede8e0]
                            flex items-center justify-center
                            group-hover:bg-[#1a1612] group-hover:border-[#1a1612]
                            transition-all duration-300">
                  <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </article>
    </div>

    <!-- ══ EMPTY STATE ══ -->
    <div v-else class="flex flex-col items-center py-16">
      <div class="w-14 h-14 rounded-2xl bg-white border border-[#ede8e0]
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                  flex items-center justify-center mb-4">
        <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-[#c0b8ad]" />
      </div>
      <h3 class="text-[16px] font-bold text-[#1a1612] mb-1">Aucun événement passé</h3>
      <p class="text-[12.5px] text-[#b0a898] text-center max-w-xs">
        Aucun événement passé n'est disponible pour le moment.
      </p>
    </div>

    <!-- ══ PAGINATION ══ -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-8">
      <!-- Précédent -->
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-medium
               bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
               text-[#4a3f32] hover:border-[#c0b8ad] transition-all duration-200
               disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <UIcon name="i-heroicons-chevron-left" class="w-3.5 h-3.5" />
        Précédent
      </button>

      <!-- Pages -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="page in visiblePages" :key="page"
          @click="goToPage(page)"
          :class="[
            'w-8 h-8 rounded-lg text-[12px] font-semibold transition-all duration-150',
            currentPage === page
              ? 'bg-[#1a1612] text-white shadow-sm'
              : 'bg-white border border-[#ede8e0] text-[#8a8078] hover:border-[#c0b8ad] hover:text-[#4a3f32]'
          ]"
        >
          {{ page }}
        </button>
      </div>

      <!-- Suivant -->
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-medium
               bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
               text-[#4a3f32] hover:border-[#c0b8ad] transition-all duration-200
               disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Suivant
        <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      </button>
    </div>

  </div>
</template>

<script setup>
import { NuxtImg } from '#components'
import { ref, computed, onMounted } from 'vue'

// ── Data ──
const events = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const eventsPerPage = 6

onMounted(async () => {
  try {
    loading.value = true
    const data = await $fetch('/api/events/index.front', { method: 'GET' })
    if (Array.isArray(data)) events.value = data
  } catch (err) {
    console.error('Erreur fetch:', err)
    error.value = err
  } finally {
    loading.value = false
  }
})

// ── Filtrage événements passés ──
const isPastEvent = (date) => date && new Date(date) < new Date()

const pastEvents = computed(() =>
  events.value.filter(e => e.eventDate && new Date(e.eventDate) < new Date())
)

// ── Pagination ──
const totalPages = computed(() => Math.ceil(pastEvents.value.length / eventsPerPage))

const displayedEvents = computed(() => {
  const start = (currentPage.value - 1) * eventsPerPage
  return pastEvents.value.slice(start, start + eventsPerPage)
})

// Pages visibles (max 5 autour de la page courante)
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const pages = []
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.push(i)
  }
  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

// ── Formatage ──
const formatDate = (date) =>
  new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<style scoped>
</style>
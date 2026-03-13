<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppSkeleton from '../../components/home/Appskeleton.vue'


interface FavoriteEvent {
  id: string
  title: string
  category: string
  date: string
  location: string
  price: number | string
  image: string
  organizer: string
  status: 'upcoming' | 'past'
}

const favorites = ref<FavoriteEvent[]>([])
const loading = ref(true)
const filterStatus = ref<'all' | 'upcoming' | 'past'>('all')

const fetchFavorites = async () => {
  loading.value = true
  try {
    const { data } = await useFetch('/api/favorites', { credentials: 'include' })
    if (data.value) {
      favorites.value = data.value.map((favorite: any) => {
        const event = favorite.event
        const now = new Date()
        const eventDate = new Date(event.eventDate)
        return {
          id: event.id,
          title: event.title,
          category: event.category?.name || '',
          date: event.eventDate,
          location: event.location,
          price: event.price ?? 'Gratuit',
          image: event.images?.[0]?.url || '',
          organizer: event.user?.name || '',
          status: eventDate >= now ? 'upcoming' : 'past',
        }
      })
    }
  } catch (err) {
    console.error('Erreur chargement favoris:', err)
  } finally {
    loading.value = false
  }
}

const filteredFavorites = computed(() => {
  if (filterStatus.value === 'all') return favorites.value
  return favorites.value.filter((f) => f.status === filterStatus.value)
})

const upcomingCount = computed(() => favorites.value.filter(f => f.status === 'upcoming').length)
const pastCount = computed(() => favorites.value.filter(f => f.status === 'past').length)

const removeFavorite = async (eventId: string) => {
  if (!confirm('Retirer des favoris ?')) return
  try {
    await $fetch(`/api/favorites/${eventId}`, { method: 'DELETE', credentials: 'include' })
    favorites.value = favorites.value.filter((f) => f.id !== eventId)
  } catch (err) {
    console.error('Erreur suppression favoris:', err)
  }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(fetchFavorites)
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit pt-20 pb-12 px-4 sm:px-6">
    <div class="max-w-7xl mx-auto">

      <!-- ══ HEADER ══ -->
      <div class="mb-8">
        <!-- Pill -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                    bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                    text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest mb-4">
          <UIcon name="i-heroicons-heart-solid" class="w-3 h-3 text-[#ea6c1e]" />
          Mes favoris
        </div>

        <div class="flex items-end justify-between gap-4">
          <div>
            <h1 class="text-[26px] sm:text-[32px] font-bold text-[#1a1612] tracking-tight leading-tight">
              Vos événements
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
                favoris
              </span>
            </h1>
            <p class="text-[13px] text-[#b0a898] mt-1">
              {{ favorites.length }} événement{{ favorites.length > 1 ? 's' : '' }} sauvegardé{{ favorites.length > 1 ? 's' : '' }}
            </p>
          </div>

          <!-- KPI pills -->
          <div class="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ede8e0]
                        rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.04)] text-[11.5px] font-medium text-[#4a3f32]">
              <span class="w-2 h-2 rounded-full bg-emerald-400" />
              {{ upcomingCount }} à venir
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ede8e0]
                        rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.04)] text-[11.5px] font-medium text-[#4a3f32]">
              <span class="w-2 h-2 rounded-full bg-[#c0b8ad]" />
              {{ pastCount }} passé{{ pastCount > 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- ══ FILTRES ══ -->
      <div class="flex items-center gap-1.5 p-1 bg-white border border-[#ede8e0]
                  rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] mb-6 w-fit">
        <button
          @click="filterStatus = 'all'"
          :class="[
            'px-4 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-200',
            filterStatus === 'all'
              ? 'bg-[#1a1612] text-white shadow-sm'
              : 'text-[#8a8078] hover:text-[#4a3f32] hover:bg-[#faf5ee]'
          ]"
        >
          Tous
          <span class="ml-1.5 text-[10px] opacity-70">{{ favorites.length }}</span>
        </button>
        <button
          @click="filterStatus = 'upcoming'"
          :class="[
            'px-4 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-200',
            filterStatus === 'upcoming'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-[#8a8078] hover:text-[#4a3f32] hover:bg-[#faf5ee]'
          ]"
        >
          À venir
          <span class="ml-1.5 text-[10px] opacity-70">{{ upcomingCount }}</span>
        </button>
        <button
          @click="filterStatus = 'past'"
          :class="[
            'px-4 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-200',
            filterStatus === 'past'
              ? 'bg-[#8a8078] text-white shadow-sm'
              : 'text-[#8a8078] hover:text-[#4a3f32] hover:bg-[#faf5ee]'
          ]"
        >
          Passés
          <span class="ml-1.5 text-[10px] opacity-70">{{ pastCount }}</span>
        </button>
      </div>

      <!-- ══ LOADING ══ -->
      <div v-if="loading" class="space-y-3">
        <AppSkeleton v-for="i in 4" :key="i" variant="event-row" />
      </div>

      <!-- ══ LISTE FAVORIS ══ -->
      <div v-else class="space-y-3">
        <div
          v-for="event in filteredFavorites" :key="event.id"
          :class="[
            'group bg-white rounded-2xl border overflow-hidden transition-all duration-300',
            event.status === 'past'
              ? 'border-[#ede8e0] opacity-80 hover:opacity-100'
              : 'border-[#ede8e0] hover:border-[#ea6c1e]/30 hover:shadow-[0_4px_20px_rgba(234,108,30,0.08)]'
          ]"
        >
          <div class="flex items-stretch gap-0">

            <!-- Image -->
            <div class="relative w-24 sm:w-28 flex-shrink-0 overflow-hidden">
              <img
                v-if="event.image"
                :src="event.image"
                :alt="event.title"
                :class="[
                  'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
                  event.status === 'past' ? 'grayscale-[40%]' : ''
                ]"
              />
              <div v-else
                class="w-full h-full min-h-[96px] bg-gradient-to-br from-[#f5f0e8] to-[#ede8e0]
                       flex items-center justify-center">
                <UIcon name="i-heroicons-calendar-days" class="w-7 h-7 text-[#c0b8ad]" />
              </div>
              <!-- Badge statut sur l'image -->
              <div class="absolute top-2 left-2">
                <span v-if="event.status === 'upcoming'"
                  class="flex items-center gap-1 px-2 py-0.5 rounded-md
                         bg-emerald-500/90 backdrop-blur-sm
                         text-[9px] font-bold text-white uppercase tracking-wide">
                  <span class="w-1 h-1 rounded-full bg-white" />
                  Bientôt
                </span>
                <span v-else
                  class="flex items-center gap-1 px-2 py-0.5 rounded-md
                         bg-black/50 backdrop-blur-sm
                         text-[9px] font-bold text-white/80 uppercase tracking-wide">
                  Terminé
                </span>
              </div>
            </div>

            <!-- Contenu -->
            <div class="flex-1 min-w-0 p-4">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="min-w-0 flex-1">
                  <!-- Catégorie -->
                  <p class="text-[10.5px] font-semibold text-[#ea6c1e] uppercase tracking-wide mb-1">
                    {{ event.category }}
                  </p>
                  <!-- Titre -->
                  <h3 class="text-[14px] font-bold text-[#1a1612] truncate
                             group-hover:text-[#ea6c1e] transition-colors leading-snug">
                    {{ event.title }}
                  </h3>
                  <!-- Organisateur -->
                  <p class="text-[11.5px] text-[#b0a898] mt-0.5">par {{ event.organizer }}</p>
                </div>

                <!-- Bouton retirer -->
                <button
                  @click="removeFavorite(event.id)"
                  class="flex-shrink-0 w-8 h-8 rounded-xl bg-[#faf8f5] border border-[#ede8e0]
                         flex items-center justify-center
                         hover:bg-red-50 hover:border-red-100
                         transition-all duration-200 group/btn"
                  title="Retirer des favoris"
                >
                  <UIcon name="i-heroicons-heart-solid"
                    class="w-4 h-4 text-[#ea6c1e] group-hover/btn:text-red-500 transition-colors" />
                </button>
              </div>

              <!-- Infos -->
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                <div class="flex items-center gap-1.5 text-[11.5px] text-[#8a8078]">
                  <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5 text-[#c0b8ad]" />
                  <span>{{ formatDate(event.date) }}</span>
                </div>
                <div class="flex items-center gap-1.5 text-[11.5px] text-[#8a8078]">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#c0b8ad]" />
                  <span class="truncate max-w-[120px]">{{ event.location }}</span>
                </div>
                <span class="text-[11.5px] font-semibold"
                  :class="event.status === 'past' ? 'text-[#b0a898]' : 'text-[#ea6c1e]'">
                  <template v-if="event?.price && Number(event.price) > 0">
                    {{ event.price }} Fcfa
                  </template>
                  <template v-else>Gratuit</template>
                </span>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between">
                <!-- Séparateur tiret dégradé -->
                <div class="flex-1 h-px bg-[#ede8e0] mr-4" />
                <NuxtLink
                  :to="`/events/${event.id}`"
                  :class="[
                    'flex items-center gap-1.5 text-[12px] font-semibold flex-shrink-0 transition-all duration-200',
                    event.status === 'past'
                      ? 'text-[#8a8078] hover:text-[#4a3f32]'
                      : 'text-[#ea6c1e] hover:gap-2.5'
                  ]"
                >
                  {{ event.status === 'past' ? 'Consulter' : 'Voir l\'événement' }}
                  <div :class="[
                    'w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200',
                    event.status === 'past'
                      ? 'bg-[#f5f0e8] border border-[#ede8e0]'
                      : 'bg-orange-50 border border-orange-100 group-hover:bg-gradient-to-r group-hover:from-[#ea6c1e] group-hover:to-[#5b47e0] group-hover:border-transparent'
                  ]">
                    <UIcon name="i-heroicons-arrow-right"
                      class="w-3 h-3 transition-colors"
                      :class="event.status === 'past' ? 'text-[#8a8078]' : 'text-[#ea6c1e] group-hover:text-white'" />
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ EMPTY STATE ══ -->
      <div v-if="!loading && filteredFavorites.length === 0"
        class="flex flex-col items-center py-20">
        <div class="w-16 h-16 rounded-2xl bg-white border border-[#ede8e0]
                    shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                    flex items-center justify-center mb-5">
          <UIcon name="i-heroicons-heart" class="w-7 h-7 text-[#c0b8ad]" />
        </div>
        <h3 class="text-[16px] font-bold text-[#1a1612] mb-1.5">
          <template v-if="filterStatus === 'all'">Aucun favori</template>
          <template v-else-if="filterStatus === 'upcoming'">Aucun événement à venir</template>
          <template v-else>Aucun événement passé</template>
        </h3>
        <p class="text-[13px] text-[#b0a898] text-center max-w-xs">
          <template v-if="filterStatus === 'all'">
            Explorez les événements et ajoutez vos favoris pour les retrouver ici.
          </template>
          <template v-else>
            Aucun favori ne correspond à ce filtre.
          </template>
        </p>
        <NuxtLink v-if="filterStatus === 'all'" to="/events"
          class="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl
                 bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                 text-white text-[13px] font-semibold
                 shadow-[0_4px_14px_rgba(234,108,30,0.25)] hover:opacity-90 transition-opacity">
          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
          Découvrir des événements
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
</style>
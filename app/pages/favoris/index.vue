<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface FavoriteEvent {
  id: number
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
    const { data } = await useFetch('/api/favorites', {
      credentials: 'include'
    })
console.log('DATA2', data)
    if (data.value) {
      favorites.value = data.value.map((event: any) => {
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
          status: eventDate >= now ? 'upcoming' : 'past'
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
  return favorites.value.filter(f => f.status === filterStatus.value)
})

const removeFavorite = async (id: number) => {
  if (!confirm('Retirer des favoris ?')) return
  favorites.value = favorites.value.filter(f => f.id !== id)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(fetchFavorites)
</script>

<template>
  <div class="min-h-screen p-6 mt-18 bg-gradient-to-br from-orange-200 via-white to-indigo-200">
    <div class="max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="mb-5 pb-6 border-b border-gray-300 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Favoris</h1>
        <p class="text-gray-600">{{ favorites.length }} événement(s)</p>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 mb-6 justify-center">
        <button
          @click="filterStatus = 'all'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all',
            filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Tous
        </button>
        <button
          @click="filterStatus = 'upcoming'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all',
            filterStatus === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          À venir
        </button>
        <button
          @click="filterStatus = 'past'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all',
            filterStatus === 'past' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Passés
        </button>
      </div>

      <!-- List -->
      <div class="space-y-4">
        <!-- Loading -->
        <div v-if="loading" v-for="i in 3" :key="i" class="border border-gray-300 rounded-xl p-4">
          <div class="flex items-center gap-4">
            <USkeleton class="h-20 w-20 rounded-lg" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-5 w-2/3" />
              <USkeleton class="h-4 w-1/2" />
            </div>
          </div>
        </div>

        <!-- Items -->
        <div
          v-else
          v-for="event in filteredFavorites"
          :key="event.id"
          class="border border-gray-300 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-4">
            <!-- Image -->
            <div class="w-20 h-20 bg-gradient-to-br from-orange-500 to-indigo-500 rounded-lg flex-shrink-0 overflow-hidden">
              <div class="w-full h-full bg-black/20"></div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900">{{ event.title }}</h3>
                  <p class="text-sm text-gray-600">{{ event.category }} • {{ event.organizer }}</p>
                </div>

                <button
                  @click="removeFavorite(event.id)"
                  class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                  title="Retirer"
                >
                  <UIcon name="i-heroicons-heart-solid" class="w-5 h-5" />
                </button>
              </div>

              <div class="flex items-center gap-4 text-sm text-gray-600">
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                  <span>{{ formatDate(event.date) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                  <span>{{ event.location }}</span>
                </div>
                <span class="font-semibold text-orange-700">
                  {{ typeof event.price === 'number' ? `${event.price} XOF` : event.price }}
                </span>
              </div>
            </div>

            <!-- Action -->
            <NuxtLink
              :to="`/events/${event.id}`"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all flex-shrink-0"
            >
              Voir
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredFavorites.length === 0" class="text-center py-16">
        <UIcon name="i-heroicons-heart" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-600">Aucun favori</p>
      </div>

    </div>
  </div>
</template>
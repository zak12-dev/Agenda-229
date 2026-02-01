<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import type { Event } from '../../../types/event'

const route = useRoute()
const loading = ref(false)
const activeTab = ref('details')

const id = computed(() => Number(route.params.id))

const events = ref<Event[]>([
  {
    id: 1,
    title: 'Concert Live Afrobeat',
    category: 'Concerts & Musique',
    date: '2026-02-10',
    location: 'Paris, Salle Pleyel',
    price: 25,
    duration: '3h',
    description: 'Un concert exceptionnel avec les meilleurs artistes afrobeat.',
    content: `
      <h2>Une soirée inoubliable</h2>
      <p>Plongez dans l'univers vibrant de l'afrobeat...</p>
    `,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
    participants: 250,
    views: 1250,
    author: 'Jean Dupont',
    tags: ['afrobeat', 'concert', 'musique', 'paris'],
    organizer: 'Live Events Paris',
    capacity: 500,
    remainingPlaces: 250,
  },
  {
    id: 2,
    title: 'Concert Live Afrobeat',
    category: 'Concerts & Musique',
    date: '2026-02-10',
    location: 'Paris, Salle Pleyel',
    price: 25,
    duration: '3h',
    description: 'Un concert exceptionnel avec les meilleurs artistes afrobeat.',
    content: `
      <h2>Une soirée inoubliable</h2>
      <p>Plongez dans l'univers vibrant de l'afrobeat...</p>
    `,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
    participants: 250,
    views: 1250,
    author: 'Jean Dupont',
    tags: ['afrobeat', 'concert', 'musique', 'paris'],
    organizer: 'Live Events Paris',
    capacity: 500,
    remainingPlaces: 250,
  },
  {
    id: 3,
    title: 'Festival de Jazz',
    category: 'Concerts & Musique',
    date: '2026-03-15',
    location: 'Lyon, Théâtre des Caves',
    price: 30,
    duration: '3h',
    description: 'Un festival exceptionnel de jazz avec les meilleurs artistes.',
    content: `
      <h2>Une soirée inoubliable</h2>
      <p>Plongez dans l'univers vibrant du jazz...</p>
    `,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
    participants: 250,
    views: 1250,
    author: 'Jean Dupont',
    tags: ['afrobeat', 'concert', 'musique', 'paris'],
    organizer: 'Live Events Paris',
    capacity: 500,
    remainingPlaces: 250,
  },
  {
    id: 4,
    title: 'Concert Live Afrobeat',
    category: 'Concerts & Musique',
    date: '2026-02-10',
    location: 'Paris, Salle Pleyel',
    price: 25,
    duration: '3h',
    description: 'Un concert exceptionnel avec les meilleurs artistes afrobeat.',
    content: `
      <h2>Une soirée inoubliable</h2>
      <p>Plongez dans l'univers vibrant de l'afrobeat...</p>
    `,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
    participants: 250,
    views: 1250,
    author: 'Jean Dupont',
    tags: ['afrobeat', 'concert', 'musique', 'paris'],
    organizer: 'Live Events Paris',
    capacity: 500,
    remainingPlaces: 250,
  },
  {
    id: 4,
    title: 'Concert Live Afrobeat',
    category: 'Concerts & Musique',
    date: '2026-02-10',
    location: 'Paris, Salle Pleyel',
    price: 25,
    duration: '3h',
    description: 'Un concert exceptionnel avec les meilleurs artistes afrobeat.',
    content: `
      <h2>Une soirée inoubliable</h2>
      <p>Plongez dans l'univers vibrant de l'afrobeat...</p>
    `,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
    participants: 250,
    views: 1250,
    author: 'Jean Dupont',
    tags: ['afrobeat', 'concert', 'musique', 'paris'],
    organizer: 'Live Events Paris',
    capacity: 500,
    remainingPlaces: 250,
  },
])

const similarEvents = computed(() => {
  if (!event.value) return []

  return events.value
    .filter((e) => e.category === event.value!.category && e.id !== event.value!.id)
    .slice(0, 3)
})

const event = computed(() => events.value.find((e) => e.id === id.value))
</script>

<template>
  <div class="min-h-screen ">
    <AppHeader />

    <div v-if="event" class=" bg-gradient-to-br from-purple-200 via-white to-indigo-200">
      <!-- Hero Magazine Style -->
      <div class="relative pt-16 sm:pt-20">
        <div class="max-w-7xl mx-auto px-6 sm:px-12 py-12">
          <!-- Breadcrumb -->
          <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <NuxtLink to="/" class="hover:text-purple-600">Accueil</NuxtLink>
            <span>/</span>
            <NuxtLink to="/events" class="hover:text-purple-600">Événements</NuxtLink>
            <span>/</span>
            <span class="text-gray-900">{{ event.title }}</span>
          </nav>

          <div class="grid lg:grid-cols-12 gap-12">
            <!-- Main Content -->
            <div class="lg:col-span-8">
              <!-- Category & Meta -->
              <div class="flex items-center gap-4 mb-6">
                <span
                  class="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-lg"
                >
                  {{ event.category }}
                </span>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {{ event.views }} vues
                  </span>
                  <span>•</span>
                  <span>Publié il y a 2 jours</span>
                </div>
              </div>

              <!-- Title -->
              <h1
                class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              >
                {{ event.title }}
              </h1>

              <!-- Description -->
              <p class="text-xl text-gray-600 leading-relaxed mb-8">
                {{ event.description }}
              </p>

              <!-- Actions Bar -->
              <div class="flex items-center justify-between pb-8 mb-8 border-b border-gray-200">
                <div class="flex items-center gap-4">
                  <button
                    class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span class="text-sm font-medium">Sauvegarder</span>
                  </button>
                  <button
                    class="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">Partager :</span>
                  <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                  </button>
                  <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                      />
                    </svg>
                  </button>
                  <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Main Image -->
              <div class="relative aspect-video rounded-2xl overflow-hidden mb-8">
                <img :src="event.image" :alt="event.title" class="w-full h-full object-cover" />
              </div>

              <!-- Tabs Navigation -->
              <div class="border-b border-gray-200 mb-8">
                <div class="flex gap-8">
                  <button
                    @click="activeTab = 'details'"
                    :class="[
                      'pb-4 text-sm font-semibold border-b-2 transition-colors',
                      activeTab === 'details'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900',
                    ]"
                  >
                    Détails
                  </button>
                  <!--  <button
                    @click="activeTab = 'program'"
                    :class="[
                      'pb-4 text-sm font-semibold border-b-2 transition-colors',
                      activeTab === 'program'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    ]"
                  >
                    Programme
                  </button>-->
                  <button
                    @click="activeTab = 'location'"
                    :class="[
                      'pb-4 text-sm font-semibold border-b-2 transition-colors',
                      activeTab === 'location'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900',
                    ]"
                  >
                    Lieu
                  </button>
                </div>
              </div>

              <!-- Tab Content -->
              <div>
                <!-- Details Tab -->
                <div v-if="activeTab === 'details'" class="prose prose-lg max-w-none">
                  <div v-html="event.content"></div>
                </div>

                <!-- Program Tab 
                <div v-if="activeTab === 'program'" class="space-y-6">
                  <div class="flex gap-6 pb-6 border-b border-gray-100">
                    <div class="text-sm font-semibold text-purple-600 w-20">20:00</div>
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-2">Ouverture des portes</h4>
                      <p class="text-gray-600">Accueil et cocktail de bienvenue</p>
                    </div>
                  </div>
                  <div class="flex gap-6 pb-6 border-b border-gray-100">
                    <div class="text-sm font-semibold text-purple-600 w-20">21:00</div>
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-2">Premier artiste</h4>
                      <p class="text-gray-600">Femi Kuti & The Positive Force</p>
                    </div>
                  </div>
                  <div class="flex gap-6 pb-6 border-b border-gray-100">
                    <div class="text-sm font-semibold text-purple-600 w-20">22:30</div>
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-2">Entracte</h4>
                      <p class="text-gray-600">DJ set afrobeat</p>
                    </div>
                  </div>
                  <div class="flex gap-6 pb-6">
                    <div class="text-sm font-semibold text-purple-600 w-20">23:00</div>
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-2">Headliner</h4>
                      <p class="text-gray-600">Tony Allen Experience</p>
                    </div>
                  </div>
                </div>-->

                <!-- Location Tab -->
                <div v-if="activeTab === 'location'">
                  <div class="bg-gray-50 rounded-xl p-6 mb-6">
                    <div class="flex items-start gap-4 mb-6">
                      <svg
                        class="w-6 h-6 text-purple-600 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <div>
                        <h3 class="font-bold text-lg text-gray-900 mb-1">{{ event.location }}</h3>
                        <p class="text-gray-600">252 Rue du Faubourg Saint-Honoré, 75008 Paris</p>
                      </div>
                    </div>
                    <div class="grid sm:grid-cols-2 gap-4">
                      <div class="flex items-center gap-3 p-4 bg-white rounded-lg">
                        <svg
                          class="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <div>
                          <p class="text-sm font-medium text-gray-900">Métro</p>
                          <p class="text-xs text-gray-600">Saint-Philippe-du-Roule</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 p-4 bg-white rounded-lg">
                        <svg
                          class="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                        <div>
                          <p class="text-sm font-medium text-gray-900">Parking</p>
                          <p class="text-xs text-gray-600">Disponible à proximité</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src="https://via.placeholder.com/800x450/e5e7eb/9ca3af?text=Map"
                      alt="Map"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <!-- Tags 
              <div v-if="event.tags?.length" class="mt-12 pt-8 border-t border-gray-200">
                <h3 class="text-sm font-semibold text-gray-600 mb-4">Tags</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in event.tags"
                    :key="tag"
                    class="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-pointer"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>-->
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-4">
              <div class="sticky top-24 space-y-6">
                <!-- Booking Card 
                <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div class="mb-6">
                    <div class="flex items-baseline gap-2 mb-2">
                      <span class="text-4xl font-bold text-gray-900">{{ event.price }}€</span>
                      <span class="text-gray-600">/ pers</span>
                    </div>
                    <p class="text-sm text-gray-600">TVA incluse</p>
                  </div>

                  <div class="space-y-3 mb-6">
                    <div class="flex items-center gap-3 text-sm">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-gray-700">10 février 2026</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-gray-700">{{ event.duration }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span class="text-gray-700">{{ event.location }}</span>
                    </div>
                  </div>

                  <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div class="flex items-center gap-2 mb-2">
                      <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-sm font-semibold text-orange-900">Places limitées</span>
                    </div>
                    <p class="text-sm text-orange-700">Plus que {{ event.remainingPlaces }} places disponibles</p>
                  </div>

                  <button class="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-3">
                    Réserver maintenant
                  </button>

                  <p class="text-xs text-gray-500 text-center">
                    Paiement sécurisé • Annulation gratuite
                  </p>
                </div>-->

                <!-- Organizer -->
                <div class="bg-gray-50 rounded-xl p-6">
                  <h3 class="font-semibold text-gray-900 mb-4">Organisateur</h3>
                  <div class="flex items-start gap-3 mb-4">
                    <div
                      class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0"
                    >
                      {{ event.organizer?.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 mb-1">{{ event.organizer }}</p>
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <span class="text-sm text-gray-600">Vérifié</span>
                      </div>
                    </div>
                  </div>
                  <button
                    class="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm font-medium"
                  >
                    Contacter l'organisateur
                  </button>
                </div>

                <!-- Need Help -->
                <div class="bg-purple-50 border border-gray-300 rounded-xl p-6">
                  <h3 class="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
                  <p class="text-sm text-gray-600 mb-4">Notre équipe est là pour vous assister</p>
                  <button
                    class="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Nous contacter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Similar Events -->
      <div class="bg-gray-50 py-16">
        <div class="max-w-7xl mx-auto px-6 sm:px-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-8">Événements similaires</h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Boucle sur similarEvents -->
            <div
              v-for="event in similarEvents"
              :key="event.id"
              class="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              <!-- Image -->
              <div class="relative h-48 overflow-hidden">
                <NuxtImg
                  :src="event.image"
                  :alt="event.title"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <!-- Contenu -->
              <div class="p-5">
                <span class="text-xs font-semibold text-purple-600 mb-2 block">
                  {{ event.category }}
                </span>
                <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">
                  {{ event.title }}
                </h3>
                <div class="flex items-center justify-between text-sm text-gray-600">
                  <span class="font-semibold">{{ event.price }}€</span>
                  <span>{{
                    new Date(event.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="min-h-screen flex items-center justify-center px-6 pt-16 sm:pt-20">
      <div class="text-center max-w-md">
        <div
          class="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Événement introuvable</h2>
        <p class="text-gray-600 mb-6">Cet événement n'existe pas ou a été supprimé.</p>
        <NuxtLink
          to="/events"
          class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
        >
          Retour aux événements
        </NuxtLink>
      </div>
    </div>
  </div>
  <AppFooter />
</template>

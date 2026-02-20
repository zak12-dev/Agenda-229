<template>
  <div
    class="w-full bg-gradient-to-br from-orange-200 via-white to-indigo-200 py-12 sm:py-16 lg:py-10"
  >
    <!-- Résultats des événements -->
    <div class="px-10 mt-">
      <!-- Header résultats -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-5xl font-semibold text-gray-900">Événements passés</h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ hasActiveFilters ? 'Résultats filtrés' : 'Découvrez les événements passés' }}
          </p>
        </div>
        <div v-if="!loading" class="text-center mt-10">
          <button
            @click="goToEvents()"
            class="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-orange-600 text-orange-600 font-semibold rounded-xl hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>Voir les événements passés</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
        >
          <div class="h-64 bg-gray-200"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Grid des événements -->
      <div
        v-else-if="displayedEvents.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <article
          v-for="event in displayedEvents"
          :key="event.id"
          class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-300"
        >
          <NuxtLink :to="`/events/${event.id}`">
            <!-- Image avec overlay -->
            <div class="relative overflow-hidden h-64">
              <NuxtImg
                v-if="event.images?.length"
                :src="event.images[0].url"
                :alt="event.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <!-- Image fallback -->
              <img v-else src="#" class="w-full h-full object-cover" />

              <!-- Gradient overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              ></div>

              <!-- Badge Catégorie -->
              <div class="absolute top-4 left-4">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-gray-900 shadow-lg"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  {{ event.category?.name }}
                </span>
              </div>

              <!-- Date Badge -->
              <!-- Date / Terminé Badge -->
              <div class="absolute top-4 right-4">
                <!-- ✅ Si événement passé -->
                <div
                  v-if="isPastEvent(event.eventDate)"
                  class="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow-lg"
                >
                  Terminé
                </div>
              </div>

              <!-- Prix en bas -->
              <div class="absolute bottom-4 left-4">
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold text-white">
                    <template v-if="event?.price && Number(event.price) > 0">
                      {{ event.price }}Fcfa
                    </template>
                    <template v-else> Gratuit </template>
                  </span>
                  <span
                    v-if="event?.price && Number(event.price) > 0"
                    class="text-sm text-white/80"
                  >
                    / pers
                  </span>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <!-- Titre -->
              <h3
                class="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2"
              >
                {{ event.title }}
              </h3>

              <!-- Lieu -->
              <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{{ event.ville?.nomVille }}</span>
              </div>

              <!-- Description -->
              <p class="text-sm text-gray-600 line-clamp-2 mb-4">
                {{ event.description }}
              </p>

              <!-- Infos supplémentaires -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <!-- Participants -->
                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>{{ event.views }} vue</span>
                </div>

                <!-- CTA Arrow -->
                <div
                  class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-indigo-600 transition-all"
                >
                  <svg
                    class="w-5 h-5 text-orange-600 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div
          class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-indigo-100 flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Aucun événement passé trouver</h3>
        <p class="text-gray-600 mb-6">Aucun événement ne correspond à un évènement passé</p>
      </div>

      <!-- Bouton Voir Plus -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 py-6">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-white border-2 border-gray-200 rounded-full font-medium text-gray-700 hover:border-orange-500 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ← Précédent
        </button>

        <div class="px-5 py-2 bg-orange-600 rounded-full">
          <span class="text-sm font-bold text-white"> {{ currentPage }} / {{ totalPages }} </span>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-white border-2 border-gray-200 rounded-full font-medium text-gray-700 hover:border-orange-500 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Suivant →
        </button>
      </div>
    </div>
    <section class="py-20 text-white mt-25 ">
      <div class="max-w-6xl mx-auto px-6">
        <!-- Header -->
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-3">
            Devenez
            <span
              class="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600"
              >Organisateur </span
            >
          </h2>
          <p class="text-sm sm:text-base text-gray-600">
            Rejoignez notre communauté de <strong>+100 organisateurs</strong> et donnez de la
            visibilité à vos événements
          </p>
        </div>

        <!-- Grid -->
        <div class="grid md:grid-cols-2 gap-8 mb-16">
          <div
            v-for="(advantage, index) in advantages"
            :key="index"
            class="flex items-start gap-4 p-6 bg-gradient-to-r from-orange-600 to-indigo-600 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-gray-300"
          >
            <div
              class="flex-shrink-0 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-gray-300"
            >
              <UIcon :name="advantage.icon" class="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">{{ advantage.title }}</h3>
              <p class="text-purple-100">{{ advantage.description }}</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center">
          <NuxtLink
            to="/organizerForm"
            class="inline-block px-8 py-4 bg-indigo-600 border border-gray-300 text-white font-bold rounded-xl hover:bg-indigo-400 transition-all shadow-xl hover:shadow-2xl"
          >
            Devenir organisateur 
          </NuxtLink>
          <p class="text-gray-600 text-sm mt-6">
            Des questions ? Contactez-nous :
            <a href="mailto:contact@bj-events.com" class="underline font-semibold"
              >contact@weloveevent.com</a
            >
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { NuxtImg } from '#components'
import { ref, computed, onMounted, watch } from 'vue'

function goToEvents() {
  navigateTo('/events')
}

// Données fictives (Mock events)
const events = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    loading.value = true

    const data = await $fetch('/api/events/index.front', {
      method: 'GET',
    })

    console.log('Retour API :', data)

    if (Array.isArray(data)) {
      events.value = data
      console.log('Événements récupérés :', events.value)
    } else {
      console.warn('Les données reçues ne sont pas un tableau :', data)
    }
  } catch (err) {
    console.error('Erreur fetch:', err)
    error.value = err
  } finally {
    loading.value = false
  }
})
const currentPage = ref(1)
const eventsPerPage = 6

// Calcul du nombre total de pages

// Événements à afficher pour la page courante
const displayedEvents = computed(() => {
  const start = (currentPage.value - 1) * eventsPerPage
  const end = start + eventsPerPage
  return pastEvents.value.slice(start, end)
})

// Fonctions pour changer de page
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// Filtrage des événements

const isPastEvent = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}

const pastEvents = computed(() => {
  const now = new Date()

  return events.value.filter((event) => {
    if (!event.eventDate) return false

    const eventDate = new Date(event.eventDate)

    // Garder uniquement les événements passés
    return eventDate < now
  })
})

const totalPages = computed(() => {
  return Math.ceil(pastEvents.value.length / eventsPerPage)
})

// Formatage date
const formatDay = (date) => {
  return new Date(date).getDate()
}

const formatMonth = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    month: 'short',
  })
}

const advantages = [
  {
    icon: 'i-heroicons-calendar-days',
    title: 'Création simplifiée',
    description: 'Créez et publiez vos événements en quelques clics',
  },
  {
    icon: 'i-heroicons-chart-bar',
    title: 'Analytics puissants',
    description: 'Suivez vos statistiques en temps réel',
  },
  {
    icon: 'i-heroicons-users',
    title: 'Gestion complète',
    description: 'Gérez participants et inscriptions facilement',
  },
  {
    icon: 'i-heroicons-megaphone',
    title: 'Visibilité optimale',
    description: 'Touchez des milliers de personnes au Bénin',
  },
]
</script>

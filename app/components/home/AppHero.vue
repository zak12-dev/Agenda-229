<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '../../../composables/useAuth'

const toast = useToast()
const { session } = useAuth()

const { data, pending, error } = await useAsyncData('featured-events', () =>
  $fetch('/api/events/featured?featured=true')
)

const featuredEvents = computed(() => Array.isArray(data.value) ? data.value : [])

// ── Carousel ──
const currentSlide = ref(0)
const isTransitioning = ref(false)

const currentEvent = computed(() => featuredEvents.value[currentSlide.value])

function goToSlide(index: number) {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = index
  setTimeout(() => { isTransitioning.value = false }, 600)
}
function nextSlide() {
  goToSlide((currentSlide.value + 1) % featuredEvents.value.length)
}
function prevSlide() {
  goToSlide((currentSlide.value - 1 + featuredEvents.value.length) % featuredEvents.value.length)
}

let autoPlayInterval: NodeJS.Timeout | null = null
const startAutoPlay = () => { autoPlayInterval = setInterval(nextSlide, 5000) }
const stopAutoPlay = () => { if (autoPlayInterval) { clearInterval(autoPlayInterval); autoPlayInterval = null } }

// ── Favoris ──
const isFavorite = ref(false)
const favoriteLoading = ref(false)

const toggleFavorite = async () => {
  if (!currentEvent.value?.id) return
  if (!session.value) {
    toast.add({ title: 'Connexion requise', description: 'Connectez-vous pour ajouter aux favoris', color: 'red' })
    return
  }
  favoriteLoading.value = true
  try {
    const response: any = await $fetch('/api/favorites', {
      method: 'POST',
      body: { eventId: currentEvent.value.id },
    })
    isFavorite.value = response.status === 'added'
    toast.add({
      title: isFavorite.value ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris',
      color: isFavorite.value ? 'green' : 'orange',
    })
  } catch {
    toast.add({ title: 'WeLoveEvents', description: 'Vous devez être connecté', color: 'red' })
  } finally { favoriteLoading.value = false }
}

watch(currentEvent, async (event) => {
  if (!event?.id || !session.value) return
  try {
    const response: any = await $fetch(`/api/favorites/check?eventId=${event.id}`)
    isFavorite.value = response.isFavorite
  } catch { isFavorite.value = false }
}, { immediate: true })

// ── Catégories ──
const categories = [
  { id: 'concerts',   name: 'Concerts',     icon: '🎵' },
  { id: 'festivals',  name: 'Festivals',    icon: '🎪' },
  { id: 'expos',      name: 'Expositions',  icon: '🎨' },
  { id: 'spectacles', name: 'Spectacles',   icon: '🎭' },
  { id: 'sport',      name: 'Sport',        icon: '⚽' },
]
function goToCategory(categoryId: string) { navigateTo(`/events?category=${categoryId}`) }

// ── Date formatée ──
const formattedDate = computed(() => {
  const rawDate = currentEvent.value?.eventDate
  if (!rawDate) return ''
  const date = new Date(rawDate)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
})

// ── Animation entrée ──
const isReady = ref(false)
onMounted(() => {
  startAutoPlay()
  setTimeout(() => { isReady.value = true }, 100)
})
</script>

<template>
  <section
    class="relative min-h-screen overflow-hidden font-outfit"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
  >

    <!-- ══ BACKGROUNDS CAROUSEL ══ -->
    <div class="absolute inset-0 z-0">
      <div
        v-for="(event, index) in featuredEvents" :key="event.id"
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="currentSlide === index ? 'opacity-100' : 'opacity-0'"
      >
        <NuxtImg
          v-if="event.image?.url"
          :src="event.image.url"
          :alt="event.title"
          class="w-full h-full object-cover object-center"
          :class="currentSlide === index ? 'animate-ken-burns' : ''"
          loading="eager"
          quality="85"
        />
        <img v-else src="#" class="w-full h-full object-cover" />
        <!-- Overlay dégradé Cream Minimal : sombre + teinte chaude -->
        <div class="absolute inset-0"
          style="background: linear-gradient(135deg, rgba(26,22,18,0.72) 0%, rgba(26,22,18,0.40) 45%, rgba(26,22,18,0.65) 100%)" />
      </div>
    </div>

    <!-- ══ CONTENU ══ -->
    <div
      class="relative z-10 min-h-screen flex items-center
             px-4 sm:px-6 pt-24 pb-10 sm:pt-28 sm:pb-12
             transition-all duration-1000 ease-out"
      :class="isReady ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'"
    >
      <div class="max-w-7xl mx-auto w-full">

        <!-- ── EVENT SHOWCASE ── -->
        <div class="max-w-2xl mb-10">

          <!-- Badge catégorie -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5
                      bg-white/10 backdrop-blur-md border border-white/20
                      text-[11px] font-bold text-white uppercase tracking-widest">
            <span class="w-1.5 h-1.5 rounded-full bg-[#ea6c1e]" />
            {{ currentEvent?.category }}
          </div>

          <!-- Titre -->
          <h1 class="text-[clamp(2.3rem,7vw,4.5rem)] font-black text-white leading-[1.08]
                     tracking-tight mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
            {{ currentEvent?.title }}
          </h1>

          <!-- Sous-titre -->
          <p class="text-[15px] sm:text-[17px] font-light text-white/80 leading-relaxed mb-6 max-w-lg">
            {{ currentEvent?.description }}
          </p>

          <!-- Méta date + lieu -->
          <div class="flex flex-wrap gap-4 mb-8">
            <div class="flex items-center gap-2 text-[13px] text-white/90">
              <div class="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20
                          flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5 text-[#ea6c1e]" />
              </div>
              <span>{{ formattedDate || 'Date non disponible' }}</span>
            </div>
            <div class="flex items-center gap-2 text-[13px] text-white/90">
              <div class="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20
                          flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#5b47e0]" />
              </div>
              <span>{{ currentEvent?.location }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3">
            <!-- Voir les détails -->
            <NuxtLink :to="`/events/${currentEvent?.id}`"
              class="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl
                     bg-white text-[#1a1612] text-[13.5px] font-bold
                     shadow-[0_8px_32px_rgba(255,255,255,0.25)]
                     hover:shadow-[0_12px_40px_rgba(255,255,255,0.35)]
                     hover:-translate-y-0.5 transition-all duration-200">
              Voir les détails
              <div class="w-6 h-6 rounded-lg bg-[#f0ede8] flex items-center justify-center">
                <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 text-[#ea6c1e]" />
              </div>
            </NuxtLink>

            <!-- Favoris -->
            <button
              @click="toggleFavorite"
              :disabled="favoriteLoading"
              :class="[
                'inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-[13.5px] font-semibold transition-all duration-200',
                isFavorite
                  ? 'bg-red-500/20 backdrop-blur-md border border-red-400/40 text-white'
                  : 'bg-white/10 backdrop-blur-md border border-white/25 text-white hover:bg-white/20'
              ]"
            >
              <UIcon
                :name="isFavorite ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                class="w-4.5 h-4.5"
                :class="isFavorite ? 'text-red-400' : 'text-white'"
              />
              {{ isFavorite ? 'En favori' : 'Favoris' }}
            </button>
          </div>
        </div>

        <!-- ── CONTRÔLES CAROUSEL ── -->
        <div class="flex items-center justify-center gap-6 mb-10">
          <!-- Précédent -->
          <button @click="prevSlide" aria-label="Précédent"
            class="w-11 h-11 flex items-center justify-center rounded-xl
                   bg-white/10 backdrop-blur-md border border-white/20
                   text-white hover:bg-white/20 hover:scale-110
                   transition-all duration-200">
            <UIcon name="i-heroicons-chevron-left" class="w-5 h-5" />
          </button>

          <!-- Dots -->
          <div class="flex items-center gap-2">
            <button
              v-for="(event, index) in featuredEvents" :key="event.id"
              @click="goToSlide(index)"
              :aria-label="`Événement ${index + 1}`"
              class="h-2 rounded-full border-none cursor-pointer transition-all duration-300"
              :class="currentSlide === index
                ? 'w-7 bg-white'
                : 'w-2 bg-white/35 hover:bg-white/60'"
            />
          </div>

          <!-- Suivant -->
          <button @click="nextSlide" aria-label="Suivant"
            class="w-11 h-11 flex items-center justify-center rounded-xl
                   bg-white/10 backdrop-blur-md border border-white/20
                   text-white hover:bg-white/20 hover:scale-110
                   transition-all duration-200">
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
          </button>
        </div>

        <!-- ── CATÉGORIES ── -->
        <div class="hidden sm:block bg-white/8 backdrop-blur-xl border border-white/15
                    rounded-2xl p-5">
          <p class="text-[11px] font-semibold text-white/50 uppercase tracking-widest text-center mb-4">
            Explorer par catégorie
          </p>
          <div class="grid grid-cols-5 gap-3">
            <button
              v-for="cat in categories" :key="cat.id"
              @click="goToCategory(cat.id)"
              class="group flex items-center gap-3 px-4 py-3 rounded-xl
                     bg-white/6 border border-white/12
                     hover:bg-white/15 hover:border-white/30
                     hover:-translate-y-0.5
                     transition-all duration-200"
            >
              <span class="text-xl leading-none">{{ cat.icon }}</span>
              <span class="flex-1 text-[12.5px] font-semibold text-white text-left truncate">
                {{ cat.name }}
              </span>
              <UIcon name="i-heroicons-chevron-right"
                class="w-3.5 h-3.5 text-white/30 group-hover:text-white/70
                       group-hover:translate-x-0.5 transition-all duration-200" />
            </button>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap');

@keyframes kenBurns {
  0%   { transform: scale(1.08); }
  100% { transform: scale(1); }
}
.animate-ken-burns {
  animation: kenBurns 8s ease-out forwards;
}
</style>
<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import { ref, onMounted, computed } from 'vue'
import { navigateTo } from '#app'

const props = defineProps({
  featuredEvents: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: 'We love eya 2026 ',
        subtitle: 'Les plus grands DJs européens et africains réunis',
        date: '27 Decembre 2026',
        location: 'Cotonou, Place de l\'amazone',
        image: '/images/weloveeya.jpeg',
        category: 'Festival'
      },
      {
        id: 2,
        title: 'Vodoun Day ',
        subtitle: 'Une soirée inoubliable',
        date: '2027-01-10',
        location: 'Bénin, Arène de Ouidah',
        image: '/images/vodoudays.jpeg',
        category: 'Festival'
      },
      {
        id: 3,
        title: '10 ans Vano Baby',
        subtitle: 'Concert 10 ans de carrière',
        date: '2026-03-25',
        location: 'Place de l\'amazone, Cotonou',
        image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1920&q=80',
        category: 'Concert'
      }
    ]
  }
})

// Carousel
const currentSlide = ref(0)
const isTransitioning = ref(false)

const currentEvent = computed(() => props.featuredEvents[currentSlide.value])

function goToSlide(index: number) {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = index
  setTimeout(() => {
    isTransitioning.value = false
  }, 600)
}

function nextSlide() {
  const next = (currentSlide.value + 1) % props.featuredEvents.length
  goToSlide(next)
}

function prevSlide() {
  const prev = (currentSlide.value - 1 + props.featuredEvents.length) % props.featuredEvents.length
  goToSlide(prev)
}

// Auto-play
let autoPlayInterval: NodeJS.Timeout | null = null
const startAutoPlay = () => {
  autoPlayInterval = setInterval(nextSlide, 5000)
}
const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

onMounted(() => {
  startAutoPlay()
})

// Categories
const categories = [
  { id: 'concerts', name: 'Concerts', icon: '🎵', count: 234 },
  { id: 'festivals', name: 'Festivals', icon: '🎪', count: 89 },
  { id: 'expos', name: 'Expositions', icon: '🎨', count: 156 },
  { id: 'spectacles', name: 'Spectacles', icon: '🎭', count: 178 },
  { id: 'sport', name: 'Sport', icon: '⚽', count: 92 }
]

function goToCategory(categoryId: string) {
  navigateTo(`/events?category=${categoryId}`)
}

const isReady = ref(false)
onMounted(() => {
  setTimeout(() => { isReady.value = true }, 100)
})
</script>

<template>
  <section 
    class="hero-carousel"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
  >
    <!-- Background avec transition -->
    <div class="carousel-backgrounds h-max-[100px]">
      <div
        v-for="(event, index) in featuredEvents"
        :key="event.id"
        class="carousel-bg"
        :class="{ 'carousel-bg--active': currentSlide === index }"
      >
        <NuxtImg
          :src="event.image"
          :alt="event.title"
          class="bg-image "
          loading="eager"
          quality="85"
        />
        <div class="bg-overlay"></div>
      </div>
    </div>

    <AppHeader />

    <!-- Contenu principal -->
    <div class="hero-content " :class="{ 'hero-content--ready': isReady }">
      <div class="container">
        <!-- Event actuel -->
        <div class="event-showcase">
          <div class="event-badge">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {{ currentEvent.category }}
          </div>

          <h1 class="event-title">
            {{ currentEvent.title }}
          </h1>

          <p class="event-subtitle">
            {{ currentEvent.subtitle }}
          </p>

          <div class="event-meta">
            <div class="meta-item">
              <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ new Date(currentEvent.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </div>
            <div class="meta-item">
              <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ currentEvent.location }}
            </div>
          </div>

          <div class="event-actions">
            <button class="btn-primary" @click="navigateTo(`/events/${currentEvent.id}`)">
              Voir les détails
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button class="btn-secondary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Sauvegarder
            </button>
          </div>
        </div>

        <!-- Contrôles carousel -->
        <div class="carousel-controls">
          <button class="carousel-btn" @click="prevSlide" aria-label="Précédent">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="carousel-dots">
            <button
              v-for="(event, index) in featuredEvents"
              :key="event.id"
              class="carousel-dot"
              :class="{ 'carousel-dot--active': currentSlide === index }"
              @click="goToSlide(index)"
              :aria-label="`Aller à l'événement ${index + 1}`"
            ></button>
          </div>

          <button class="carousel-btn" @click="nextSlide" aria-label="Suivant">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Catégories -->
        <div class="categories-section">
          <h3 class="categories-title">Explorer par catégorie</h3>
          <div class="categories-grid">
            <button
              v-for="category in categories"
              :key="category.id"
              class="category-card"
              @click="goToCategory(category.id)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <div class="category-info">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.count }} événements</span>
              </div>
              <svg class="category-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-carousel {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* Backgrounds */
.carousel-backgrounds {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.carousel-bg {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
}

.carousel-bg--active {
  opacity: 1;
}

.carousel-bg--active .bg-image {
  animation: kenBurns 8s ease-out forwards;
}

@keyframes kenBurns {
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

/* Content */
.hero-content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 8rem 2rem 4rem;
  opacity: 0;
  transform: scale(0.95);
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-content--ready {
  opacity: 1;
  transform: scale(1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Event Showcase */
.event-showcase {
  max-width: 700px;
  margin-bottom: 3rem;
}

.event-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.event-title {
  font-size: clamp(2.5rem, 7vw, 5rem);
  font-weight: 900;
  line-height: 1.1;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.event-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1rem;
}

.meta-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.event-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: white;
  color: #1f2937;
  box-shadow: 0 10px 40px -10px rgba(255, 255, 255, 0.5);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px -10px rgba(255, 255, 255, 0.7);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Carousel Controls */
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 4rem;
}

.carousel-btn {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.carousel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.carousel-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.carousel-dots {
  display: flex;
  gap: 0.75rem;
}

.carousel-dot {
  width: 0.75rem;
  height: 0.75rem;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.carousel-dot--active {
  width: 2rem;
  background: white;
  border-radius: 9999px;
}

/* Categories */
.categories-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 2rem;
}

.categories-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 2rem;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.category-count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.category-arrow {
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s;
}

.category-card:hover .category-arrow {
  color: white;
  transform: translateX(4px);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content {
    padding: 6rem 1.5rem 3rem;
  }

  .event-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .carousel-controls {
    gap: 1rem;
  }
}
</style>
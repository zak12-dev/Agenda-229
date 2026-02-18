<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import { ref, computed, onMounted } from 'vue'
import { navigateTo } from '#app'

/* Tous les événements venant de l'API */
const todayEvents = ref<any[]>([])

/* Date actuelle */
const now = new Date()



const { data } = await useFetch('/api/events/index.front')
console.log('DATA', data)
todayEvents.value = (data.value || []).filter(
  (e) => e.eventDate && !isNaN(new Date(e.eventDate).getTime())
)

function goToEvent(id: number | string) {
  navigateTo(`api/events/${id}`)
}

/* Fonction pour récupérer les événements d'un mois donné */
function getEventsByMonth(date: Date) {
  return todayEvents.value
    .filter((e) => {
      const d = new Date(e.eventDate)
      return d >= now && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    })
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
}

/* Événements à afficher : mois courant ou prochain mois si < 2 événements */
const displayedEvents = computed(() => {
  let current = new Date(now.getFullYear(), now.getMonth(), 1)
  let events = getEventsByMonth(current)

  // Passer au mois suivant si moins de 2 événements
  while (events.length < 2) {
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
    events = getEventsByMonth(current)
    // Stop si aucun événement dans les prochains mois
    if (events.length === 0 && current.getFullYear() - now.getFullYear() > 1) break
  }

  return events.slice(0, 3)
})

/* Affichage du mois pour la timeline */
const displayMonth = computed(() => {
  if (!displayedEvents.value.length) return ''
  const firstEvent = new Date(displayedEvents.value[0].eventDate)
  return firstEvent.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

/* Animation */
const isReady = ref(false)
setTimeout(() => {
  isReady.value = true
}, 100)

/* Navigation */
const activeFilter = ref('today')
function applyFilter(filterId: string) {
  activeFilter.value = filterId
  navigateTo(`/events?filter=${filterId}`)
}

/* Date affichée */
const today = computed(() => {
  const date = new Date()
  return {
    day: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
    date: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
  }
})
const monthEvents = computed(() => {
  if (!todayEvents.value) return []
  return todayEvents.value
    .filter((e) => e.eventDate && !isNaN(new Date(e.eventDate).getTime()))
    .filter((e) => {
      const d = new Date(e.eventDate)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
})
</script>

<template>
  <section class="hero-minimal">
    <div class="hero-container" :class="{ 'hero-container--ready': isReady }">
      <div class="content-grid">
        <!-- Colonne gauche : Info + Recherche -->
        <div class="left-column">
          <!-- En-tête épuré -->
          <div class="hero-header">
            <div class="date-info">
              <div class="date-day">{{ today.day }}</div>
              <div class="date-full">{{ today.date }}</div>
            </div>

            <h1 class="hero-title">
              Que faire
              <span class="title-accent">ce mois-ci</span> ?
            </h1>

            <p class="hero-subtitle">Découvrez les événements près de chez vous en un coup d'œil</p>
          </div>

          <!-- CTA Principal -->
          <button @click="navigateTo('/events')" class="cta-explore">
            <span>Explorer tous les événements de ce mois</span>
            <svg class="cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>

        <!-- Colonne droite : Timeline du jour -->
        <div class="right-column">
          <div class="timeline-card">
            <div class="timeline-header">
              <h3 class="timeline-title">{{ today.date }}</h3>
              <div class="timeline-badge">{{ monthEvents?.length ?? 0 }} événements</div>
            </div>

            <div class="timeline-list">
              <div
                v-for="(event, index) in displayedEvents"
                :key="event.id"
                class="timeline-item"
                :style="{ transitionDelay: `${index * 100}ms` }"
              >
                <div class="timeline-time">
                  <div class="time-value ml-5">
                    {{
                      new Date(event.eventDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })
                    }}
                  </div>
                  <div class="timeline-dot"></div>
                  <div class="timeline-line" v-if="index < displayedEvents.length - 1"></div>
                </div>

                <div class="timeline-content">
                  <div class="event-type">{{ event.category.name }}</div>
                  <h4 class="event-title-timeline">{{ event.title }}</h4>
                  <div class="event-venue">{{ event.location }}</div>
                  <NuxtLink :to="`/events/${event.id}`" custom v-slot="{ navigate }">
                    <button class="event-quick-action" @click="navigate">Voir les détails</button>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Footer timeline -->
            <div class="timeline-footer -mt-10">
              <!--<button @click="navigateTo('/events?filter=today')" class="timeline-see-all">
                Voir tous les événements d'aujourd'hui
              </button>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-minimal {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-container--ready {
  opacity: 1;
  transform: translateY(0);
}

/* Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

/* Colonne gauche */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.hero-header {
  margin-bottom: 1rem;
}

.date-info {
  margin-bottom: 2rem;
}

.date-day {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.date-full {
  font-size: 1rem;
  color: #475569;
}

.hero-title {
  font-size: clamp(3rem, 7vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
  margin-bottom: 1rem;
}

.title-accent {
  background: linear-gradient(135deg, #fb8c00 0%, #3949ab 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #64748b;
  max-width: 500px;
}

/* Recherche */
.search-minimal {
  transition-delay: 0.1s;
}

.search-form {
  position: relative;
}

.search-input-minimal {
  width: 100%;
  padding: 1.25rem 4rem 1.25rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  font-size: 1rem;
  color: #0f172a;
  transition: all 0.3s;
}

.search-input-minimal:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-btn-minimal {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: transform 0.3s;
}

.search-btn-minimal:hover {
  transform: translateY(-50%) scale(1.05);
}

.search-btn-minimal svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Filtres */
.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  transition-delay: 0.2s;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-chip:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.filter-chip--active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: transparent;
  color: white;
}

.filter-icon {
  font-size: 1rem;
}

/* CTA */
.cta-explore {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  background: #0f172a;
  border: none;
  border-radius: 9999px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-start;
  transition-delay: 0.3s;
}

.cta-explore:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.5);
}

.cta-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Colonne droite - Timeline */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition-delay: 0.4s;
}

.timeline-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 1.5rem;
  overflow: hidden;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.timeline-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.timeline-badge {
  padding: 0.375rem 0.75rem;
  background: #f1f5f9;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.timeline-list {
  padding: 1.5rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1.5rem;
  padding-bottom: 2rem;
  position: relative;
}

.timeline-time {
  position: relative;
  padding-top: 0.25rem;
}

.time-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  background: #6366f1;
  border: 3px solid #ddd6fe;
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 0.5rem;
}

.timeline-line {
  position: absolute;
  left: 5px;
  top: 2rem;
  bottom: -2rem;
  width: 2px;
  background: #e2e8f0;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-type {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8b5cf6;
}

.event-title-timeline {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.event-venue {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #64748b;
}

.venue-icon {
  width: 1rem;
  height: 1rem;
}

.event-availability {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  align-self: flex-start;
}

.availability--low {
  background: #fef3c7;
  color: #92400e;
}

.availability--high {
  background: #d1fae5;
  color: #065f46;
}

.event-quick-action {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-start;
  margin-top: 0.5rem;
}

.event-quick-action:hover {
  background: #f8fafc;
  border-color: #6366f1;
}

.timeline-footer {
  padding: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

.timeline-see-all {
  width: 100%;
  padding: 0.75rem;
  background: #f8fafc;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s;
}

.timeline-see-all:hover {
  background: #f1f5f9;
  color: #6366f1;
}

/* Stats */
.stats-compact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-compact {
  padding: 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  text-align: center;
}

.stat-number-compact {
  font-size: 2rem;
  font-weight: 800;
  color: #6366f1;
  margin-bottom: 0.25rem;
}

.stat-label-compact {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .hero-container {
    padding: 6rem 1.5rem 3rem;
  }
}

@media (max-width: 640px) {
  .filters-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-chip {
    justify-content: center;
  }

  .timeline-item {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }
}
</style>

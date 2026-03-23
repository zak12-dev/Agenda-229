<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo } from '#app'
// Cream Minimal — AppSection2

const todayEvents = ref<any[]>([])
const now = new Date()

const { data } = await useFetch('/api/events/index.front')
todayEvents.value = (data.value || []).filter(
  (e) => e.eventDate && !isNaN(new Date(e.eventDate).getTime())
)

// ── Événements du mois courant ou prochain ──
function getEventsByMonth(date: Date) {
  return todayEvents.value
    .filter((e) => {
      const d = new Date(e.eventDate)
      return d >= now && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    })
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
}

const displayedEvents = computed(() => {
  let current = new Date(now.getFullYear(), now.getMonth(), 1)
  let events = getEventsByMonth(current)
  while (events.length < 2) {
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
    events = getEventsByMonth(current)
    if (events.length === 0 && current.getFullYear() - now.getFullYear() > 1) break
  }
  return events.slice(0, 3)
})

const monthEvents = computed(() =>
  todayEvents.value.filter((e) => {
    if (!e.eventDate || isNaN(new Date(e.eventDate).getTime())) return false
    const d = new Date(e.eventDate)
    return d >= now && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
)

// ── Date affichée ──
const today = computed(() => ({
  day: new Date().toLocaleDateString('fr-FR', { weekday: 'long' }),
  date: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
}))

// ── Animation entrée ──
const isReady = ref(false)
setTimeout(() => { isReady.value = true }, 100)

// ── Avatar gradient cyclique ──
const getAvatarGradient = (name: string) => {
  const colors = [
    ['#ea6c1e','#f59e0b'], ['#5b47e0','#818cf8'], ['#059669','#34d399'],
    ['#dc2626','#f87171'], ['#0891b2','#67e8f9'], ['#7c3aed','#c4b5fd'],
  ]
  const i = (name?.charCodeAt(0) || 0) % colors.length
  return `linear-gradient(135deg, ${colors[i][0]}, ${colors[i][1]})`
}

const formatEventDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
</script>

<template>
  <section class="w-full bg-[#faf8f5] border-b border-[#ede8e0] font-outfit overflow-hidden">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24
             transition-all duration-700 ease-out"
      :class="isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'"
    >
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

        <!-- ══ COLONNE GAUCHE ══ -->
        <div class="flex flex-col gap-8">

          <!-- Date pill -->
          <div class="inline-flex items-center gap-2.5 w-fit px-3.5 py-2 rounded-full
                      bg-white border border-[#ede8e0] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span class="text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest capitalize">
              {{ today.day }}
            </span>
            <span class="w-px h-3 bg-[#ede8e0]" />
            <span class="text-[11px] font-medium text-[#b0a898] capitalize">{{ today.date }}</span>
          </div>

          <!-- Titre principal -->
          <div>
            <h1 class="text-[38px] sm:text-[48px] lg:text-[56px] font-bold text-[#1a1612]
                       leading-[1.08] tracking-tight mb-5">
              Que faire<br />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
                ce mois-ci
              </span> ?
            </h1>
            <p class="text-[15px] text-[#8a8078] leading-relaxed max-w-md">
              Découvrez les meilleurs événements près de chez vous, soigneusement sélectionnés chaque mois.
            </p>
          </div>

          

          <!-- CTA -->
          <button
            @click="navigateTo('/events')"
            class="hidden sm:inline-flex items-center gap-3 self-start
                   px-6 py-3.5 rounded-2xl
                   bg-[#1a1612] text-white text-[13.5px] font-semibold
                   shadow-[0_4px_20px_rgba(26,22,18,0.25)]
                   hover:shadow-[0_6px_28px_rgba(26,22,18,0.35)]
                   hover:-translate-y-0.5
                   transition-all duration-200"
          >
            Explorer tous les événements
            <div class="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        <!-- ══ COLONNE DROITE — Timeline ══ -->
        <div>
          <div class="bg-white rounded-2xl border border-[#ede8e0]
                      shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">

            <!-- Header timeline -->
            <div class="flex items-center justify-between px-5 py-4
                        border-b border-[#ede8e0] bg-[#faf8f5]">
              <div>
                <p class="text-[11px] font-semibold text-[#b0a898] uppercase tracking-widest mb-0.5">
                  Agenda
                </p>
                <h3 class="text-[15px] font-bold text-[#1a1612] capitalize">{{ today.date }}</h3>
              </div>
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl
                          bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
                <span class="w-2 h-2 rounded-full bg-emerald-400" />
                <span class="text-[11.5px] font-semibold text-[#4a3f32]">
                  {{ monthEvents.length }} événement{{ monthEvents.length > 1 ? 's' : '' }}
                </span>
              </div>
            </div>

            <!-- Liste timeline -->
            <div class="divide-y divide-[#ede8e0]">

              <!-- Skeleton loading -->
              <template v-if="!displayedEvents.length && todayEvents.length === 0">
                <div v-for="i in 3" :key="i" class="px-5 py-4 flex gap-4 animate-pulse">
                  <div class="w-14 h-14 rounded-xl bg-[#f0ede8] flex-shrink-0" />
                  <div class="flex-1 space-y-2 pt-1">
                    <div class="h-3 bg-[#f0ede8] rounded w-1/3" />
                    <div class="h-4 bg-[#f0ede8] rounded w-2/3" />
                    <div class="h-3 bg-[#f0ede8] rounded w-1/2" />
                  </div>
                </div>
              </template>

              <!-- Événements -->
              <div
                v-for="(event, index) in displayedEvents" :key="event.id"
                class="group px-5 py-4 flex items-start gap-4
                       hover:bg-[#faf5ee] transition-colors duration-150 cursor-pointer"
                @click="navigateTo(`/events/${event.id}`)"
              >
                <!-- Date box -->
                <div class="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center
                            border border-[#ede8e0] bg-[#f5f0e8]
                            group-hover:border-[#ea6c1e]/30 group-hover:bg-orange-50
                            transition-all duration-150">
                  <span class="text-[16px] font-bold text-[#ea6c1e] leading-none">
                    {{ new Date(event.eventDate).getDate() }}
                  </span>
                  <span class="text-[9px] font-semibold text-[#b0a898] uppercase tracking-wide mt-0.5">
                    {{ new Date(event.eventDate).toLocaleDateString('fr-FR', { month: 'short' }) }}
                  </span>
                </div>

                <!-- Contenu -->
                <div class="flex-1 min-w-0">
                  <!-- Catégorie + dot -->
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#5b47e0] flex-shrink-0" />
                    <span class="text-[10.5px] font-semibold text-[#5b47e0] uppercase tracking-wide truncate">
                      {{ event.category?.name }}
                    </span>
                  </div>
                  <!-- Titre -->
                  <h4 class="text-[13.5px] font-bold text-[#1a1612] truncate
                             group-hover:text-[#ea6c1e] transition-colors mb-1">
                    {{ event.title }}
                  </h4>
                  <!-- Lieu -->
                  <div class="flex items-center gap-1.5 text-[11.5px] text-[#b0a898]">
                    <UIcon name="i-heroicons-map-pin" class="w-3 h-3 flex-shrink-0" />
                    <span class="truncate">{{ event.location }}</span>
                  </div>
                </div>

                <!-- Flèche -->
                <div class="flex-shrink-0 w-7 h-7 rounded-xl bg-[#f5f0e8] border border-[#ede8e0]
                            flex items-center justify-center mt-0.5
                            group-hover:bg-gradient-to-br group-hover:from-[#ea6c1e] group-hover:to-[#5b47e0]
                            group-hover:border-transparent transition-all duration-200">
                  <UIcon name="i-heroicons-arrow-right"
                    class="w-3.5 h-3.5 text-[#c0b8ad] group-hover:text-white transition-colors" />
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="displayedEvents.length === 0 && todayEvents.length > 0"
                class="px-5 py-10 text-center">
                <div class="w-10 h-10 rounded-xl bg-[#f5f0e8] border border-[#ede8e0]
                            flex items-center justify-center mx-auto mb-3">
                  <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-[#c0b8ad]" />
                </div>
                <p class="text-[12.5px] font-medium text-[#b0a898]">Aucun événement ce mois-ci</p>
              </div>
            </div>

            <!-- Footer timeline -->
            <div class="px-5 py-3.5 border-t border-[#ede8e0] bg-[#faf8f5]">
              <button
                @click="navigateTo('/events')"
                class="w-full flex items-center justify-center gap-2
                       py-2.5 rounded-xl text-[12.5px] font-semibold
                       text-[#4a3f32] bg-white border border-[#ede8e0]
                       hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e]
                       hover:shadow-[0_2px_12px_rgba(234,108,30,0.1)]
                       transition-all duration-200"
              >
                Voir tous les événements du mois
                <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- CTA mobile -->
          <button
            @click="navigateTo('/events')"
            class="sm:hidden mt-4 w-full flex items-center justify-center gap-2
                   py-3.5 rounded-2xl text-[13.5px] font-semibold
                   text-white bg-[#1a1612]
                   shadow-[0_4px_20px_rgba(26,22,18,0.2)]
                   transition-all duration-200"
          >
            Explorer tous les événements
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
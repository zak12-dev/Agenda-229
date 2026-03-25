<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppSkeleton from '../../components/home/Appskeleton.vue'


// ─── Types ───────────────────────────────────────────────────────────────────

interface EventView {
  id: string
  eventId: string
  userId: string | null
  visitorId: string | null
  createdAt: string
  source: string | null
  country: string | null
  city: string | null
  device: string | null
  referrer: string | null
}

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  location: string
  price: number
  views: number
  status: string
  createdAt: string
  updatedAt: string
  userId: string
  categoryId: string
  villeId: string
  ville: { id: string; nomVille: string }
  category: { id: string; name: string }
  user: { id: string; name: string; email: string; image: string | null }
  viewsRelation?: EventView[]
}

// ─── State ───────────────────────────────────────────────────────────────────

const events = ref<Event[]>([])
const allViews = ref<EventView[]>([])
const loading = ref(true)
const viewPeriod = ref<'day' | 'week' | 'month'>('day')
const activeSection = ref<'overview' | 'trends' | 'sources' | 'geo' | 'devices' | 'compare'>('overview')

// ─── Données plateforme (comparaison) ────────────────────────────────────────
interface PlatformStats {
  totalViews: number
  totalEvents: number
  avgViews: number
  top10Threshold: number
  top25Threshold: number
  viewsThisWeek: number
}
interface MyEventRanked {
  id: string
  title: string
  views: number
  percentile: number
  isTop10: boolean
  isTop25: boolean
}
const platformStats = ref<PlatformStats | null>(null)
const myEventsRanked = ref<MyEventRanked[]>([])

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchEvents = async () => {
  loading.value = true
  try {
    // Fetch événements + analytics en parallèle
    const [eventsData, analyticsData] = await Promise.all([
      $fetch<Event[]>('/api/events'),
      $fetch<{ views: EventView[]; platform: PlatformStats; myEventsRanked: MyEventRanked[] }>(
        '/api/admin/analytics/views'
      ),
    ])
    events.value = eventsData
    allViews.value = analyticsData.views
    platformStats.value = analyticsData.platform
    myEventsRanked.value = analyticsData.myEventsRanked
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchEvents)

// ─── Métriques globales ───────────────────────────────────────────────────────

const metrics = computed(() => {
  const total = events.value.length
  const actifs = events.value.filter(e => e.status === 'PUBLISHED').length
  const brouillons = events.value.filter(e => e.status === 'DRAFT').length
  const totalViews = events.value.reduce((s, e) => s + (e.views || 0), 0)

  // Calcul tendance : vues 7 derniers jours vs 7 jours précédents
  const now = Date.now()
  const d7 = 7 * 864e5
  const last7 = allViews.value.filter(v => now - new Date(v.createdAt).getTime() < d7).length
  const prev7 = allViews.value.filter(v => {
    const age = now - new Date(v.createdAt).getTime()
    return age >= d7 && age < d7 * 2
  }).length
  const trendPct = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : 0

  return { total, actifs, brouillons, totalViews, avgViews: total > 0 ? Math.round(totalViews / total) : 0, last7, trendPct }
})

// ─── Évolution des vues dans le temps ─────────────────────────────────────────

const trendData = computed(() => {
  const now = new Date()
  const buckets: Record<string, number> = {}

  if (viewPeriod.value === 'day') {
    // 14 derniers jours
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      buckets[key] = 0
    }
    allViews.value.forEach(v => {
      const d = new Date(v.createdAt)
      const age = (now.getTime() - d.getTime()) / 864e5
      if (age <= 14) {
        const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        if (key in buckets) buckets[key]++
      }
    })
  } else if (viewPeriod.value === 'week') {
    // 8 dernières semaines
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const key = `S${getWeekNumber(d)} ${d.getFullYear()}`
      buckets[key] = 0
    }
    allViews.value.forEach(v => {
      const d = new Date(v.createdAt)
      const age = (now.getTime() - d.getTime()) / (864e5 * 7)
      if (age <= 8) {
        const key = `S${getWeekNumber(d)} ${d.getFullYear()}`
        if (key in buckets) buckets[key]++
      }
    })
  } else {
    // 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      buckets[key] = 0
    }
    allViews.value.forEach(v => {
      const d = new Date(v.createdAt)
      const key = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      if (key in buckets) buckets[key]++
    })
  }

  const entries = Object.entries(buckets)
  const maxVal = Math.max(...entries.map(([, v]) => v), 1)
  return entries.map(([label, value], i, arr) => ({
    label,
    value,
    pct: Math.round((value / maxVal) * 100),
    isLast: i === arr.length - 1,
    // Pic détecté : valeur > 2x la valeur précédente
    isPeak: i > 0 && value > arr[i - 1][1] * 2 && value > 5,
  }))
})

function getWeekNumber(d: Date) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 864e5 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

// Pic maximal détecté
const peakDay = computed(() => {
  if (!trendData.value.length) return null
  const peak = [...trendData.value].sort((a, b) => b.value - a.value)[0]
  return peak.value > 0 ? peak : null
})

// ─── Sources de trafic ────────────────────────────────────────────────────────

const sourceConfig: Record<string, { label: string; color: string; icon: string; bg: string }> = {
  FACEBOOK:  { label: 'Facebook',   color: '#1877f2', icon: '📘', bg: 'rgba(24,119,242,0.1)' },
  WHATSAPP:  { label: 'WhatsApp',   color: '#25d366', icon: '💬', bg: 'rgba(37,211,102,0.1)' },
  INSTAGRAM: { label: 'Instagram',  color: '#e1306c', icon: '📸', bg: 'rgba(225,48,108,0.1)' },
  GOOGLE:    { label: 'Google',     color: '#ea4335', icon: '🔍', bg: 'rgba(234,67,53,0.1)' },
  DIRECT:    { label: 'Direct',     color: '#8a8078', icon: '🔗', bg: 'rgba(138,128,120,0.1)' },
  PLATFORM:  { label: 'Plateforme', color: '#5b47e0', icon: '🌐', bg: 'rgba(91,71,224,0.1)' },
}

const sourceData = computed(() => {
  const counts: Record<string, number> = {}
  allViews.value.forEach(v => {
    const src = v.source || 'DIRECT'
    counts[src] = (counts[src] || 0) + 1
  })
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      key,
      count,
      pct: Math.round((count / total) * 100),
      ...(sourceConfig[key] || { label: key, color: '#c0b8ad', icon: '🌐', bg: 'rgba(192,184,173,0.1)' }),
    }))
})

// Graphique donut SVG simplifié
const donutSegments = computed(() => {
  const total = sourceData.value.reduce((s, d) => s + d.count, 0) || 1
  const r = 60
  const cx = 80
  const cy = 80
  const circumference = 2 * Math.PI * r
  let offset = 0
  return sourceData.value.map(d => {
    const pct = d.count / total
    const dash = pct * circumference
    const gap = circumference - dash
    const seg = { ...d, dash, gap, offset: -offset * circumference }
    offset += pct
    return seg
  })
})

// ─── Géographie ───────────────────────────────────────────────────────────────

const cityData = computed(() => {
  const counts: Record<string, number> = {}
  allViews.value.forEach(v => { if (v.city) counts[v.city] = (counts[v.city] || 0) + 1 })
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city, count], i) => ({ city, count, pct: Math.round((count / total) * 100), rank: i + 1 }))
})

const countryData = computed(() => {
  const counts: Record<string, number> = {}
  allViews.value.forEach(v => { if (v.country) counts[v.country] = (counts[v.country] || 0) + 1 })
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([country, count]) => ({ country, count, pct: Math.round((count / total) * 100) }))
})

// ─── Appareils ────────────────────────────────────────────────────────────────

const deviceConfig: Record<string, { label: string; icon: string; color: string; iconColor: string }> = {
  mobile:  { label: 'Mobile',  icon: 'i-heroicons-device-phone-mobile', color: '#ea6c1e', iconColor: 'text-[#ea6c1e]' },
  desktop: { label: 'Desktop', icon: 'i-heroicons-computer-desktop',    color: '#5b47e0', iconColor: 'text-indigo-500' },
  tablet:  { label: 'Tablette', icon: 'i-heroicons-device-tablet',      color: '#059669', iconColor: 'text-emerald-600' },
}

const deviceData = computed(() => {
  const counts: Record<string, number> = {}
  allViews.value.forEach(v => { const d = v.device || 'mobile'; counts[d] = (counts[d] || 0) + 1 })
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      key, count, pct: Math.round((count / total) * 100),
      ...(deviceConfig[key] || { label: key, icon: 'i-heroicons-device-phone-mobile', color: '#c0b8ad', iconColor: 'text-[#c0b8ad]' }),
    }))
})

// ─── Top événements ───────────────────────────────────────────────────────────

const topEvents = computed(() => {
  return [...events.value]
    .filter(e => e.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
    .map((e, i) => {
      const max = events.value.reduce((m, ev) => Math.max(m, ev.views || 0), 1)
      return { ...e, pct: Math.round((e.views / max) * 100), rank: i + 1 }
    })
})

// ─── Comparaison plateforme ───────────────────────────────────────────────────

const platformComparison = computed(() => {
  if (!platformStats.value || myEventsRanked.value.length === 0) return null

  const p = platformStats.value
  const ranked = myEventsRanked.value

  const inTop10  = ranked.filter(e => e.isTop10).length
  const inTop25  = ranked.filter(e => e.isTop25).length
  const avgPercentile = Math.round(ranked.reduce((s, e) => s + e.percentile, 0) / ranked.length)
  const best = ranked[0] ?? null

  return { p, ranked, inTop10, inTop25, avgPercentile, best }
})

// Analyse prédictive simplifiée
const prediction = computed(() => {
  const last7 = metrics.value.last7
  const prev7 = allViews.value.filter(v => {
    const age = (Date.now() - new Date(v.createdAt).getTime()) / 864e5
    return age >= 7 && age < 14
  }).length
  const trend = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : 0
  const isUp = trend > 0
  const isFlat = Math.abs(trend) < 5
  return { trend: Math.round(Math.abs(trend)), isUp, isFlat }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n)
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

const getStatusBadge = (s: string) => ({
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  DRAFT: 'bg-amber-50 text-amber-700 border border-amber-200',
}[s] || 'bg-[#f5f0e8] text-[#8a8078] border border-[#ede8e0]')

const getStatusDot = (s: string) => ({ PUBLISHED: 'bg-emerald-500', DRAFT: 'bg-amber-500' }[s] || 'bg-[#c0b8ad]')
const getStatusLabel = (s: string) => ({ PUBLISHED: 'Publié', DRAFT: 'Brouillon' }[s] || s)

const rankMedal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`

const navSections = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: 'i-heroicons-squares-2x2' },
  { key: 'trends',   label: 'Tendances',       icon: 'i-heroicons-chart-bar' },
  { key: 'sources',  label: 'Sources',          icon: 'i-heroicons-arrow-trending-up' },
  { key: 'geo',      label: 'Géographie',       icon: 'i-heroicons-map' },
  { key: 'devices',  label: 'Appareils',        icon: 'i-heroicons-device-phone-mobile' },
  { key: 'compare',  label: 'Comparaison',      icon: 'i-heroicons-trophy' },
]
</script>

<template>
  <div class="bg-[#f5f3ef] px-4 pt-4 pb-32 sm:px-6 sm:pb-12 font-outfit w-full min-h-screen overflow-y-auto">
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- ══ NAV SECTIONS ══ -->
      <div class="  bg-white rounded-2xl border border-[#ede8e0] p-1.5 flex justify-between gap-1
                  overflow-x-auto scrollbar-none shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <button
          v-for="s in navSections" :key="s.key"
          @click="activeSection = s.key as any"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0',
            activeSection === s.key
              ? 'bg-[#1a1612] text-white shadow-sm'
              : 'text-[#8a8078] hover:bg-[#f5f0e8] hover:text-[#4a3f32]'
          ]"
        >
          <UIcon :name="s.icon" class="w-3.5 h-3.5" />
          {{ s.label }}
        </button>
      </div>

      <!-- ══════════════════════════════════
           SECTION : VUE D'ENSEMBLE
      ══════════════════════════════════ -->
      <template v-if="activeSection === 'overview'">

        <!-- KPI Cards -->
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AppSkeleton v-for="i in 4" :key="i" variant="dashboard-stat" />
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="kpi-card">
            <div class="flex items-start justify-between mb-2">
              <p class="kpi-label">Événements</p>
              <div class="kpi-icon bg-orange-50 border-orange-100">
                <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5 text-[#ea6c1e]" />
              </div>
            </div>
            <p class="kpi-value">{{ metrics.total }}</p>
            <p class="kpi-sub mt-1">{{ metrics.actifs }} publiés</p>
          </div>

          <div class="kpi-card">
            <div class="flex items-start justify-between mb-2">
              <p class="kpi-label">Vues totales</p>
              <div class="kpi-icon bg-indigo-50 border-indigo-100">
                <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5 text-indigo-500" />
              </div>
            </div>
            <p class="kpi-value">{{ formatNumber(metrics.totalViews) }}</p>
            <p class="kpi-sub mt-1">Moy. {{ metrics.avgViews }}/événement</p>
          </div>

          <div class="kpi-card">
            <div class="flex items-start justify-between mb-2">
              <p class="kpi-label">7 derniers jours</p>
              <div class="kpi-icon bg-emerald-50 border-emerald-100">
                <UIcon name="i-heroicons-chart-bar" class="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <p class="kpi-value">{{ formatNumber(metrics.last7) }}</p>
            <div class="flex items-center gap-1 mt-1">
              <span :class="['text-[11px] font-semibold flex items-center gap-0.5',
                metrics.trendPct > 0 ? 'text-emerald-600' : metrics.trendPct < 0 ? 'text-red-500' : 'text-[#b0a898]']">
                <UIcon :name="metrics.trendPct > 0 ? 'i-heroicons-arrow-trending-up' : metrics.trendPct < 0 ? 'i-heroicons-arrow-trending-down' : 'i-heroicons-minus'" class="w-3 h-3" />
                {{ Math.abs(metrics.trendPct) }}%
              </span>
              <span class="text-[10px] text-[#c0b8ad]">vs semaine préc.</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="flex items-start justify-between mb-2">
              <p class="kpi-label">Brouillons</p>
              <div class="kpi-icon bg-amber-50 border-amber-100">
                <UIcon name="i-heroicons-pencil" class="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
            <p class="kpi-value">{{ metrics.brouillons }}</p>
            <p class="kpi-sub mt-1">En attente de publication</p>
          </div>
        </div>

        <!-- Analyse prédictive banner -->
        <div :class="[
          'rounded-2xl border p-4 flex items-start gap-4',
          prediction.isFlat
            ? 'bg-[#faf8f5] border-[#ede8e0]'
            : prediction.isUp
              ? 'bg-emerald-50 border-emerald-100'
              : 'bg-red-50 border-red-100'
        ]">
          <div :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            prediction.isFlat ? 'bg-[#f0ede8]' : prediction.isUp ? 'bg-emerald-100' : 'bg-red-100'
          ]">
            <UIcon
              :name="prediction.isFlat ? 'i-heroicons-minus' : prediction.isUp ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
              :class="['w-5 h-5', prediction.isFlat ? 'text-[#8a8078]' : prediction.isUp ? 'text-emerald-600' : 'text-red-500']"
            />
          </div>
          <div>
            <p class="text-[13px] font-bold text-[#1a1612] mb-0.5">
              <template v-if="prediction.isFlat">Activité stable cette semaine</template>
              <template v-else-if="prediction.isUp">Les vues augmentent de {{ prediction.trend }}% cette semaine</template>
              <template v-else>Les vues ont baissé de {{ prediction.trend }}% cette semaine</template>
            </p>
            <p class="text-[12px] text-[#8a8078]">
              <template v-if="prediction.isUp">Votre communication fonctionne bien continuez sur cette lancée.</template>
              <template v-else-if="prediction.isFlat">Essayez une publication sur les réseaux pour booster la visibilité.</template>
              <template v-else>Envisagez une publication Facebook ou WhatsApp pour relancer la visibilité.</template>
            </p>
          </div>
        </div>

        <!-- Top événements -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="px-5 py-4 border-b border-[#ede8e0] bg-[#faf8f5]">
            <p class="text-[13.5px] font-bold text-[#1a1612]">Top événements</p>
            <p class="text-[11px] text-[#b0a898] mt-0.5">Classés par nombre de vues</p>
          </div>
          <div class="p-5 space-y-3.5">
            <template v-if="loading">
              <AppSkeleton v-for="i in 5" :key="i" variant="dashboard-event-row" />
            </template>
            <div v-else v-for="ev in topEvents" :key="ev.id" class="group">
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <p class="text-[12.5px] font-medium text-[#4a3f32] truncate">{{ ev.title }}</p>
                  
                </div>
                <span class="text-[12px] font-bold text-[#ea6c1e] ml-3 flex-shrink-0">{{ formatNumber(ev.views) }}</span>
              </div>
              <div class="h-4 bg-[#f0ede8] rounded-lg overflow-hidden">
                <div
                  class="h-full rounded-lg transition-all duration-700"
                  :style="{
                    width: `${ev.pct}%`,
                    background: ev.rank === 1 ? 'linear-gradient(90deg,#ea6c1e,#f59e6e)'
                              : ev.rank === 2 ? 'linear-gradient(90deg,#5b47e0,#8b7ff5)'
                              : ev.rank === 3 ? 'linear-gradient(90deg,#059669,#34d399)'
                              : 'linear-gradient(90deg,#c0b8ad,#d4cec5)'
                  }"
                />
              </div>
            </div>
            <div v-if="!loading && topEvents.length === 0" class="py-10 text-center text-[#b0a898] text-[13px]">
              Aucune vue enregistrée
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════
           SECTION : TENDANCES
      ══════════════════════════════════ -->
      <template v-if="activeSection === 'trends'">
        <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <!-- Header + Switcher période -->
          <div class="px-5 py-4 border-b border-[#ede8e0] bg-[#faf8f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p class="text-[13.5px] font-bold text-[#1a1612]">Évolution des vues</p>
              <p class="text-[11px] text-[#b0a898] mt-0.5">
                Détectez les pics et comprenez quand votre promotion fonctionne
              </p>
            </div>
            <div class="flex bg-[#f5f0e8] border border-[#ede8e0] rounded-xl p-1 gap-1 self-start">
              <button v-for="p in [['day','Jours'],['week','Semaines'],['month','Mois']]" :key="p[0]"
                @click="viewPeriod = p[0] as any"
                :class="['sort-pill', viewPeriod === p[0] ? 'sort-pill--active' : '']">
                {{ p[1] }}
              </button>
            </div>
          </div>

          <div class="p-5">
            <!-- Pic détecté -->
            <div v-if="peakDay" class="mb-4 flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl">
              <p class="text-[12.5px] text-[#ea6c1e] font-medium">
                Pic détecté le <strong>{{ peakDay.label }}</strong> :{{ formatNumber(peakDay.value) }} vues.
                Une publication sur les réseaux pourrait expliquer ce pic.
              </p>
            </div>

            <!-- Graphique barres verticales -->
            <AppSkeleton v-if="loading" variant="dashboard-chart" />

            <div v-else class="overflow-x-auto pb-2">
              <div class="flex items-end gap-1.5 min-w-max" style="height: 200px">
                <div v-for="(m, i) in trendData" :key="i"
                  class="flex flex-col items-center gap-1 group flex-shrink-0"
                  :style="`width: ${viewPeriod === 'day' ? 36 : 52}px`">
                  <div class="relative w-full flex items-end justify-center" style="height:160px">
                    <!-- Tooltip -->
                    <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a1612] text-white
                                text-[9px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap
                                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      {{ formatNumber(m.value) }} vues
                    </div>
                    <!-- Barre -->
                    <div
                      class="w-full rounded-t-lg transition-all duration-700 cursor-pointer relative overflow-hidden"
                      :style="{
                        height: `${Math.max(m.pct, 3)}%`,
                        background: m.isPeak
                          ? 'linear-gradient(180deg,#ea6c1e,#f59e6e)'
                          : m.isLast
                            ? 'linear-gradient(180deg,#5b47e0,#8b7ff5)'
                            : 'linear-gradient(180deg,#c0b8ad,#d4cec5)',
                      }"
                    >
                      <!-- Étiquette pic -->
                    </div>
                  </div>
                  <span class="text-[9px] font-medium text-[#b0a898] text-center leading-tight">
                    {{ m.label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Légende -->
            <div class="mt-4 pt-3 border-t border-[#ede8e0] flex items-center gap-4 flex-wrap text-[10.5px] text-[#8a8078]">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-sm" style="background:linear-gradient(#ea6c1e,#f59e6e)" />
                Pic de trafic
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-sm" style="background:linear-gradient(#5b47e0,#8b7ff5)" />
                Période actuelle
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-sm bg-[#c0b8ad]" />
                Périodes précédentes
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════
           SECTION : SOURCES DE TRAFIC
      ══════════════════════════════════ -->
      <template v-if="activeSection === 'sources'">
        <div class="grid sm:grid-cols-2 gap-4">

          <!-- Donut -->
          <div class="bg-white rounded-2xl border border-[#ede8e0] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p class="text-[13.5px] font-bold text-[#1a1612] mb-1">Répartition des sources</p>
            <p class="text-[11px] text-[#b0a898] mb-4">D'où viennent vos visiteurs</p>

            <div class="flex items-center justify-center">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="60" fill="none" stroke="#f0ede8" stroke-width="22" />
                <circle
                  v-for="(seg, i) in donutSegments" :key="i"
                  cx="80" cy="80" r="60" fill="none"
                  :stroke="seg.color"
                  stroke-width="22"
                  :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                  :stroke-dashoffset="seg.offset"
                  stroke-linecap="round"
                  transform="rotate(-90 80 80)"
                  style="transition: all 0.7s ease"
                />
                <!-- Centre -->
                <text x="80" y="75" text-anchor="middle" font-size="18" font-weight="700" fill="#1a1612" font-family="Outfit">
                  {{ allViews.length }}
                </text>
                <text x="80" y="92" text-anchor="middle" font-size="9" fill="#b0a898" font-family="Outfit">
                  vues totales
                </text>
              </svg>
            </div>
          </div>

          <!-- Barres sources -->
          <div class="bg-white rounded-2xl border border-[#ede8e0] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p class="text-[13.5px] font-bold text-[#1a1612] mb-1">Détail par source</p>
            <p class="text-[11px] text-[#b0a898] mb-4">Concentrez votre marketing où ça marche</p>

            <template v-if="loading">
              <AppSkeleton v-for="i in 5" :key="i" variant="dashboard-event-row" />
            </template>

            <div v-else-if="sourceData.length === 0" class="py-8 text-center text-[#b0a898] text-[12px]">
              Aucune donnée de source disponible
            </div>

            <div v-else class="space-y-3">
              <div v-for="src in sourceData" :key="src.key">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <span class="text-base">{{ src.icon }}</span>
                    <span class="text-[12.5px] font-medium text-[#4a3f32]">{{ src.label }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-bold" :style="`color: ${src.color}`">{{ src.pct }}%</span>
                    <span class="text-[10.5px] text-[#c0b8ad]">{{ formatNumber(src.count) }}</span>
                  </div>
                </div>
                <div class="h-4 bg-[#f0ede8] rounded-lg overflow-hidden">
                  <div class="h-full rounded-lg transition-all duration-700"
                    :style="{ width: `${src.pct}%`, background: `linear-gradient(90deg, ${src.color}cc, ${src.color})` }" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Conseil marketing -->
        <div v-if="sourceData.length > 0" class="bg-white rounded-2xl border border-[#ede8e0] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-[#ea6c1e]" />
            </div>
            <div>
              <p class="text-[13px] font-bold text-[#1a1612] mb-1">Conseil marketing</p>
              <p class="text-[12.5px] text-[#8a8078] leading-relaxed">
                Votre principale source de trafic est <strong class="text-[#1a1612]">{{ sourceData[0]?.label }}</strong>
                avec <strong class="text-[#ea6c1e]">{{ sourceData[0]?.pct }}%</strong> des vues.
                Continuez à publier régulièrement sur ce canal.
                <span v-if="sourceData[1]">
                  <strong class="text-[#1a1612]">{{ sourceData[1].label }}</strong> est votre 2ème source 
                  investissez-y davantage pour booster votre visibilité.
                </span>
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════
           SECTION : GÉOGRAPHIE
      ══════════════════════════════════ -->
      <template v-if="activeSection === 'geo'">
        <div class="grid sm:grid-cols-2 gap-4">

          <!-- Villes -->
          <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div class="px-5 py-4 border-b border-[#ede8e0] bg-[#faf8f5]">
              <p class="text-[13.5px] font-bold text-[#1a1612]">Par ville</p>
              <p class="text-[11px] text-[#b0a898] mt-0.5">Où se trouvent vos visiteurs</p>
            </div>
            <div class="p-5">
              <template v-if="loading">
                <AppSkeleton v-for="i in 5" :key="i" variant="dashboard-event-row" />
              </template>
              <div v-else-if="cityData.length === 0" class="py-10 text-center text-[#b0a898] text-[12px]">
                Aucune donnée géographique disponible
              </div>
              <div v-else class="space-y-3">
                <div v-for="c in cityData" :key="c.city">
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[13px]">{{ c.rank <= 3 ? rankMedal(c.rank) : `#${c.rank}` }}</span>
                      <span class="text-[12.5px] font-medium text-[#4a3f32]">{{ c.city }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-bold text-[#ea6c1e]">{{ c.pct }}%</span>
                      <span class="text-[10.5px] text-[#c0b8ad]">{{ formatNumber(c.count) }}</span>
                    </div>
                  </div>
                  <div class="h-3.5 bg-[#f0ede8] rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                      :style="{ width: `${c.pct}%`, background: c.rank === 1 ? 'linear-gradient(90deg,#ea6c1e,#f59e6e)' : c.rank === 2 ? 'linear-gradient(90deg,#5b47e0,#8b7ff5)' : 'linear-gradient(90deg,#c0b8ad,#d4cec5)' }" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pays -->
          <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div class="px-5 py-4 border-b border-[#ede8e0] bg-[#faf8f5]">
              <p class="text-[13.5px] font-bold text-[#1a1612]">Par pays</p>
              <p class="text-[11px] text-[#b0a898] mt-0.5">Rayonnement international</p>
            </div>
            <div class="p-5">
              <template v-if="loading">
                <AppSkeleton v-for="i in 4" :key="i" variant="dashboard-event-row" />
              </template>
              <div v-else-if="countryData.length === 0" class="py-10 text-center text-[#b0a898] text-[12px]">
                Aucune donnée de pays disponible
              </div>
              <div v-else class="space-y-3">
                <div v-for="c in countryData" :key="c.country">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[12.5px] font-medium text-[#4a3f32]">{{ c.country }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-bold text-indigo-500">{{ c.pct }}%</span>
                      <span class="text-[10.5px] text-[#c0b8ad]">{{ formatNumber(c.count) }}</span>
                    </div>
                  </div>
                  <div class="h-3.5 bg-[#f0ede8] rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                      :style="{ width: `${c.pct}%`, background: 'linear-gradient(90deg,#5b47e0,#8b7ff5)' }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info utile -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p class="text-[13px] font-bold text-[#1a1612] mb-1">Conseil géographique</p>
              <p class="text-[12.5px] text-[#8a8078] leading-relaxed">
                <span v-if="cityData.length > 0">
                  <strong class="text-[#1a1612]">{{ cityData[0].city }}</strong> représente
                  <strong class="text-[#ea6c1e]">{{ cityData[0].pct }}%</strong> de vos visiteurs.
                  Planifiez vos prochains événements dans cette zone pour maximiser l'audience.
                </span>
                <span v-else>Collectez plus de données pour obtenir des insights géographiques.</span>
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════
           SECTION : APPAREILS
      ══════════════════════════════════ -->
      <template v-if="activeSection === 'devices'">
        <div class="grid sm:grid-cols-3 gap-4">
          <div v-for="d in deviceData" :key="d.key"
            class="bg-white rounded-2xl border border-[#ede8e0] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center border"
                :style="`background: ${d.key === 'mobile' ? 'rgba(234,108,30,0.08)' : d.key === 'desktop' ? 'rgba(91,71,224,0.08)' : 'rgba(5,150,105,0.08)'}; border-color: ${d.color}22`">
                <UIcon :name="d.icon" class="w-5 h-5" :style="`color: ${d.color}`" />
              </div>
              <div>
                <p class="text-[13.5px] font-bold text-[#1a1612]">{{ d.label }}</p>
                <p class="text-[11px] text-[#b0a898]">{{ formatNumber(d.count) }} vues</p>
              </div>
            </div>

            <!-- Anneau progress -->
            <div class="relative flex items-center justify-center my-4">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="#f0ede8" stroke-width="10" />
                <circle cx="48" cy="48" r="38" fill="none"
                  :stroke="d.color"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="`${(d.pct / 100) * 238.76} 238.76`"
                  stroke-dashoffset="59.69"
                  transform="rotate(-90 48 48)"
                  style="transition: stroke-dasharray 0.8s ease"
                />
                <text x="48" y="44" text-anchor="middle" font-size="18" font-weight="700" fill="#1a1612" font-family="Outfit">
                  {{ d.pct }}%
                </text>
                <text x="48" y="60" text-anchor="middle" font-size="8" fill="#b0a898" font-family="Outfit">
                  du trafic
                </text>
              </svg>
            </div>

            <div class="h-1.5 bg-[#f0ede8] rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                :style="{ width: `${d.pct}%`, background: `linear-gradient(90deg, ${d.color}88, ${d.color})` }" />
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="!loading && deviceData.length === 0" class="sm:col-span-3 py-16 text-center">
            <div class="w-14 h-14 rounded-2xl bg-[#f5f0e8] border border-[#ede8e0] flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6 text-[#c0b8ad]" />
            </div>
            <p class="text-[13px] font-medium text-[#8a8078]">Aucune donnée d'appareil disponible</p>
          </div>
        </div>

        <!-- Conseil -->
        <div v-if="deviceData.length > 0" class="bg-white rounded-2xl border border-[#ede8e0] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-[#ea6c1e]" />
            </div>
            <div>
              <p class="text-[13px] font-bold text-[#1a1612] mb-1">Conseil d'optimisation</p>
              <p class="text-[12.5px] text-[#8a8078] leading-relaxed">
                <span v-if="deviceData[0]?.key === 'mobile'">
                  <strong class="text-[#ea6c1e]">{{ deviceData[0].pct }}%</strong> de vos visiteurs utilisent un <strong class="text-[#1a1612]">mobile</strong>.
                  Assurez-vous que vos pages et affiches sont optimisées pour le format vertical.
                </span>
                <span v-else>
                  La majorité de vos visiteurs vient depuis un <strong class="text-[#1a1612]">{{ deviceData[0]?.label }}</strong>.
                  Optimisez votre expérience pour ce format.
                </span>
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════
           SECTION : COMPARAISON
      ══════════════════════════════════ -->
      <template v-if="activeSection === 'compare'">

        <!-- Chargement / pas de données -->
        <div v-if="!platformComparison" class="bg-white rounded-2xl border border-[#ede8e0] p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <AppSkeleton v-if="loading" variant="dashboard-chart" />
          <div v-else>
            <div class="w-14 h-14 rounded-2xl bg-[#f5f0e8] border border-[#ede8e0] flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-trophy" class="w-6 h-6 text-[#c0b8ad]" />
            </div>
            <p class="text-[13px] font-medium text-[#8a8078]">Aucune donnée de comparaison disponible</p>
            <p class="text-[12px] text-[#b0a898] mt-1">Publiez des événements pour voir votre position sur la plateforme</p>
          </div>
        </div>

        <template v-else>

          <!-- ── Stats plateforme globales ── -->
          <div class="grid grid-cols-3 gap-3">
            <div class="kpi-card text-center">
              <p class="kpi-label mb-1">Événements publiés</p>
              <p class="kpi-value">{{ formatNumber(platformComparison.p.totalEvents) }}</p>
              <p class="kpi-sub mt-1">sur la plateforme</p>
            </div>
            <div class="kpi-card text-center">
              <p class="kpi-label mb-1">Vues totales</p>
              <p class="kpi-value">{{ formatNumber(platformComparison.p.totalViews) }}</p>
              <p class="kpi-sub mt-1">sur la plateforme</p>
            </div>
            <div class="kpi-card text-center">
              <p class="kpi-label mb-1">Moyenne / événement</p>
              <p class="kpi-value">{{ formatNumber(platformComparison.p.avgViews) }}</p>
              <p class="kpi-sub mt-1">vues en moyenne</p>
            </div>
          </div>

          <!-- ── Score global ── -->
          <div class="bg-white rounded-2xl border border-[#ede8e0] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">

              <!-- Anneau percentile moyen -->
              <div class="relative flex-shrink-0">
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="46" fill="none" stroke="#f0ede8" stroke-width="12" />
                  <circle cx="55" cy="55" r="46" fill="none"
                    stroke="url(#grad-compare)"
                    stroke-width="12"
                    stroke-linecap="round"
                    :stroke-dasharray="`${(platformComparison.avgPercentile / 100) * 289} 289`"
                    stroke-dashoffset="72"
                    transform="rotate(-90 55 55)"
                    style="transition: stroke-dasharray 1s ease"
                  />
                  <defs>
                    <linearGradient id="grad-compare" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#ea6c1e" />
                      <stop offset="100%" stop-color="#5b47e0" />
                    </linearGradient>
                  </defs>
                  <text x="55" y="50" text-anchor="middle" font-size="20" font-weight="700" fill="#1a1612" font-family="Outfit">
                    {{ platformComparison.avgPercentile }}%
                  </text>
                  <text x="55" y="66" text-anchor="middle" font-size="8" fill="#b0a898" font-family="Outfit">percentile</text>
                  <text x="55" y="77" text-anchor="middle" font-size="8" fill="#b0a898" font-family="Outfit">moyen</text>
                </svg>
              </div>

              <!-- Texte performance -->
              <div class="flex-1">
                <p class="text-[15px] font-bold text-[#1a1612] mb-2">Votre position sur la plateforme</p>
                <p class="text-[13px] text-[#8a8078] leading-relaxed mb-4">
                  Vos événements sont en moyenne dans le
                  <strong class="text-[#ea6c1e]">top {{ 100 - platformComparison.avgPercentile }}%</strong>
                  des événements de la plateforme.
                  La moyenne plateforme est de
                  <strong class="text-[#1a1612]">{{ formatNumber(platformComparison.p.avgViews) }}</strong> vues par événement.
                </p>

                <!-- Badges top 10 / top 25 -->
                <div class="flex flex-wrap gap-2">
                  <div v-if="platformComparison.inTop10 > 0"
                    class="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl">
                    <p class="text-[12px] font-semibold text-[#ea6c1e]">
                      {{ platformComparison.inTop10 }} événement{{ platformComparison.inTop10 > 1 ? 's' : '' }} dans le top 10% de la plateforme
                    </p>
                  </div>
                  <div v-if="platformComparison.inTop25 > platformComparison.inTop10"
                    class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p class="text-[12px] font-semibold text-indigo-600">
                      {{ platformComparison.inTop25 - platformComparison.inTop10 }} événement{{ (platformComparison.inTop25 - platformComparison.inTop10) > 1 ? 's' : '' }} dans le top 25%
                    </p>
                  </div>
                  <div v-if="platformComparison.inTop10 === 0 && platformComparison.inTop25 === 0"
                    class="flex items-center gap-2 px-3 py-1.5 bg-[#faf8f5] border border-[#ede8e0] rounded-xl">
                    <p class="text-[12px] font-medium text-[#8a8078]">
                      Boostez vos événements pour entrer dans le top 25% de la plateforme
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Tableau classement par événement ── -->
          <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div class="px-5 py-4 border-b border-[#ede8e0] bg-[#faf8f5] flex items-center justify-between">
              <div>
                <p class="text-[13.5px] font-bold text-[#1a1612]">Position de chaque événement</p>
                <p class="text-[11px] text-[#b0a898] mt-0.5">
                  Comparé aux {{ formatNumber(platformComparison.p.totalEvents) }} événements publiés sur la plateforme
                </p>
              </div>
              <!-- Seuil top 10 -->
              <div class="hidden sm:flex items-center gap-1.5 text-[11px] text-[#8a8078]">
                <span class="w-2 h-2 rounded-full bg-[#ea6c1e]" />
                Top 10% ≥ {{ formatNumber(platformComparison.p.top10Threshold) }} vues
              </div>
            </div>

            <div class="divide-y divide-[#ede8e0]">
              <div v-for="ev in platformComparison.ranked" :key="ev.id"
                class="px-5 py-3.5 flex items-center gap-4 hover:bg-[#faf5ee] transition-colors">

                <!-- Médaille ou rang -->
               

                <!-- Titre -->
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-[13px] text-[#1a1612] truncate">{{ ev.title }}</p>
                  <p class="text-[11px] text-[#b0a898] mt-0.5">{{ formatNumber(ev.views) }} vues</p>
                </div>

                <!-- Barre percentile -->
                <div class="hidden sm:flex items-center gap-3 flex-shrink-0 w-48">
                  <div class="flex-1 h-2 bg-[#f0ede8] rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                      :style="{
                        width: `${ev.percentile}%`,
                        background: ev.isTop10
                          ? 'linear-gradient(90deg,#ea6c1e,#f59e6e)'
                          : ev.isTop25
                            ? 'linear-gradient(90deg,#5b47e0,#8b7ff5)'
                            : 'linear-gradient(90deg,#c0b8ad,#d4cec5)'
                      }" />
                  </div>
                  <span class="text-[11.5px] font-bold w-10 text-right"
                    :class="ev.isTop10 ? 'text-[#ea6c1e]' : ev.isTop25 ? 'text-indigo-500' : 'text-[#c0b8ad]'">
                    top {{ 100 - ev.percentile }}%
                  </span>
                </div>

                <!-- Badge top 10/25 mobile -->
                <div class="sm:hidden flex-shrink-0">
                  <span v-if="ev.isTop10" class="px-2 py-0.5 bg-orange-50 border border-orange-100 text-[#ea6c1e] text-[10px] font-bold rounded-full">top 10%</span>
                  <span v-else-if="ev.isTop25" class="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-500 text-[10px] font-bold rounded-full">top 25%</span>
                  <span v-else class="text-[11px] font-semibold text-[#c0b8ad]">top {{ 100 - ev.percentile }}%</span>
                </div>
              </div>

              <div v-if="platformComparison.ranked.length === 0" class="px-5 py-14 text-center text-[#b0a898] text-[13px]">
                Aucun événement publié à comparer
              </div>
            </div>
          </div>

          <!-- ── Conseil ── -->
          <div class="bg-white rounded-2xl border border-[#ede8e0] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-[#ea6c1e]" />
              </div>
              <div>
                <p class="text-[13px] font-bold text-[#1a1612] mb-1">Comment progresser</p>
                <p class="text-[12.5px] text-[#8a8078] leading-relaxed">
                  <span v-if="platformComparison.inTop10 > 0">
                    Félicitations ! Vous avez déjà des événements dans le top 10% de la plateforme. 
                    Reproduisez la même stratégie de promotion sur vos autres événements.
                  </span>
                  <span v-else-if="platformComparison.avgPercentile >= 50">
                    Vous êtes au-dessus de la moyenne. Pour atteindre le top 10%, visez
                    <strong class="text-[#1a1612]">{{ formatNumber(platformComparison.p.top10Threshold) }} vues</strong> par événement.
                    Publiez sur Facebook et WhatsApp dans les 48h avant l'événement.
                  </span>
                  <span v-else>
                    La moyenne plateforme est de <strong class="text-[#1a1612]">{{ formatNumber(platformComparison.p.avgViews) }}</strong> vues.
                    Commencez par promouvoir vos événements sur les réseaux sociaux pour vous rapprocher de cette moyenne.
                  </span>
                </p>
              </div>
            </div>
          </div>

        </template>
      </template>

    </div>
  </div>
</template>

<style scoped>

/* ── KPI ── */
.kpi-card {
  background: #fff; border: 1px solid #ede8e0; border-radius: 16px;
  padding: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.kpi-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.kpi-icon { width: 34px; height: 34px; border-radius: 10px; border-width: 1px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-label { font-size: 11px; font-weight: 500; color: #b0a898; letter-spacing: 0.03em; }
.kpi-value { font-size: 26px; font-weight: 700; color: #1a1612; letter-spacing: -0.03em; line-height: 1; }
.kpi-sub { font-size: 11px; color: #b0a898; }

/* ── Status badge ── */
.status-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 7px; border-radius: 20px; font-size: 10.5px; font-weight: 600; white-space: nowrap;
}

/* ── Sort pills ── */
.sort-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 9px; font-size: 11.5px; font-weight: 500; color: #8a8078; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.15s; border: none; background: transparent; }
.sort-pill:hover { color: #4a3f32; background: white; }
.sort-pill--active { background: white; color: #1a1612; font-weight: 600; box-shadow: 0 1px 6px rgba(0,0,0,0.07); }

/* ── Scrollbar ── */
.scrollbar-none::-webkit-scrollbar { display: none; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
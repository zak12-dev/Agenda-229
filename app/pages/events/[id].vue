<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { useAuth } from '../../../composables/useAuth'

interface EventData {
  id: string
  title: string
  category: { id: string; name: string }
  images: { url: string }[]
  user: {
    id: string; name: string; email: string; image: string | null
    organizerProfile?: { name?: string; logo?: string; phone?: string; website?: string }
  }
  views: number
  similarEvents: {
    id: string; title: string; eventDate: string; price?: number
    category: { id: string; name: string }
    images: { url: string }[]
  }[]
  description?: string
  details?: string
  createdAt?: string
  eventDate?: string
  price?: number
  location?: string
  ville?: { nomVille: string }
}

const isPastEvent = (date: string | Date | undefined): boolean => {
  if (!date) return false
  return new Date(date) < new Date()
}

const { session } = useAuth()
const route = useRoute()

const activeTab = ref('details')
const isFavorite = ref(false)
const favoriteLoading = ref(false)

const id = computed(() => route.params.id as string)

// ── Fetch événement ──
const { data, pending, error: fetchError } = await useAsyncData(
  () => `event-${id.value}`,
  () => $fetch<EventData>(`/api/events/${id.value}`),
  { watch: [id] }
)

const event = computed(() => {
  if (!data.value || Array.isArray(data.value)) return null
  return {
    ...data.value,
    organizer: data.value.user?.name ?? 'Inconnu',
    categoryName: data.value.category?.name ?? 'Autre',
  }
})

const { data: similarData, pending: similarPending } = await useAsyncData<EventData>(
  () => `similar-${id.value}`,
  () => $fetch<EventData>(`/api/events/${id.value}`),
  { watch: [id] }
)

const similarEvents = computed(() => similarData.value?.similarEvents ?? [])
const loading = computed(() => pending.value || similarPending.value)

// ── Favoris ──
const checkFavorite = async () => {
  if (!event.value?.id || !session.value) return
  try {
    const data: any = await $fetch(`/api/favorites/check?eventId=${event.value.id}`)
    isFavorite.value = data.isFavorite
  } catch (err) { isFavorite.value = false }
}

const toggleFavorite = async () => {
  if (!event.value) return
  favoriteLoading.value = true
  try {
    const response: any = await $fetch('/api/favorites', {
      method: 'POST',
      body: { eventId: event.value.id },
    })
    isFavorite.value = response.status === 'added'
  } catch (err) { console.error(err) }
  finally { favoriteLoading.value = false }
}

watch(event, (val) => { if (val) checkFavorite() }, { immediate: true })

// ── Partage ──
const share = (platform: string) => {
  if (!process.client || !event.value) return
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(event.value?.title || 'Événement à découvrir')
  let shareUrl = ''
  switch (platform) {
    case 'facebook':  shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break
    case 'instagram': navigator.clipboard.writeText(window.location.href); return
    case 'whatsapp':  shareUrl = `https://wa.me/?text=${text}%20${url}`; break
  }
  if (shareUrl) window.open(shareUrl, '_blank')
}

// ── timeAgo ──
const timeAgo = computed(() => {
  if (!event.value?.createdAt) return ''
  const diff = Date.now() - new Date(event.value.createdAt).getTime()
  const d = Math.floor(diff / 864e5)
  const m = Math.floor(d / 30)
  const y = Math.floor(d / 365)
  if (y > 0) return `Publié il y a ${y} an${y > 1 ? 's' : ''}`
  if (m > 0) return `Publié il y a ${m} mois`
  if (d > 0) return `Publié il y a ${d} jour${d > 1 ? 's' : ''}`
  return "Publié à l'instant"
})

// ── SEO ──
useHead(() => {
  if (!event.value) return {}
  return {
    title: event.value.title,
    meta: [
      { property: 'og:title', content: event.value.title },
      { property: 'og:description', content: event.value.description },
      { property: 'og:image', content: event.value.images?.[0]?.url || '' },
      { property: 'og:url', content: process.client ? window.location.href : '' },
      { property: 'og:type', content: 'article' },
    ],
  }
})

// ── Ticketing ──
const ticketQty     = ref(1)
const ticketLoading = ref(false)
const toast         = useToast()

const handleTicket = async () => {
  if (!event.value) return

  if (!session.value?.user) {
    toast.add({
      title: 'Connexion requise',
      description: 'Connectez-vous pour réserver votre place.',
      color: 'orange',
      icon: 'i-heroicons-lock-closed',
    })
    return
  }

  ticketLoading.value = true
  try {
    await $fetch('/api/ticket/buy', {
      method: 'POST',
      body: {
        eventId: event.value.id,
        quantity: ticketQty.value,
      },
    })
    toast.add({
      title: `Ticket${ticketQty.value > 1 ? 's' : ''} réservé${ticketQty.value > 1 ? 's' : ''} avec succès `,
      description: `Vous allez recevoir votre${ticketQty.value > 1 ? ' vos ' : ' '}ticket${ticketQty.value > 1 ? 's' : ''} par email.`,
      color: 'green',
      icon: 'i-heroicons-ticket',
    })
    ticketQty.value = 1
    console.log('Réservation réussie')
  } catch (err: any) {
    const msg = err?.data?.message || err?.statusMessage || 'Une erreur est survenue.'
    toast.add({
      title: 'Erreur lors de la réservation',
      description: msg,
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  } finally {
    ticketLoading.value = false
  }
}

// Avatar gradient
const getAvatarGradient = (name: string) => {
  const colors = [
    ['#ea6c1e','#f59e0b'], ['#5b47e0','#818cf8'], ['#059669','#34d399'],
    ['#dc2626','#f87171'], ['#0891b2','#67e8f9'], ['#7c3aed','#c4b5fd'],
  ]
  const i = (name?.charCodeAt(0) || 0) % colors.length
  return `linear-gradient(135deg, ${colors[i][0]}, ${colors[i][1]})`
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit">

    <!-- ══ LOADING STATE ══ -->
    <div v-if="pending" class="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <AppSkeleton variant="event-detail" />
    </div>

    <!-- ══ ÉVÉNEMENT TROUVÉ ══ -->
    <div v-else-if="event">

      <!-- ══ HERO ══ -->
      <div class="bg-[#faf8f5] border-b border-[#ede8e0] pt-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          <!-- Breadcrumb -->
          <nav class="flex items-center gap-1.5 text-[11.5px] text-[#b0a898] mb-6">
            <NuxtLink to="/" class="hover:text-[#ea6c1e] transition-colors">Accueil</NuxtLink>
            <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
            <NuxtLink to="/events" class="hover:text-[#ea6c1e] transition-colors">Événements</NuxtLink>
            <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
            <span class="text-[#4a3f32] font-medium truncate max-w-[200px]">{{ event.title }}</span>
          </nav>

          <div class="grid lg:grid-cols-12 gap-8 lg:gap-12">

            <!-- ── Colonne principale ── -->
            <div class="lg:col-span-8">

              <!-- Méta -->
              <div class="flex flex-wrap items-center gap-2.5 mb-5">
                <span class="inline-flex items-center px-3 py-1.5 rounded-xl
                             bg-orange-50 border border-orange-100
                             text-[11.5px] font-semibold text-[#ea6c1e]">
                  {{ event.categoryName }}
                </span>
                <span v-if="isPastEvent(event.eventDate)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         bg-[#f0ede8] border border-[#ede8e0]
                         text-[11.5px] font-semibold text-[#8a8078]">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#c0b8ad]" />
                  Terminé
                </span>
                <span v-else
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         bg-emerald-50 border border-emerald-100
                         text-[11.5px] font-semibold text-emerald-600">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  À venir
                </span>
                <div class="flex items-center gap-1.5 text-[11.5px] text-[#b0a898]">
                  <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
                  {{ event.views }} vues
                </div>
                <span class="text-[11.5px] text-[#c0b8ad]">·</span>
                <span class="text-[11.5px] text-[#b0a898]">{{ timeAgo }}</span>
              </div>

              <!-- Titre -->
              <h1 class="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-[#1a1612]
                         leading-tight tracking-tight mb-4">
                {{ event.title }}
              </h1>

              <!-- Description courte -->
              <p class="text-[14.5px] text-[#8a8078] leading-relaxed mb-6">
                {{ event.description }}
              </p>

              <!-- Actions bar -->
              <div class="flex items-center justify-between py-4 mb-6
                          border-t border-b border-[#ede8e0]">
                <!-- Favoris -->
                <button
                  @click="toggleFavorite"
                  :disabled="favoriteLoading"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-200',
                    isFavorite
                      ? 'bg-red-50 border border-red-100 text-red-500'
                      : 'bg-white border border-[#ede8e0] text-[#4a3f32] hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e]'
                  ]"
                >
                  <UIcon
                    :name="isFavorite ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                    class="w-4 h-4"
                  />
                  {{ isFavorite ? 'En favori' : 'Ajouter aux favoris' }}
                </button>

                <!-- Partage -->
                <div class="flex items-center gap-2">
                  <span class="text-[11.5px] text-[#b0a898] hidden sm:block">Partager :</span>
                  <!-- Facebook -->
                  <button @click="share('facebook')"
                    class="w-8 h-8 rounded-xl bg-white border border-[#ede8e0] flex items-center justify-center
                           hover:border-blue-200 hover:bg-blue-50 transition-all">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <!-- Instagram -->
                  <button @click="share('instagram')"
                    class="w-8 h-8 rounded-xl bg-white border border-[#ede8e0] flex items-center justify-center
                           hover:border-pink-200 hover:bg-pink-50 transition-all">
                    <svg class="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.33 3.608 1.304.974.975 1.242 2.242 1.304 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.33 2.633-1.304 3.608-.975.974-2.242 1.242-3.608 1.304-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.33-3.608-1.304-.974-.975-1.242-2.242-1.304-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.33-2.633 1.304-3.608C4.512 2.493 5.78 2.225 7.146 2.163 8.412 2.105 8.792 2.163 12 2.163zm0-2.163C8.735 0 8.332.012 7.052.07 5.781.127 4.584.415 3.515 1.484 2.446 2.553 2.158 3.751 2.101 5.022.043 8.332 0 8.735 0 12c0 3.265.043 3.668.101 4.948.057 1.271.345 2.469 1.414 3.538 1.069 1.069 2.267 1.357 3.538 1.414C8.332 23.957 8.735 24 12 24s3.668-.043 4.948-.101c1.271-.057 2.469-.345 3.538-1.414 1.069-1.069 1.357-2.267 1.414-3.538.058-1.28.101-1.683.101-4.948s-.043-3.668-.101-4.948c-.057-1.271-.345-2.469-1.414-3.538-1.069-1.069-2.267-1.357-3.538-1.414C15.668.043 15.265 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </button>
                  <!-- WhatsApp -->
                  <button @click="share('whatsapp')"
                    class="w-8 h-8 rounded-xl bg-white border border-[#ede8e0] flex items-center justify-center
                           hover:border-green-200 hover:bg-green-50 transition-all">
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Image principale -->
              <div class="relative aspect-video rounded-2xl overflow-hidden mb-8
                          border border-[#ede8e0] shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                <img
                  v-if="event.images?.length"
                  :src="event.images[0].url"
                  :alt="event.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-[#f5f0e8] to-[#ede8e0]
                                   flex items-center justify-center">
                  <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 text-[#c0b8ad]" />
                </div>
                <!-- Galerie mini si plusieurs images -->
                <div v-if="event.images?.length > 1"
                  class="absolute bottom-3 right-3 flex gap-1.5">
                  <div v-for="(img, i) in event.images.slice(1, 4)" :key="i"
                    class="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                    <img :src="img.url" class="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <!-- Tabs -->
              <div class="flex gap-1 p-1 bg-white border border-[#ede8e0] rounded-2xl
                          shadow-[0_1px_6px_rgba(0,0,0,0.04)] mb-6 w-fit">
                <button
                  @click="activeTab = 'details'"
                  :class="[
                    'px-5 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-200',
                    activeTab === 'details'
                      ? 'bg-[#1a1612] text-white shadow-sm'
                      : 'text-[#8a8078] hover:text-[#4a3f32] hover:bg-[#faf5ee]'
                  ]"
                >
                  Détails
                </button>
                <button
                  @click="activeTab = 'location'"
                  :class="[
                    'px-5 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-200',
                    activeTab === 'location'
                      ? 'bg-[#1a1612] text-white shadow-sm'
                      : 'text-[#8a8078] hover:text-[#4a3f32] hover:bg-[#faf5ee]'
                  ]"
                >
                  Lieu
                </button>
              </div>

              <!-- Tab contenu -->
              <div class="bg-white rounded-2xl border border-[#ede8e0] p-6
                          shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

                <!-- Détails -->
                <div v-if="activeTab === 'details'">
                  <div v-if="event.details" v-html="event.details"
                    class="prose prose-sm max-w-none text-[#4a3f32]" />
                  <p v-else class="text-[13px] text-[#b0a898] italic">
                    Aucun détail supplémentaire disponible pour cet événement.
                  </p>
                </div>

                <!-- Lieu -->
                <div v-if="activeTab === 'location'" class="space-y-4">
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100
                                flex items-center justify-center flex-shrink-0">
                      <UIcon name="i-heroicons-map-pin" class="w-4.5 h-4.5 text-[#ea6c1e]" />
                    </div>
                    <div>
                      <p class="text-[14px] font-bold text-[#1a1612]">{{ event.location }}</p>
                      <p v-if="event.ville?.nomVille" class="text-[12.5px] text-[#8a8078] mt-0.5">
                        {{ event.ville.nomVille }}
                      </p>
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-3">
                    <div class="flex items-center gap-3 p-3.5 bg-[#faf8f5] border border-[#ede8e0] rounded-xl">
                      <div class="w-8 h-8 rounded-lg bg-white border border-[#ede8e0]
                                  flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-archive-box" class="w-3.5 h-3.5 text-[#ea6c1e]" />
                      </div>
                      <div>
                        <p class="text-[12px] font-semibold text-[#1a1612]">Parking</p>
                        <p class="text-[11px] text-[#b0a898]">Disponible à proximité</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── SIDEBAR ── -->
            <div class="lg:col-span-4">
              <div class="sticky top-24 space-y-4">

                <!-- Card prix + infos -->
                <div class="bg-white rounded-2xl border border-[#ede8e0]
                            shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5">

                  <!-- Prix -->
                  <div class="flex items-baseline gap-2 mb-5 pb-5 border-b border-[#ede8e0]">
                    <span class="text-[28px] font-bold text-[#1a1612] leading-none">
                      <template v-if="event?.price && Number(event.price) > 0">
                        {{ event.price }} <span class="text-[18px]">Fcfa</span>
                      </template>
                      <template v-else>Gratuit</template>
                    </span>
                    <span v-if="event?.price && Number(event.price) > 0"
                      class="text-[12px] text-[#b0a898]">/ pers</span>
                  </div>

                  <!-- Infos -->
                  <div class="space-y-3">
                    <!-- Date -->
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100
                                  flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5 text-[#ea6c1e]" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-[10.5px] font-semibold text-[#b0a898] uppercase tracking-wide">Date</p>
                        <p class="text-[13px] font-semibold text-[#1a1612]">
                          {{ new Date(event.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                        </p>
                      </div>
                    </div>

                    <!-- Heure début/fin -->
                    <div v-if="event.startTime || event.endTime" class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100
                                  flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div>
                        <p class="text-[10.5px] font-semibold text-[#b0a898] uppercase tracking-wide">Horaire</p>
                        <p class="text-[13px] font-semibold text-[#1a1612]">
                          {{ event.startTime }} – {{ event.endTime }}
                        </p>
                      </div>
                    </div>

                    <!-- Lieu -->
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-[#f5f0e8] border border-[#ede8e0]
                                  flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#8a8078]" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-[10.5px] font-semibold text-[#b0a898] uppercase tracking-wide">Lieu</p>
                        <p class="text-[13px] font-semibold text-[#1a1612] truncate">{{ event.location }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ══ CARD TICKETING ══ -->
                <div class="bg-white rounded-2xl border border-[#ede8e0]
                            shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">

                  <!-- Header -->
                  <div class="px-5 pt-5 pb-4 border-b border-[#ede8e0]">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style="background: #ea6c1e15; border: 1.5px solid #ea6c1e30">
                          <UIcon name="i-heroicons-ticket" class="w-3.5 h-3.5" style="color: #ea6c1e" />
                        </div>
                        <p class="text-[13px] font-bold text-[#1a1612]">Réserver ma place</p>
                      </div>
                      <!-- Badge dispo -->
                      <span v-if="!isPastEvent(event.eventDate)"
                        class="flex items-center gap-1 px-2 py-0.5 rounded-full
                               bg-emerald-50 border border-emerald-100
                               text-[10px] font-semibold text-emerald-600">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Disponible
                      </span>
                      <span v-else
                        class="flex items-center gap-1 px-2 py-0.5 rounded-full
                               bg-[#f0ede8] border border-[#ede8e0]
                               text-[10px] font-semibold text-[#8a8078]">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#c0b8ad]" />
                        Terminé
                      </span>
                    </div>
                  </div>

                  <!-- Corps -->
                  <div class="px-5 py-4 space-y-4">

                    <!-- Prix unitaire -->
                    <div class="flex items-center justify-between py-3 px-4 rounded-xl bg-[#faf8f5] border border-[#ede8e0]">
                      <div>
                        <p class="text-[10.5px] font-semibold text-[#b0a898] uppercase tracking-wide mb-0.5">Ticket standard</p>
                        <p class="text-[18px] font-bold text-[#1a1612] leading-none">
                          <template v-if="event?.price && Number(event.price) > 0">
                            {{ Number(event.price).toLocaleString('fr-FR') }}
                            <span class="text-[13px] font-semibold text-[#8a8078]">FCFA</span>
                          </template>
                          <template v-else>
                            <span class="text-emerald-600">Gratuit</span>
                          </template>
                        </p>
                      </div>
                      <!-- Sélecteur quantité -->
                      <div v-if="!isPastEvent(event.eventDate)"
                        class="flex items-center gap-2">
                        <button @click="ticketQty = Math.max(1, ticketQty - 1)"
                          class="w-7 h-7 rounded-lg bg-white border border-[#ede8e0]
                                 flex items-center justify-center text-[#4a3f32] font-bold
                                 hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e] transition-all">
                          <UIcon name="i-heroicons-minus" class="w-3 h-3" />
                        </button>
                        <span class="text-[15px] font-bold text-[#1a1612] min-w-[20px] text-center">{{ ticketQty }}</span>
                        <button @click="ticketQty = Math.min(10, ticketQty + 1)"
                          class="w-7 h-7 rounded-lg bg-white border border-[#ede8e0]
                                 flex items-center justify-center text-[#4a3f32] font-bold
                                 hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e] transition-all">
                          <UIcon name="i-heroicons-plus" class="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <!-- Total -->
                    <div v-if="event?.price && Number(event.price) > 0 && !isPastEvent(event.eventDate)"
                      class="flex items-center justify-between text-[13px]">
                      <span class="text-[#8a8078]">Total ({{ ticketQty }} ticket{{ ticketQty > 1 ? 's' : '' }})</span>
                      <span class="font-bold text-[#1a1612]">
                        {{ (Number(event.price) * ticketQty).toLocaleString('fr-FR') }} FCFA
                      </span>
                    </div>

                    <!-- Bouton CTA -->
                    <button
                      v-if="!isPastEvent(event.eventDate)"
                      @click="handleTicket"
                      :disabled="ticketLoading"
                      class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                             text-white text-[13.5px] font-bold
                             shadow-[0_4px_18px_rgba(234,108,30,0.28)]
                             hover:opacity-90 hover:-translate-y-0.5
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                             transition-all duration-200"
                      style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
                      <template v-if="!ticketLoading">
                        <UIcon name="i-heroicons-ticket" class="w-4 h-4" />
                        {{ event?.price && Number(event.price) > 0 ? 'Payer & Réserver' : 'Réserver gratuitement' }}
                      </template>
                      <template v-else>
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Traitement…
                      </template>
                    </button>

                    <!-- Événement terminé -->
                    <div v-else
                      class="w-full py-3 rounded-xl text-center text-[13px] font-semibold
                             text-[#b0a898] bg-[#faf8f5] border border-[#ede8e0]">
                      Cet événement est terminé
                    </div>

                    <!-- Info sécurité -->
                    <div v-if="!isPastEvent(event.eventDate)"
                      class="flex items-center gap-2 text-[11px] text-[#b0a898]">
                      <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      Paiement sécurisé via FedaPay
                    </div>
                  </div>
                </div>

                <!-- Card organisateur -->
                <div class="bg-white rounded-2xl border border-[#ede8e0]
                            shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
                  <p class="text-[11px] font-semibold text-[#b0a898] uppercase tracking-widest mb-3">
                    Organisateur
                  </p>
                  <div class="flex items-center gap-3">
                    <!-- Avatar organisateur -->
                    <div class="relative flex-shrink-0">
                      <img
                        v-if="event.user.organizerProfile?.logo"
                        :src="event.user.organizerProfile.logo"
                        class="w-11 h-11 rounded-xl object-cover"
                      />
                      <div v-else
                        class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base"
                        :style="`background: ${getAvatarGradient(event.user.organizerProfile?.name || event.user.name)}`">
                        {{ (event.user.organizerProfile?.name || event.user.name)?.charAt(0) }}
                      </div>
                      <!-- Vérifié -->
                      <div class="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full
                                  bg-emerald-400 border-2 border-white flex items-center justify-center">
                        <UIcon name="i-heroicons-check" class="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[13.5px] font-bold text-[#1a1612] truncate">
                        {{ event.user.organizerProfile?.name || event.user.name }}
                      </p>
                      <p class="text-[11.5px] text-[#b0a898]">Organisateur vérifié</p>
                    </div>
                  </div>
                </div>

                <!-- Card aide -->
                <div class="bg-[#faf8f5] rounded-2xl border border-[#ede8e0] p-5">
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100
                                flex items-center justify-center flex-shrink-0">
                      <UIcon name="i-heroicons-lifebuoy" class="w-4.5 h-4.5 text-[#ea6c1e]" />
                    </div>
                    <div class="flex-1">
                      <p class="text-[13px] font-bold text-[#1a1612] mb-0.5">Besoin d'aide ?</p>
                      <p class="text-[11.5px] text-[#b0a898] mb-3">Notre équipe est là pour vous assister</p>
                      <NuxtLink to="/contact"
                        class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                               bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                               text-white text-[12.5px] font-semibold
                               shadow-[0_3px_12px_rgba(234,108,30,0.25)]
                               hover:opacity-90 transition-opacity">
                        <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5" />
                        Nous contacter
                      </NuxtLink>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ ÉVÉNEMENTS SIMILAIRES ══ -->
      <div v-if="!similarPending && similarEvents.length > 0"
        class="bg-[#f5f3ef] border-t border-[#ede8e0] py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">

          <div class="flex items-end justify-between mb-7">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                          text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest mb-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#5b47e0]" />
                Vous pourriez aimer
              </div>
              <h2 class="text-[22px] font-bold text-[#1a1612] tracking-tight">Événements similaires</h2>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- Skeletons -->
            <template v-if="similarPending">
              <div v-for="n in 3" :key="n"
                class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden animate-pulse">
                <div class="h-48 bg-[#f0ede8]" />
                <div class="p-4 space-y-2.5">
                  <div class="h-3 bg-[#f0ede8] rounded w-1/3" />
                  <div class="h-4 bg-[#f0ede8] rounded w-2/3" />
                  <div class="h-3 bg-[#f0ede8] rounded w-1/4" />
                </div>
              </div>
            </template>

            <template v-else>
              <article
                v-for="sim in similarEvents" :key="sim.id"
                class="group bg-white rounded-2xl border border-[#ede8e0] overflow-hidden
                       shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                       hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]
                       hover:border-[#ea6c1e]/30 transition-all duration-300"
              >
                <NuxtLink :to="`/events/${sim.id}`">
                  <div class="relative h-48 overflow-hidden">
                    <NuxtImg
                      v-if="sim.images?.[0]?.url"
                      :src="sim.images[0].url"
                      :alt="sim.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div v-else class="w-full h-full bg-gradient-to-br from-[#f5f0e8] to-[#ede8e0]
                                       flex items-center justify-center">
                      <UIcon name="i-heroicons-calendar-days" class="w-10 h-10 text-[#c0b8ad]" />
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    <!-- Badge terminé -->
                    <div v-if="isPastEvent(sim.eventDate)" class="absolute top-3 right-3">
                      <span class="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm
                                   text-[10px] font-semibold text-white/80">Terminé</span>
                    </div>

                    <!-- Prix -->
                    <div class="absolute bottom-3 left-3">
                      <span class="text-[15px] font-bold text-white leading-none">
                        <template v-if="sim?.price && Number(sim.price) > 0">{{ sim.price }} Fcfa</template>
                        <template v-else>Gratuit</template>
                      </span>
                    </div>
                  </div>

                  <div class="p-4">
                    <p class="text-[10.5px] font-semibold text-[#ea6c1e] uppercase tracking-wide mb-1">
                      {{ sim.category.name }}
                    </p>
                    <h3 class="text-[14px] font-bold text-[#1a1612] line-clamp-2 mb-2
                               group-hover:text-[#ea6c1e] transition-colors">
                      {{ sim.title }}
                    </h3>
                    <p class="text-[11.5px] text-[#b0a898]">
                      {{ new Date(sim.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                    </p>
                  </div>
                </NuxtLink>
              </article>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ ERROR STATE ══ -->
    <div v-else class="min-h-screen flex items-center justify-center px-4 pt-20">
      <div class="flex flex-col items-center text-center max-w-sm">
        <div class="w-16 h-16 rounded-2xl bg-white border border-[#ede8e0]
                    shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                    flex items-center justify-center mb-5">
          <UIcon name="i-heroicons-exclamation-circle" class="w-7 h-7 text-[#c0b8ad]" />
        </div>
        <h2 class="text-[20px] font-bold text-[#1a1612] mb-1.5">Événement introuvable</h2>
        <p class="text-[13px] text-[#b0a898] mb-6">
          Cet événement n'existe pas ou a été supprimé.
        </p>
        <NuxtLink to="/events"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl
                 bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                 text-white text-[13px] font-semibold
                 shadow-[0_4px_14px_rgba(234,108,30,0.25)] hover:opacity-90 transition-opacity">
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          Retour aux événements
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<style scoped>

:deep(.prose) {
  color: #4a3f32;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  line-height: 1.75;
}
:deep(.prose h2), :deep(.prose h3) { color: #1a1612; font-weight: 700; }
:deep(.prose a) { color: #ea6c1e; }
:deep(.prose strong) { color: #1a1612; }

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
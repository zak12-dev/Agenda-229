<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useRouter } from '#imports'

const { session, fetchSession } = useAuth()
const router = useRouter()

// ✅ Modal state
const showModal = ref(false)
const modalMessage = ref('')
const modalType = ref<'success' | 'error'>('success')

// ✅ Fonction utilitaire réutilisable
const openModal = (message: string, type: 'success' | 'error' = 'success') => {
  modalMessage.value = message
  modalType.value = type
  showModal.value = true

  // Option fermeture automatique après 3s
  setTimeout(() => {
    showModal.value = false
  }, 3000)
}

// Navigation principale
const navigation = {
  Événements: [
    { label: 'Concerts', to: '/events/concerts' },
    { label: 'Conférences', to: '/events/conferences' },
    { label: 'Festivals', to: '/events/festivals' },
    { label: 'Sport', to: '/events/sport' },
    { label: 'Business', to: '/events/business' },
  ],
  Organisateurs: [
    { label: 'Devenir organisateur', to: '/organizerForm', requiresAuth: true },
    { label: 'Créer un événement', to: '/organizerForm', requiresAuth: true },
    { label: 'Dashboard', to: '/dashboard/events', requiresAuth: true },
    { label: 'Guide organisateur', to: '/organizers/guide' },
  ],
  Support: [
    { label: "Centre d'aide", to: '/guides' },
    { label: 'Contact', to: '/contact' },
    { label: 'FAQ', to: '/helps/faq' },
    { label: 'Blog', to: '/blog' },
  ],
  Société: [
    { label: 'À propos', to: '/about' },
    { label: "Conditions d'utilisation", to: '/helps/terms' },
    { label: 'Politique de confidentialité', to: '/helps/privacy' },
    { label: 'Sécurité', to: '/security' },
  ],
}

// Social Links
const socialLinks = [
  {
    label: 'Facebook',
    to: 'https://facebook.com',
    icon: 'lucide:facebook',
  },
  {
    label: 'Instagram',
    to: 'https://instagram.com',
    icon: 'lucide:instagram',
  },
 {
    label: "WhatsApp",
    to: "https://wa.me/TON_NUMERO", 
    icon: "simple-icons:whatsapp",
  },
 
  {
    label: 'YouTube',
    to: 'https://youtube.com',
    icon: 'lucide:youtube',
  },
]

// Newsletter
const email = ref('')
const isSubscribing = ref(false)

const handleSubscribe = async () => {
  if (!email.value) return

  try {
    isSubscribing.value = true

    await $fetch('/api/newsletter', {
      method: 'POST',
      body: { email: email.value },
    })

    email.value = ''
    openModal('Inscription réussie 🎉', 'success')
  } catch (error: any) {
    openModal(error?.statusMessage || 'Erreur inscription', 'error')
  } finally {
    isSubscribing.value = false
  }
}

// ✅ Navigation avec modal réutilisé
const handleNavigation = async (link: { to: string; requiresAuth?: boolean }) => {
  if (link.requiresAuth) {
    if (!session.value) {
      await fetchSession()
    }

    if (!session.value) {
      await nextTick()
      openModal('Vous devez vous connecter pour accéder à cette page', 'error')
      return
    }
  }

  router.push(link.to)
}

// ✅ Accordéons mobile
const openSections = ref<Set<string>>(new Set())

const toggleSection = (section: string) => {
  if (openSections.value.has(section)) {
    openSections.value.delete(section)
  } else {
    openSections.value.add(section)
  }
}
</script>

<template>
  <footer class="bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white">
    <!-- Vague décorative -->
    <div class="relative h-12 sm:h-16">
      <svg
        class="absolute bottom-0 w-full h-full text-slate-50"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
        />
      </svg>
    </div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-6 sm:pb-8">
      <!-- Top Section -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-16 pb-8 sm:pb-16 border-b border-white/10"
      >
        <!-- Branding & Social -->
        <div class="space-y-4 sm:space-y-6">
          <div class="flex items-center gap-2 sm:gap-3">
            <NuxtLink to="/" class="flex items-center gap-2 sm:gap-3 z-50">
              <div
                class="w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-500 bg-gradient-to-br from-orange-600 to-indigo-600 text-white shadow-lg shadow-orange-500/20"
              >
                WLE
              </div>
              <span
                class="text-xl sm:text-base lg:text-3xl font-bold tracking-tight transition-all duration-500 text-white"
              >
                WeLoveEvent
              </span>
            </NuxtLink>
          </div>

          <p class="text-sm sm:text-base text-gray-300 max-w-md">
            Découvrez et participez aux meilleurs événements du Bénin. Culture, sport, business et
            plus encore.
          </p>

          <div class="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.to"
              target="_blank"
              class="group relative"
              :aria-label="social.label"
            >
              <div
                class="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-20 transition-opacity blur-sm"
              ></div>
              <div
                class="relative bg-white/10 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <UIcon :name="social.icon" class="w-5 h-5" />
              </div>
            </a>
          </div>
        </div>

        <!-- Newsletter -->
        <div
          class="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20"
        >
          <div class="flex items-center gap-2 mb-3 sm:mb-4">
            <UIcon name="i-heroicons-envelope" class="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
            <h3 class="text-base sm:text-xl font-bold text-orange-400">Newsletter</h3>
          </div>
          <p class="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
            Recevez notre sélection hebdomadaire des meilleurs événements au Bénin
          </p>
          <form @submit.prevent="handleSubscribe" class="space-y-3">
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="email"
                type="email"
                placeholder="votre@email.com"
                required
                class="flex-1 px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-full text-sm"
              />
              <button
                type="submit"
                :disabled="isSubscribing"
                class="px-6 py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-medium rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <span>{{ isSubscribing ? 'Envoi...' : "S'abonner" }}</span>
                <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Navigation Links -->
      <!-- Desktop: Grid 4 colonnes -->
      <div class="hidden md:grid md:grid-cols-4 gap-8 mb-8">
        <div v-for="(section, name) in navigation" :key="name">
          <h4 class="font-semibold text-lg mb-4 text-orange-300">{{ name }}</h4>
          <ul class="space-y-3">
            <li v-for="link in section" :key="link.to">
              <button
                @click="handleNavigation(link)"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group w-full text-left"
              >
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
                />
                {{ link.label }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Mobile: Accordéons -->
      <div class="md:hidden space-y-3 mb-8">
        <div v-for="(section, name) in navigation" :key="name" class="border-b border-white/10">
          <button
            @click="toggleSection(name as string)"
            class="w-full flex items-center justify-between py-4 text-left"
          >
            <span class="font-semibold text-base text-orange-300">{{ name }}</span>
            <UIcon
              name="i-heroicons-chevron-down"
              :class="[
                'w-5 h-5 text-orange-300 transition-transform duration-300',
                openSections.has(name as string) ? 'rotate-180' : '',
              ]"
            />
          </button>

          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <ul v-if="openSections.has(name as string)" class="pb-4 space-y-3 overflow-hidden">
              <li v-for="link in section" :key="link.to">
                <button
                  @click="handleNavigation(link)"
                  class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 w-full text-left py-1.5 pl-4"
                >
                  <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
                  <span class="text-sm">{{ link.label }}</span>
                </button>
              </li>
            </ul>
          </Transition>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="pt-6 sm:pt-8 border-t border-white/10">
        <div
          class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-400"
        >
          <p class="text-center sm:text-left">
            © {{ new Date().getFullYear() }} WeLoveEvent. Tous droits réservés.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <NuxtLink to="/helps/terms" class="hover:text-white transition-colors">
              Conditions
            </NuxtLink>
            <NuxtLink to="/helps/privacy" class="hover:text-white transition-colors">
              Confidentialité
            </NuxtLink>
            <NuxtLink to="/contact" class="hover:text-white transition-colors"> Contact </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <div class="mb-4">
              <div
                :class="[
                  'w-16 h-16 mx-auto rounded-full flex items-center justify-center',
                  modalType === 'success' ? 'bg-green-100' : 'bg-red-100',
                ]"
              >
                <UIcon
                  :name="
                    modalType === 'success' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'
                  "
                  :class="[
                    'w-10 h-10',
                    modalType === 'success' ? 'text-green-600' : 'text-red-600',
                  ]"
                />
              </div>
            </div>

            <h2
              class="text-lg font-bold mb-3"
              :class="modalType === 'success' ? 'text-green-600' : 'text-red-600'"
            >
              {{ modalType === 'success' ? 'Succès' : 'Erreur' }}
            </h2>

            <p class="text-gray-600 mb-6 text-sm">
              {{ modalMessage }}
            </p>

            <button
              @click="showModal = false"
              class="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              OK
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </footer>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>

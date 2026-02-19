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
</script>


<template>
  <footer class="bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white">
    <!-- Vague décorative -->
    <div class="relative h-16">
      <svg
        class="absolute bottom-0 w-full h-16 text-slate-50"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
        />
      </svg>
    </div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <!-- Top Section -->
      <div class="grid md:grid-cols-2 gap-12 mb-16 pb-16 border-b border-white/10">
        <!-- Branding & Social -->
        <div class="space-y-6">
          <div class="flex items-center gap-3">
            <NuxtLink to="/" class="flex items-center gap-2 sm:gap-3 z-50">
              <div
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-500 bg-gradient-to-br from-orange-600 to-indigo-600 text-white shadow-lg shadow-orange-500/20"
              >
                WxLE
              </div>
              <span
                class="hidden sm:block text-base lg:text-3xl font-bold tracking-tight transition-all duration-500 text-transparent bg-clip-text bg-white"
              >
                WeLoveEvent
              </span>
            </NuxtLink>
          </div>
          <div class="flex gap-3 pt-4">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.to"
              target="_blank"
              class="group relative"
            >
              <div
                class="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-20 transition-opacity blur-sm"
              ></div>
              <div
                class="relative bg-white/10 backdrop-blur-sm p-3 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <UIcon :name="social.icon" class="w-5 h-5" />
              </div>
            </a>
          </div>
        </div>

        <!-- Newsletter -->
        <div class="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-envelope" class="w-6 h-6 text-orange-600" />
            <h3 class="text-xl font-bold text-orange-600">
              Restez informé des meilleurs événements
            </h3>
          </div>
          <p class="text-gray-600 text-sm mb-6">
            Recevez notre newsletter hebdomadaire avec une sélection d'événements populaires au
            Bénin
          </p>
          <form @submit.prevent="handleSubscribe" class="space-y-3">
            <div class="flex gap-2">
              <input
                v-model="email"
                type="email"
                placeholder="votre@email.com"
                required
                class="flex-1 px-4 py-3 bg-white/10 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-full"
              />
              <UButton
                type="submit"
                color="primary"
                size="lg"
                :loading="isSubscribing"
                icon="i-heroicons-paper-airplane"
                trailing
                class="bg-amber-400 hover:bg-amber-500 rounded-full"
              >
                {{ isSubscribing ? 'Envoi...' : "S'abonner" }}
              </UButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-">
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
    </div>
    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div class="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
        <h2
          class="text-lg font-bold mb-4"
          :class="modalType === 'success' ? 'text-green-600' : 'text-red-600'"
        >
          {{ modalType === 'success' ? 'Succès' : 'Erreur' }}
        </h2>

        <p class="text-gray-600 mb-6">
          {{ modalMessage }}
        </p>

        <button
          @click="showModal = false"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          OK
        </button>
      </div>
    </div>
  </footer>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>

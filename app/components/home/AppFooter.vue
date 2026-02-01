<script setup lang="ts">
// Navigation principale
const navigation = {
  
  Événements: [
    { label: 'Concerts', to: '/events/concerts' },
    { label: 'Conférences', to: '/events/conferences' },
    { label: 'Festivals', to: '/events/festivals' },
    { label: 'Sport', to: '/events/sport' },
    { label: 'Business', to: '/events/business' }
    
  ],
  Organisateurs: [
    { label: 'Devenir organisateur', to: '/organizers/become' },
    { label: 'Créer un événement', to: '/organizers/create-event' },
    { label: 'Dashboard', to: '/organizers/dashboard' },
    { label: 'Guide organisateur', to: '/organizers/guide' },
    
  ],
  
  Support: [
    { label: 'Centre d\'aide', to: '/guides' },
    { label: 'Contact', to: '/inspiration' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Blog', to: '/blog' }
  ],

  Société: [
    { label: 'À propos', to: '/about' },
    { label: 'Conditions d\'utilisation', to: '/terms' },
    { label: 'Politique de confidentialité', to: '/privacy' },
    { label: 'Sécurité', to: '/security' }
  ]
   
}

// Réseaux sociaux
const socialLinks = [
  { icon: 'i-simple-icons-instagram', label: 'Instagram', to: 'https://instagram.com', color: 'text-pink-600' },
  { icon: 'i-simple-icons-pinterest', label: 'Pinterest', to: 'https://pinterest.com', color: 'text-red-600' },
  { icon: 'i-simple-icons-facebook', label: 'Facebook', to: 'https://facebook.com', color: 'text-blue-600' },
  { icon: 'i-simple-icons-twitter', label: 'Twitter', to: 'https://twitter.com', color: 'text-sky-500' },
  { icon: 'i-simple-icons-youtube', label: 'YouTube', to: 'https://youtube.com', color: 'text-red-600' }
]

// Gestion newsletter
const email = ref('')
const isSubscribing = ref(false)

const handleSubscribe = async () => {
  if (!email.value) return

  isSubscribing.value = true
  // Simuler un appel API
  await new Promise(resolve => setTimeout(resolve, 1000))

  console.log('Inscription newsletter:', email.value)
  
  email.value = ''
  isSubscribing.value = false
}
</script>

<template>
  <footer class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white ">
    <!-- Vague décorative -->
    <div class="relative h-16">
      <svg class="absolute bottom-0 w-full h-16 text-slate-50" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path fill="currentColor" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
      </svg>
    </div>

    <div class="container  mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <!-- Top Section: Newsletter + Branding -->
      <div class="grid md:grid-cols-2 gap-12 mb-16 pb-16 border-b border-white/10">
        <!-- Branding -->
        <div class="space-y-6">
          <div class="flex items-center gap-3">
            <NuxtLink to="/" class="flex items-center gap-2 sm:gap-3 z-50">
          <div 
            :class="[
              'w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-500 bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20',
             
            ]"
          >
            L&E
          </div>
          <span
            :class="[
              'hidden sm:block text-base lg:text-3xl font-bold tracking-tight transition-all duration-500 text-transparent bg-clip-text bg-white',
             
            ]"
          >
            Plan tɛ wɛ
          </span>
        </NuxtLink>
          </div>
          
          

          <!-- Social Media -->
          <div class="flex gap-3 pt-4">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.to"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative"
            >
              <div class="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-20 transition-opacity blur-sm"></div>
              <div class="relative bg-white/10 backdrop-blur-sm p-3 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <UIcon :name="social.icon" class="w-5 h-5" />
              </div>
            </a>
          </div>
        </div>

        <!-- Newsletter -->
        <div id="newsletter-form" class="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-envelope" class="w-6 h-6 text-purple-600" />
            <h3 class="text-xl font-bold text-purple-600">Restez informé des meilleurs événements</h3>
          </div>

          <p class="text-gray-600 text-sm mb-6">
            Recevez notre newsletter hebdomadaire avec une sélection d'événements populaires au Bénin 
            
          </p>

          <form @submit.prevent="handleSubscribe" class="space-y-3">
            <div class="flex gap-2">
              <input
                v-model="email"
                type="email"
                placeholder="votre@email.com"
                required
                class="flex-1 px-4 py-3  bg-white/10 border border-gray-300 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-full"
              />
              <UButton 
                type="submit"
                color="primary"
                size="lg"
                :loading="isSubscribing"
                icon="i-heroicons-paper-airplane"
                trailing
                class=" bg-amber-400 hover:bg-amber-500 rounded-full"
              >
                {{ isSubscribing ? 'Envoi...' : 'S\'abonner' }}
              </UButton>
            </div>
            <p class="text-xs text-gray-300">
              En vous abonnant, vous acceptez notre 
              <NuxtLink to="/privacy" class="text-purple-600 hover:text-purple-300 underline">
                politique de confidentialité
              </NuxtLink>
            </p>
          </form>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div v-for="(section, name) in navigation" :key="name">
          <h4 class="font-semibold text-lg mb-4 text-purple-300">{{ name.charAt(0).toUpperCase() + name.slice(1) }}</h4>
          <ul class="space-y-3">
            <li v-for="link in section" :key="link.to">
              <NuxtLink 
                :to="link.to"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright & Stats -->
      <div class="pt-8 border-t border-white/10">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="text-center md:text-left">
            <p class="text-gray-400 text-sm">
              © {{ new Date().getFullYear() }} <span class="font-semibold text-white"> Plan tɛ wɛ</span>. Tous droits réservés.
            </p>
            <p class="text-gray-400 text-xs mt-1">
              Conçu avec <UIcon name="i-heroicons-heart-solid" class="w-3 h-3 inline text-red-500" /> par votre équipe
            </p>
          </div>
           <div class="flex flex-wrap justify-center gap-4 text-xs">
             <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-white" />
            <h3 class="text-md font-medium text-white">plantɛwɛ@gmail.com</h3>
          </div>
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-phone" class="w-4 h-4 text-white" />
            <h3 class="text-md font-medium text-white">+229 XX XX XX XX XX </h3>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll to top -->
    <button
      @click="$scrollToTop()"
      class="fixed bottom-8  right-8 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 z-40"
      aria-label="Retour en haut"
    >
      <UIcon name="i-heroicons-arrow-up" class="w-5 h-5 text-white" />
    </button>
  </footer>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>

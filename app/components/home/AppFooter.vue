<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useRouter } from '#imports'

type NavLink = {
  label: string
  to: string
  requiresAuth?: boolean
  requiresOrganizer?: boolean
  hideIfOrganizer?: boolean
}

const { session, fetchSession } = useAuth()
const router = useRouter()
const toast = useToast()

// ── Navigation ──
const navigation: Record<string, NavLink[]> = {
  Événements: [
    { label: 'Concerts',     to: '/events/concerts' },
    { label: 'Conférences',  to: '/events/conferences' },
    { label: 'Festivals',    to: '/events/festivals' },
    { label: 'Sport',        to: '/events/sport' },
    { label: 'Business',     to: '/events/business' },
  ],
  Organisateurs: [
    { label: 'Devenir organisateur', to: '/organizerForm', requiresAuth: true, hideIfOrganizer: true },
    { label: 'Créer un événement',   to: '/organizerForm',     requiresAuth: true, requiresOrganizer: true },
    { label: 'Dashboard',            to: '/dashboard/events',  requiresAuth: true, requiresOrganizer: true },
    { label: 'Guide organisateur',   to: '/organizers/guide',  requiresAuth: true, requiresOrganizer: true },
  ],
  Support: [
    { label: "Centre d'aide", to: '/guides' },
    { label: 'Contact',       to: '/contact' },
    { label: 'FAQ',           to: '/helps/faq' },
  ],
  Société: [
    { label: 'À propos',                     to: '/about' },
    { label: "Conditions d'utilisation",     to: '/helps/terms' },
    { label: 'Politique de confidentialité', to: '/helps/privacy' },
  ],
}

const socialLinks = [
  { label: 'Facebook',  to: 'https://facebook.com',     icon: 'lucide:facebook' },
  { label: 'Instagram', to: 'https://instagram.com',    icon: 'lucide:instagram' },
  { label: 'WhatsApp',  to: 'https://wa.me/TON_NUMERO', icon: 'simple-icons:whatsapp' },
  { label: 'YouTube',   to: 'https://youtube.com',      icon: 'lucide:youtube' },
]

// ── Newsletter ──
const email = ref('')
const emailError = ref('')
const isSubscribing = ref(false)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const validateEmail = () => {
  const val = email.value.trim()
  if (!val) { emailError.value = 'Veuillez entrer votre adresse email.'; return false }
  if (!EMAIL_REGEX.test(val)) { emailError.value = 'Adresse email invalide.'; return false }
  emailError.value = ''
  return true
}

const handleSubscribe = async () => {
  if (!validateEmail()) return
  try {
    isSubscribing.value = true
    await $fetch('/api/newsletter', { method: 'POST', body: { email: email.value.trim().toLowerCase() } })
    email.value = ''
    emailError.value = ''
    toast.add({
      title: 'Inscription réussie 🎉',
      description: 'Vous recevrez nos meilleurs événements chaque semaine.',
      color: 'green',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error: any) {
    toast.add({
      title: "Erreur d'inscription",
      description: error?.statusMessage || 'Veuillez réessayer.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  } finally {
    isSubscribing.value = false
  }
}

// ── Navigation avec garde auth → toast ──
const handleNavigation = async (link: NavLink) => {
  if (link.requiresAuth) {
    // Recharge la session si nécessaire
    if (!session.value) await fetchSession()

    // ✅ Pas connecté → toast orange avec cadenas
    if (!session.value) {
      toast.add({
        title: 'Connexion requise',
        description: 'Vous devez vous connecter pour accéder à cette page.',
        color: 'orange',
        icon: 'i-heroicons-lock-closed',
      })
      return
    }

    // ✅ Connecté mais pas organisateur
    if (link.requiresOrganizer && session.value?.user?.roleId !== 2) {
      toast.add({
        title: 'Accès réservé aux organisateurs',
        description: 'Devenez organisateur pour débloquer cette fonctionnalité.',
        color: 'orange',
        icon: 'i-heroicons-user-group',
      })
      return
    }
  }

  router.push(link.to)
}

// ── Accordéons mobile ──
const openSections = ref<Set<string>>(new Set())
const toggleSection = (section: string) => {
  if (openSections.value.has(section)) openSections.value.delete(section)
  else openSections.value.add(section)
}

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#1a1612] text-white font-outfit">

    <!-- Vague de transition avec le fond crème -->
    <div class="h-8 bg-[#f5f3ef]">
      <svg class="w-full h-full" viewBox="0 0 1440 32" preserveAspectRatio="none">
        <path fill="#1a1612"
          d="M0,16L80,18C160,20,320,24,480,22C640,20,800,14,960,12C1120,10,1280,14,1360,16L1440,18L1440,32L1360,32C1280,32,1120,32,960,32C800,32,640,32,480,32C320,32,160,32,80,32L0,32Z"/>
      </svg>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6 sm:pb-8">

      <!-- ══ TOP : Branding + Newsletter ══ -->
      <div class="grid md:grid-cols-2 gap-8 sm:gap-12 mb-10 pb-10 border-b border-white/8">

        <!-- Branding + Réseaux -->
        <div class="space-y-5">
          <NuxtLink to="/" class="inline-flex items-center gap-2.5">
            <svg width="36" height="36" viewBox="0 0 100 110" class="flex-shrink-0">
              <circle cx="50" cy="18" r="16" fill="#ea6c1e"/>
              <path d="M10 55 Q10 95 30 95 Q40 95 50 80 Q60 95 70 95 Q90 95 90 55 L90 50 Q90 40 80 40 L70 40 Q60 40 60 50 L60 68 Q60 75 50 75 Q40 75 40 68 L40 50 Q40 40 30 40 L20 40 Q10 40 10 50 Z" fill="#ea6c1e"/>
            </svg>
            <span class="text-[19px] font-bold tracking-tight">
              <span class="text-white">WeLove</span><span class="text-[#ea6c1e]">Event</span>
            </span>
          </NuxtLink>

          <p class="text-[12.5px] text-white/40 leading-relaxed max-w-sm">
            Découvrez et participez aux meilleurs événements du Bénin. Culture, sport, business et plus encore.
          </p>

          <div class="flex gap-2">
            <a
              v-for="social in socialLinks" :key="social.label"
              :href="social.to" target="_blank" :aria-label="social.label"
              class="w-9 h-9 rounded-xl bg-white/6 border border-white/8
                     flex items-center justify-center
                     hover:bg-white/14 hover:border-white/20 hover:scale-110
                     transition-all duration-200"
            >
              <UIcon :name="social.icon" class="w-4 h-4 text-white/55" />
            </a>
          </div>
        </div>

        <!-- Newsletter -->
        <div class="bg-white/4 rounded-2xl border border-white/8 p-5">
          <div class="flex items-center gap-2 mb-1.5">
            <div class="w-7 h-7 rounded-lg bg-[#ea6c1e]/15 border border-[#ea6c1e]/20
                        flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 text-[#ea6c1e]" />
            </div>
            <h3 class="text-[13.5px] font-bold text-white">Newsletter</h3>
          </div>
          <p class="text-[11.5px] text-white/35 mb-4 leading-relaxed">
            Recevez notre sélection hebdomadaire des meilleurs événements au Bénin
          </p>
          <div class="space-y-2">
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="flex-1 relative">
                <input
                  v-model="email"
                  type="email"
                  placeholder="votre@email.com"
                  @input="emailError = ''"
                  @keydown.enter="handleSubscribe"
                  maxlength="100"
                  autocomplete="email"
                  class="w-full px-4 py-2.5 rounded-xl text-[12px] bg-white/8
                         border text-white placeholder:text-white/20
                         outline-none transition-all duration-200"
                  :class="emailError
                    ? 'border-red-400/60 focus:border-red-400/80 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'
                    : 'border-white/10 focus:border-[#ea6c1e]/50 focus:shadow-[0_0_0_3px_rgba(234,108,30,0.08)]'"
                />
              </div>
              <button
                @click="handleSubscribe"
                :disabled="isSubscribing"
                class="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl
                       bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                       text-white text-[12px] font-semibold whitespace-nowrap
                       shadow-[0_3px_12px_rgba(234,108,30,0.2)]
                       hover:opacity-90 disabled:opacity-50
                       transition-all duration-200"
              >
                <UIcon name="i-heroicons-paper-airplane" class="w-3.5 h-3.5" />
                {{ isSubscribing ? 'Envoi...' : "S'abonner" }}
              </button>
            </div>
            <!-- Message d'erreur -->
            <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
              <p v-if="emailError" class="flex items-center gap-1.5 text-[11px] text-red-400/90 pl-1">
                <UIcon name="i-heroicons-exclamation-circle" class="w-3.5 h-3.5 flex-shrink-0" />
                {{ emailError }}
              </p>
            </Transition>
          </div>
        </div>
      </div>

      <!-- ══ NAV DESKTOP ══ -->
      <div class="hidden md:grid md:grid-cols-4 gap-8 mb-10">
        <div v-for="(section, name) in navigation" :key="name">
          <h4 class="text-[10px] font-bold text-[#ea6c1e] uppercase tracking-widest mb-4">
            {{ name }}
          </h4>
          <ul class="space-y-2.5">
            <li
              v-for="link in section.filter(l => {
                const isOrganizer = session?.value?.user?.roleId === 2
                if (l.hideIfOrganizer && isOrganizer) return false
                if (l.requiresOrganizer && !isOrganizer) return false
                return true
              })"
              :key="link.to"
            >
              <button
                @click="handleNavigation(link)"
                class="group flex items-center gap-2 text-[12px] text-white/40
                       hover:text-white/90 transition-colors duration-150 text-left w-full"
              >
                <!-- Icône cadenas si lien protégé et non connecté -->
                <UIcon
                  v-if="link.requiresAuth && !session"
                  name="i-heroicons-lock-closed"
                  class="w-3 h-3 text-white/20 flex-shrink-0 group-hover:text-[#ea6c1e]/60 transition-colors"
                />
                <UIcon
                  v-else
                  name="i-heroicons-chevron-right"
                  class="w-3 h-3 opacity-0 -translate-x-1 flex-shrink-0
                         group-hover:opacity-100 group-hover:translate-x-0
                         text-[#ea6c1e] transition-all duration-150"
                />
                {{ link.label }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- ══ NAV MOBILE (accordéons) ══ -->
      <div class="md:hidden border-t border-white/8 mb-8">
        <div v-for="(section, name) in navigation" :key="name"
          class="border-b border-white/8">
          <button
            @click="toggleSection(name as string)"
            class="w-full flex items-center justify-between py-3.5"
          >
            <span class="text-[12.5px] font-semibold text-white/60">{{ name }}</span>
            <UIcon name="i-heroicons-chevron-down"
              class="w-4 h-4 text-[#ea6c1e] transition-transform duration-200"
              :class="openSections.has(name as string) ? 'rotate-180' : ''" />
          </button>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ul v-if="openSections.has(name as string)" class="pb-4 space-y-2 pl-1">
              <li
                v-for="link in section.filter(l => {
                const isOrganizer = session?.value?.user?.roleId === 2
                if (l.hideIfOrganizer && isOrganizer) return false
                if (l.requiresOrganizer && !isOrganizer) return false
                return true
              })"
                :key="link.to"
              >
                <button
                  @click="handleNavigation(link)"
                  class="flex items-center gap-2 text-[11.5px] text-white/35
                         hover:text-white/80 transition-colors py-1 text-left w-full"
                >
                  <UIcon
                    v-if="link.requiresAuth && !session"
                    name="i-heroicons-lock-closed"
                    class="w-3 h-3 text-white/20 flex-shrink-0"
                  />
                  <UIcon
                    v-else
                    name="i-heroicons-chevron-right"
                    class="w-3 h-3 text-[#ea6c1e] flex-shrink-0"
                  />
                  {{ link.label }}
                </button>
              </li>
            </ul>
          </Transition>
        </div>
      </div>

      <!-- ══ BOTTOM ══ -->
      <div class="pt-5 border-t border-white/8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-[11px] text-white/20">
            © {{ currentYear }} WeLoveEvent. Tous droits réservés.
          </p>
          <div class="flex items-center gap-5">
            <NuxtLink to="/helps/terms"
              class="text-[11px] text-white/25 hover:text-white/60 transition-colors">
              Conditions
            </NuxtLink>
            <NuxtLink to="/helps/privacy"
              class="text-[11px] text-white/25 hover:text-white/60 transition-colors">
              Confidentialité
            </NuxtLink>
            <NuxtLink to="/contact"
              class="text-[11px] text-white/25 hover:text-white/60 transition-colors">
              Contact
            </NuxtLink>
          </div>
        </div>
      </div>

    </div>
  </footer>
</template>


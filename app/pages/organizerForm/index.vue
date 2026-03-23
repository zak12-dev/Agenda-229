<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'
import { useRouter } from '#imports'

// ✅ Middleware : vérifie la connexion avant d'afficher la page
definePageMeta({
  middleware: ['auth-organizer'],
})

const orgName = ref('')
const description = ref('')
const website = ref('')
const phone = ref('')

const isSubmitting = ref(false)
const toast = useToast()
const router = useRouter()

const handleSubmit = async () => {
  if (!orgName.value.trim()) {
    toast.add({
      title: 'Champ requis',
      description: 'Le nom de votre organisation est requis.',
      color: 'orange',
      icon: 'i-heroicons-exclamation-circle',
    })
    return
  }

  isSubmitting.value = true
  try {
    await $fetch('/api/organizer/request', {
      method: 'POST',
      body: {
        name: orgName.value,
        description: description.value,
        website: website.value,
        phone: phone.value,
      },
    })

    orgName.value = ''
    description.value = ''
    website.value = ''
    phone.value = ''

    toast.add({
      title: 'Demande envoyée ✅',
      description: 'Votre compte organisateur est en attente de validation.',
      color: 'green',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error?.message || 'Une erreur est survenue lors de l\'envoi.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  } finally {
    isSubmitting.value = false
  }
}

const advantages = [
  {
    icon: 'i-heroicons-squares-2x2',
    title: 'Gestion complète',
    desc: 'Créez et gérez vos événements depuis votre tableau de bord.',
  },
  {
    icon: 'i-heroicons-chart-bar',
    title: 'Analytics en temps réel',
    desc: 'Suivez vos vues, sources et tendances en direct.',
  },
  {
    icon: 'i-heroicons-users',
    title: 'Équipe collaborative',
    desc: 'Travaillez en équipe sur vos événements.',
  },
  {
    icon: 'i-heroicons-lifebuoy',
    title: 'Support prioritaire',
    desc: 'Assistance dédiée 24/7 pour les organisateurs.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit">
    <AppHeader />

    <div class="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">

      <!-- ══ HERO ══ -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4
                    bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                    text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest">
          <UIcon name="i-heroicons-sparkles" class="w-3 h-3 text-[#5b47e0]" />
          Rejoindre la communauté
        </div>
        <h1 class="text-[32px] sm:text-[44px] font-bold text-[#1a1612] tracking-tight mb-3">
          Devenez
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
            Organisateur
          </span>
        </h1>
        <p class="text-[14.5px] text-[#8a8078] max-w-lg mx-auto leading-relaxed">
          Créez des événements d'exception et développez votre communauté au Bénin
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">

        <!-- ══ SIDEBAR AVANTAGES ══ -->
        <div class="lg:col-span-1 space-y-4">

          <!-- Avantages -->
          <div class="bg-white rounded-2xl border border-[#ede8e0]
                      shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100
                          flex items-center justify-center">
                <UIcon name="i-heroicons-star" class="w-4 h-4 text-[#ea6c1e]" />
              </div>
              <h2 class="text-[14px] font-bold text-[#1a1612]">Vos avantages</h2>
            </div>

            <div class="space-y-4">
              <div v-for="(adv, i) in advantages" :key="i"
                class="flex items-start gap-3">
                <div class="flex-shrink-0 w-7 h-7 rounded-lg bg-[#f5f0e8] border border-[#ede8e0]
                            flex items-center justify-center mt-0.5">
                  <UIcon :name="adv.icon" class="w-3.5 h-3.5 text-[#ea6c1e]" />
                </div>
                <div>
                  <p class="text-[12.5px] font-semibold text-[#1a1612]">{{ adv.title }}</p>
                  <p class="text-[11.5px] text-[#b0a898] leading-snug mt-0.5">{{ adv.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Info validation -->
          <div class="bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] rounded-2xl p-5 text-white
                      shadow-[0_4px_20px_rgba(234,108,30,0.2)]">
            <div class="w-9 h-9 rounded-xl bg-white/15 border border-white/20
                        flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-clock" class="w-4.5 h-4.5 text-white" />
            </div>
            <h3 class="text-[14px] font-bold mb-1.5">Validation sous 24-48h</h3>
            <p class="text-[12px] text-white/75 leading-relaxed">
              Un administrateur examinera votre demande et vous contactera rapidement.
            </p>
          </div>
        </div>

        <!-- ══ FORMULAIRE ══ -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl border border-[#ede8e0]
                      shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8">

            <h2 class="text-[15px] font-bold text-[#1a1612] mb-6">
              Informations de votre organisation
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-5">

              <!-- Nom organisation -->
              <div>
                <label class="block text-[12px] font-semibold text-[#4a3f32] mb-1.5 uppercase tracking-wide">
                  Nom de l'organisation <span class="text-[#ea6c1e]">*</span>
                </label>
                <input
                  v-model="orgName"
                  type="text"
                  placeholder="Ex: EventPro Bénin"
                  required
                  class="w-full px-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                         bg-[#faf8f5] border border-[#ede8e0]
                         placeholder:text-[#c0b8ad]
                         outline-none transition-all duration-200
                         focus:bg-white focus:border-[#ea6c1e]
                         focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]"
                />
                <p class="text-[11px] text-[#c0b8ad] mt-1.5">
                  Ce nom apparaîtra sur tous vos événements
                </p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-[12px] font-semibold text-[#4a3f32] mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  v-model="description"
                  rows="4"
                  placeholder="Présentez votre organisation, votre mission, vos valeurs..."
                  class="w-full px-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                         bg-[#faf8f5] border border-[#ede8e0]
                         placeholder:text-[#c0b8ad]
                         outline-none transition-all duration-200 resize-none
                         focus:bg-white focus:border-[#ea6c1e]
                         focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]"
                />
              </div>

              <!-- Ligne site web + téléphone -->
              <div class="grid sm:grid-cols-2 gap-4">
                <!-- Site web -->
                <div>
                  <label class="block text-[12px] font-semibold text-[#4a3f32] mb-1.5 uppercase tracking-wide">
                    Site web
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 text-[#c0b8ad]" />
                    </div>
                    <input
                      v-model="website"
                      type="url"
                      placeholder="https://votre-site.com"
                      class="w-full pl-10 pr-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                             bg-[#faf8f5] border border-[#ede8e0]
                             placeholder:text-[#c0b8ad]
                             outline-none transition-all duration-200
                             focus:bg-white focus:border-[#ea6c1e]
                             focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]"
                    />
                  </div>
                </div>

                <!-- Téléphone -->
                <div>
                  <label class="block text-[12px] font-semibold text-[#4a3f32] mb-1.5 uppercase tracking-wide">
                    Téléphone
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UIcon name="i-heroicons-phone" class="w-4 h-4 text-[#c0b8ad]" />
                    </div>
                    <input
                      v-model="phone"
                      type="tel"
                      placeholder="+229 XX XX XX XX"
                      class="w-full pl-10 pr-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                             bg-[#faf8f5] border border-[#ede8e0]
                             placeholder:text-[#c0b8ad]
                             outline-none transition-all duration-200
                             focus:bg-white focus:border-[#ea6c1e]
                             focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]"
                    />
                  </div>
                </div>
              </div>

              <!-- Notice info -->
              <div class="flex items-start gap-3 p-4 rounded-xl
                          bg-indigo-50 border border-indigo-100">
                <div class="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200
                            flex items-center justify-center mt-0.5">
                  <UIcon name="i-heroicons-information-circle" class="w-3.5 h-3.5 text-[#5b47e0]" />
                </div>
                <p class="text-[12px] text-[#5b47e0] leading-relaxed">
                  Votre compte sera créé avec le statut <strong>"En attente de validation"</strong>.
                  Un administrateur examinera votre demande sous 24-48h.
                </p>
              </div>

              <!-- Bouton submit -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                       bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                       text-white text-[14px] font-bold
                       shadow-[0_4px_20px_rgba(234,108,30,0.25)]
                       hover:shadow-[0_6px_28px_rgba(234,108,30,0.35)]
                       hover:-translate-y-0.5
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                       transition-all duration-200"
              >
                <template v-if="!isSubmitting">
                  <UIcon name="i-heroicons-check" class="w-4.5 h-4.5" />
                  Créer mon compte organisateur
                </template>
                <template v-else>
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Création en cours...
                </template>
              </button>

              <!-- Conditions -->
              <p class="text-[11.5px] text-[#c0b8ad] text-center">
                En créant un compte, vous acceptez nos
                <NuxtLink to="/helps/terms"
                  class="text-[#ea6c1e] hover:underline font-semibold">
                  conditions d'utilisation
                </NuxtLink>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
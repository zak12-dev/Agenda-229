<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useToast } from '#imports'

const form = reactive({ name: '', email: '', message: '' })
const loading   = ref(false)
const tokenReady = ref(false)
let turnstileWidgetId: number | null = null
const config = useRuntimeConfig()
const toast  = useToast()

onMounted(() => {
  const container = document.querySelector('.cf-turnstile')
  if (container && (window as any).turnstile) {
    turnstileWidgetId = (window as any).turnstile.render(container, {
      sitekey: config.public.turnstileSiteKey,
      callback:           () => { tokenReady.value = true  },
      'expired-callback': () => { tokenReady.value = false },
    })
  }
})

const refreshCaptcha = () => {
  if (turnstileWidgetId !== null && (window as any).turnstile) {
    ;(window as any).turnstile.reset(turnstileWidgetId)
    tokenReady.value = false
  }
}

const submitForm = async () => {
  if (!form.name || !form.email || !form.message) {
    toast.add({
      title: 'Champs requis',
      description: 'Veuillez remplir tous les champs.',
      color: 'orange',
      icon: 'i-heroicons-exclamation-circle',
    })
    return
  }

  const token = (window as any).turnstile?.getResponse(turnstileWidgetId)
  if (!token || !tokenReady.value) {
    toast.add({
      title: 'Captcha requis',
      description: 'Veuillez valider le captcha avant de continuer.',
      color: 'orange',
      icon: 'i-heroicons-shield-exclamation',
    })
    return
  }

  loading.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: { ...form, token },
    })
    Object.assign(form, { name: '', email: '', message: '' })
    refreshCaptcha()
    toast.add({
      title: 'Message envoyé ✅',
      description: 'Notre équipe vous répondra dans les plus brefs délais.',
      color: 'green',
      icon: 'i-heroicons-check-circle',
    })
  } catch (err) {
    refreshCaptcha()
    toast.add({
      title: "Erreur lors de l'envoi",
      description: 'Une erreur est survenue. Veuillez réessayer.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  } finally {
    loading.value = false
  }
}

const contactCards = [
  {
    icon: 'i-heroicons-phone',
    label: 'Téléphone',
    value: '+229 99 99 99 99',
    href: 'tel:+22999999999',
    iconBg: 'bg-orange-50',
    iconColor: 'text-[#ea6c1e]',
    borderColor: 'border-[#ea6c1e]/20',
  },
  {
    icon: 'i-heroicons-map-pin',
    label: 'Adresse',
    value: 'Cotonou, Bénin',
    href: null,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-[#5b47e0]',
    borderColor: 'border-[#5b47e0]/20',
  },
]

const socialLinks = [
  { icon: 'i-simple-icons-facebook',  href: '#', bg: 'bg-[#1877F2]',  label: 'Facebook'  },
  { icon: 'i-simple-icons-twitter',   href: '#', bg: 'bg-[#1DA1F2]',  label: 'Twitter'   },
  { icon: 'i-simple-icons-instagram', href: '#', bg: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]', label: 'Instagram' },
]
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

      <!-- ══ HERO ══ -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4
                    bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                    text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-3 h-3 text-[#ea6c1e]" />
          On est là pour vous
        </div>
        <h1 class="text-[32px] sm:text-[42px] font-bold text-[#1a1612] tracking-tight mb-3">
          Contactez-
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
            nous
          </span>
        </h1>
        <p class="text-[14px] text-[#8a8078] max-w-lg mx-auto leading-relaxed">
          Une question, une suggestion ? Notre équipe vous répondra dans les plus brefs délais.
        </p>
      </div>

      <!-- ══ CARDS CONTACT ══ -->
      <div class="grid sm:grid-cols-2 gap-4 mb-8">
        <div
          v-for="card in contactCards" :key="card.label"
          class="bg-white rounded-2xl border p-5 flex items-center gap-4
                 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5"
          :class="card.borderColor"
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            :class="card.iconBg">
            <UIcon :name="card.icon" class="w-5.5 h-5.5" :class="card.iconColor" />
          </div>
          <div>
            <p class="text-[11px] font-semibold text-[#b0a898] uppercase tracking-wide mb-0.5">
              {{ card.label }}
            </p>
            <a v-if="card.href" :href="card.href"
              class="text-[14px] font-semibold text-[#1a1612] hover:text-[#ea6c1e] transition-colors">
              {{ card.value }}
            </a>
            <p v-else class="text-[14px] font-semibold text-[#1a1612]">{{ card.value }}</p>
          </div>
        </div>
      </div>

      <!-- ══ FORMULAIRE ══ -->
      <div class="bg-white rounded-2xl border border-[#ede8e0]
                  shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">

        <!-- Header formulaire -->
        <div class="bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] px-7 pt-7 pb-8 relative">
          <!-- Motif de points -->
          <div class="absolute inset-0 opacity-10"
            style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px;" />
          <div class="relative flex items-end justify-between">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3
                          bg-white/15 border border-white/25">
                <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span class="text-[10.5px] font-semibold text-white/90 uppercase tracking-widest">
                  Message direct
                </span>
              </div>
              <h2 class="text-[22px] font-extrabold text-white tracking-tight leading-tight">
                Envoyez-nous<br>
                <span class="text-white/80">un message</span>
              </h2>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/30
                        flex items-center justify-center mb-1">
              <UIcon name="i-heroicons-paper-airplane" class="w-7 h-7 text-white" />
            </div>
          </div>
          <!-- Vague -->
          <div class="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 400 16" preserveAspectRatio="none" class="w-full h-4">
              <path d="M0,16 C100,0 300,0 400,16 L400,16 L0,16 Z" fill="white"/>
            </svg>
          </div>
        </div>

        <!-- Corps du formulaire -->
        <form @submit.prevent="submitForm" class="p-7 sm:p-9 space-y-5">

          <!-- Nom + Email en ligne sur sm+ -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
                Nom complet <span class="text-[#ea6c1e]">*</span>
              </label>
              <div class="relative">
                <UIcon name="i-heroicons-user"
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Votre nom"
                  required
                  class="w-full pl-10 pr-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                         bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                         outline-none transition-all duration-200
                         focus:bg-white focus:border-[#ea6c1e]
                         focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]"
                />
              </div>
            </div>

            <div>
              <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
                Email <span class="text-[#ea6c1e]">*</span>
              </label>
              <div class="relative">
                <UIcon name="i-heroicons-at-symbol"
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  class="w-full pl-10 pr-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                         bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                         outline-none transition-all duration-200
                         focus:bg-white focus:border-[#ea6c1e]
                         focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]"
                />
              </div>
            </div>
          </div>

          <!-- Message -->
          <div>
            <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
              Message <span class="text-[#ea6c1e]">*</span>
            </label>
            <textarea
              v-model="form.message"
              rows="5"
              required
              placeholder="Décrivez votre demande, question ou suggestion..."
              class="w-full px-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                     bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                     outline-none transition-all duration-200 resize-none
                     focus:bg-white focus:border-[#ea6c1e]
                     focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]"
            />
          </div>

          <!-- Captcha -->
          <div class="cf-turnstile" />

          <!-- Bouton -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                   bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                   text-white text-[14px] font-bold
                   shadow-[0_4px_20px_rgba(234,108,30,0.25)]
                   hover:shadow-[0_6px_28px_rgba(234,108,30,0.35)] hover:-translate-y-0.5
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                   transition-all duration-200"
          >
            <template v-if="!loading">
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
              Envoyer le message
            </template>
            <template v-else>
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Envoi en cours...
            </template>
          </button>
        </form>
      </div>

      <!-- ══ RÉSEAUX SOCIAUX ══ -->
      <div class="text-center mt-10">
        <p class="text-[12.5px] text-[#b0a898] mb-4 uppercase tracking-widest font-semibold">
          Suivez-nous
        </p>
        <div class="flex justify-center gap-3">
          <a
            v-for="social in socialLinks" :key="social.label"
            :href="social.href"
            :title="social.label"
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white
                   hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            :class="social.bg"
          >
            <UIcon :name="social.icon" class="w-4.5 h-4.5" />
          </a>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
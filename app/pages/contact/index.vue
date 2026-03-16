<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useToast } from '#imports'

const form = reactive({ name: '', email: '', message: '' })
const loading    = ref(false)
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
    toast.add({ title: 'Champs requis', description: 'Veuillez remplir tous les champs.', color: 'orange', icon: 'i-heroicons-exclamation-circle' })
    return
  }
  const token = (window as any).turnstile?.getResponse(turnstileWidgetId)
  if (!token || !tokenReady.value) {
    toast.add({ title: 'Captcha requis', description: 'Veuillez valider le captcha avant de continuer.', color: 'orange', icon: 'i-heroicons-shield-exclamation' })
    return
  }
  loading.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...form, token } })
    Object.assign(form, { name: '', email: '', message: '' })
    refreshCaptcha()
    toast.add({ title: 'Message envoyé ✅', description: 'Notre équipe vous répondra dans les plus brefs délais.', color: 'green', icon: 'i-heroicons-check-circle' })
  } catch {
    refreshCaptcha()
    toast.add({ title: "Erreur lors de l'envoi", description: 'Une erreur est survenue. Veuillez réessayer.', color: 'red', icon: 'i-heroicons-x-circle' })
  } finally {
    loading.value = false
  }
}

const contactCards = [
  {
    icon: 'i-heroicons-phone', label: 'Téléphone', value: '+229 99 99 99 99',
    href: 'tel:+22999999999', iconBg: 'bg-orange-50', iconColor: 'text-[#ea6c1e]',
    accentBg: '#ea6c1e12', accentBorder: '#ea6c1e25',
  },
  {
    icon: 'i-heroicons-map-pin', label: 'Adresse', value: 'Cotonou, Bénin',
    href: null, iconBg: 'bg-indigo-50', iconColor: 'text-[#5b47e0]',
    accentBg: '#5b47e012', accentBorder: '#5b47e025',
  },
]

const socialLinks = [
  { icon: 'i-simple-icons-facebook',  href: '#', bg: '#1877F2', label: 'Facebook'  },
  { icon: 'i-simple-icons-twitter',   href: '#', bg: '#1DA1F2', label: 'Twitter'   },
  { icon: 'i-simple-icons-instagram', href: '#', bg: '#E1306C', label: 'Instagram' },
]
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-6">

      <!-- ══ HERO ══ -->
      <div class="text-center mb-2">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4
                    bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                    text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-3 h-3 text-[#ea6c1e]" />
          On est là pour vous
        </div>
        <h1 class="text-[30px] sm:text-[38px] font-bold text-[#1a1612] tracking-tight mb-3">
          Contactez-<span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">nous</span>
        </h1>
        <p class="text-[14px] text-[#8a8078] max-w-md mx-auto leading-relaxed">
          Une question, une suggestion ? Notre équipe vous répondra dans les plus brefs délais.
        </p>
      </div>

      <!-- ══ CARDS CONTACT ══ -->
      <div class="grid sm:grid-cols-2 gap-3">
        <div v-for="card in contactCards" :key="card.label"
          class="bg-white rounded-2xl border border-[#ede8e0] p-4 flex items-center gap-4
                 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            :style="{ background: card.accentBg, border: `1.5px solid ${card.accentBorder}` }">
            <UIcon :name="card.icon" class="w-4.5 h-4.5" :class="card.iconColor" />
          </div>
          <div>
            <p class="text-[10px] font-semibold text-[#b0a898] uppercase tracking-wide mb-0.5">{{ card.label }}</p>
            <a v-if="card.href" :href="card.href"
              class="text-[13.5px] font-semibold text-[#1a1612] hover:text-[#ea6c1e] transition-colors">
              {{ card.value }}
            </a>
            <p v-else class="text-[13.5px] font-semibold text-[#1a1612]">{{ card.value }}</p>
          </div>
        </div>
      </div>

      <!-- ══ FORMULAIRE ══ -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">

        <!-- Header sobre style wizard -->
        <div class="border-b border-[#ede8e0] px-6 pt-6 pb-5">
          <div class="flex items-start justify-between mb-4">
            
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#faf8f5] border border-[#ede8e0]">
              <UIcon name="i-heroicons-shield-check" class="w-3 h-3 text-emerald-500" />
              <span class="text-[10px] font-medium text-[#8a8078]">Message sécurisé</span>
            </div>
          </div>
          <h2 class="text-[21px] font-bold text-[#1a1612] leading-snug mb-1">Envoyez-nous un message</h2>
          <p class="text-[13px] text-[#8a8078] leading-relaxed">Notre équipe vous répondra sous 24h.</p>
        </div>

        <!-- Corps -->
        <form @submit.prevent="submitForm" class="p-6 space-y-4">

          <!-- Nom + Email -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="field">
              <label class="field-label">Nom complet <span class="text-[#ea6c1e]">*</span></label>
              <div class="relative">
                <UIcon name="i-heroicons-user"
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                <input v-model="form.name" type="text" placeholder="Votre nom" required
                  class="field-input pl-10" />
              </div>
            </div>
            <div class="field">
              <label class="field-label">Email <span class="text-[#ea6c1e]">*</span></label>
              <div class="relative">
                <UIcon name="i-heroicons-at-symbol"
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                <input v-model="form.email" type="email" placeholder="votre@email.com" required
                  class="field-input pl-10" />
              </div>
            </div>
          </div>

          <!-- Message -->
          <div class="field">
            <label class="field-label">Message <span class="text-[#ea6c1e]">*</span></label>
            <textarea v-model="form.message" rows="5" required
              placeholder="Décrivez votre demande, question ou suggestion…"
              class="field-input resize-none" />
          </div>

          <!-- Captcha -->
          <div class="cf-turnstile" />

          <!-- Bouton -->
          <button type="submit" :disabled="loading"
            class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                   text-white text-[14px] font-bold
                   shadow-[0_4px_18px_rgba(234,108,30,0.28)]
                   hover:opacity-90 hover:-translate-y-0.5
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                   transition-all duration-200"
            style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
            <template v-if="!loading">
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
              Envoyer le message
            </template>
            <template v-else>
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Envoi en cours…
            </template>
          </button>
        </form>

        <!-- Footer card -->
        <div class="px-6 py-4 bg-[#faf8f5] border-t border-[#ede8e0] flex items-center justify-center gap-3">
          <p class="text-[11.5px] text-[#b0a898]">Suivez-nous</p>
          <div class="flex items-center gap-2">
            <a v-for="social in socialLinks" :key="social.label" :href="social.href" :title="social.label"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-white
                     hover:-translate-y-0.5 hover:opacity-90 transition-all duration-150"
              :style="{ background: social.bg }">
              <UIcon :name="social.icon" class="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: #4a3f32; letter-spacing: 0.02em; }

.field-input {
  width: 100%; padding: 11px 14px;
  background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px;
  font-size: 13.5px; color: #1a1612; font-family: 'Outfit', sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; outline: none;
}
.field-input:focus {
  background: white;
  border-color: #ea6c1e;
  box-shadow: 0 0 0 3px rgba(234, 108, 30, 0.1);
}
.field-input::placeholder { color: #c0b8ad; }
</style>
<script setup lang="ts">
definePageMeta({ layout: 'auth' })

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { onMounted, ref, computed } from 'vue'
import { useToast } from '#imports'
import { useAuth } from '../../../composables/useAuth'

const showPassword    = ref(false)
const showConfirm     = ref(false)
const toast           = useToast()
const loading         = ref(false)
const loadingProvider = ref<string | null>(null)
const config          = useRuntimeConfig()

const { createUser, loginWithGoogle, loginWithFacebook } = useAuth()

// ── Schema ──
const schema = z.object({
  name:            z.string().min(3, 'Nom trop court'),
  email:           z.string().email('Email invalide'),
  password:        z.string(),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  const pwd = data.password
  if (pwd.length < 8)          ctx.addIssue({ path: ['password'], message: 'Au moins 8 caractères',          code: z.ZodIssueCode.custom })
  if (!/[A-Z]/.test(pwd))      ctx.addIssue({ path: ['password'], message: 'Au moins une majuscule',         code: z.ZodIssueCode.custom })
  if (!/[0-9]/.test(pwd))      ctx.addIssue({ path: ['password'], message: 'Au moins un chiffre',            code: z.ZodIssueCode.custom })
  if (!/[!@#$%^&*]/.test(pwd)) ctx.addIssue({ path: ['password'], message: 'Au moins un caractère spécial',  code: z.ZodIssueCode.custom })
  if (data.password !== data.confirmPassword)
    ctx.addIssue({ path: ['confirmPassword'], message: 'Les mots de passe ne correspondent pas', code: z.ZodIssueCode.custom })
})
type Schema = z.infer<typeof schema>

const state = ref({ name: '', email: '', password: '', confirmPassword: '' })

// ── Force mot de passe ──
const passwordStrength = computed(() => {
  const pwd = state.value.password
  if (!pwd) return 0
  let s = 0
  if (pwd.length >= 8)          s++
  if (/[A-Z]/.test(pwd))        s++
  if (/[0-9]/.test(pwd))        s++
  if (/[!@#$%^&*]/.test(pwd))   s++
  return s
})
const strengthLabel = computed(() => {
  const s = passwordStrength.value
  if (!s)   return null
  if (s <= 1) return { text: 'Faible', color: '#dc2626' }
  if (s <= 2) return { text: 'Moyen',  color: '#ea6c1e' }
  if (s <= 3) return { text: 'Bien',   color: '#f59e0b' }
  return       { text: 'Fort',   color: '#059669' }
})



// ── Captcha ──
const tokenReady = ref(false)
let turnstileWidgetId: number | null = null

const refreshCaptcha = () => {
  const container = document.querySelector('.cf-turnstile')
  if ((window as any).turnstile && container) {
    if (turnstileWidgetId !== null) {
      ;(window as any).turnstile.reset(turnstileWidgetId)
    } else {
      turnstileWidgetId = (window as any).turnstile.render(container, {
        sitekey: config.public.turnstileSiteKey,
        callback:           () => { tokenReady.value = true  },
        'expired-callback': () => { tokenReady.value = false },
      })
    }
  }
}

// ── Submit ──
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!tokenReady.value) {
    toast.add({ title: 'Captcha en cours', description: 'Veuillez patienter...', color: 'orange' })
    return
  }
  const token = (window as any).turnstile?.getResponse()
  if (!token) {
    toast.add({ title: 'Captcha requis', description: 'Veuillez valider le captcha.', color: 'orange' })
    return
  }
  loading.value = true
  try {
    await $fetch('/api/cloudeflare/verify-turnstile', { method: 'POST', body: { token } })
    const { name, email, password, confirmPassword } = event.data
    await createUser(name, email, password, confirmPassword)
    toast.add({
      title: 'Compte créé avec succès ✅',
      description: 'Bienvenue sur WeLoveEvent !',
      color: 'green',
      icon: 'i-heroicons-check-circle',
    })
    await navigateTo('/auth/login')
  } catch (e: any) {
    refreshCaptcha()
    let message = "Erreur lors de l'inscription"
    if (e?.message?.includes('already exists')) message = 'Cette adresse e-mail est déjà associée à un compte.'
    else if (e?.message) message = e.message
    toast.add({ title: message, color: 'red', icon: 'i-heroicons-x-circle' })
  } finally {
    loading.value = false
  }
}

onMounted(() => { refreshCaptcha() })
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit flex items-center justify-center p-4 py-10">

    <!-- Blobs décoratifs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-25
                  bg-gradient-to-br from-[#ea6c1e]/30 to-transparent blur-3xl" />
      <div class="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-25
                  bg-gradient-to-br from-[#5b47e0]/30 to-transparent blur-3xl" />
    </div>

    <div class="relative z-10 w-full max-w-md">

      <!-- ══ CARD ══ -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">

        <!-- ── Header option B (même que login) ── -->
        <div class="border-b border-[#ede8e0] px-6 pt-6 pb-5">
          <div class="flex items-start justify-between mb-4">
           <NuxtLink to="/" class="flex items-center gap-2 flex-shrink-0 group">
          <svg width="32" height="32" viewBox="0 0 100 110" class="transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
            <circle cx="50" cy="18" r="16" fill="#ea6c1e"/>
            <path d="M10 55 Q10 95 30 95 Q40 95 50 80 Q60 95 70 95 Q90 95 90 55 L90 50 Q90 40 80 40 L70 40 Q60 40 60 50 L60 68 Q60 75 50 75 Q40 75 40 68 L40 50 Q40 40 30 40 L20 40 Q10 40 10 50 Z" fill="#ea6c1e"/>
          </svg>
          <span class="text-[16px] sm:text-[17px] font-bold tracking-tight text-[#1a1612] group-hover:text-[#ea6c1e] transition-colors duration-300">WeLove<span class="text-[#ea6c1e]">Event</span></span>
        </NuxtLink>
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#faf8f5] border border-[#ede8e0]">
              <UIcon name="i-heroicons-shield-check" class="w-3 h-3 text-emerald-500" />
              <span class="text-[10px] font-medium text-[#8a8078]">Inscription sécurisée</span>
            </div>
          </div>
          <h1 class="text-[21px] font-bold text-[#1a1612] leading-snug mb-1">Créer un compte</h1>
          <p class="text-[13px] text-[#8a8078] leading-relaxed">Rejoignez la communauté WeLoveEvent.</p>
        </div>

        <!-- ── Corps ── -->
        <div class="p-6 space-y-5">

          

          <!-- Formulaire -->
          <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">

            <!-- Nom -->
            <div class="field">
              <label class="field-label">Nom complet <span class="text-[#ea6c1e]">*</span></label>
              <UFormField name="name">
                <div class="relative">
                  
                  <input v-model="state.name" type="text" placeholder="Votre nom complet"
                    autocomplete="name" autofocus :disabled="loading"
                    class="field-input pl-10" />
                </div>
              </UFormField>
            </div>

            <!-- Email -->
            <div class="field">
              <label class="field-label">Email <span class="text-[#ea6c1e]">*</span></label>
              <UFormField name="email">
                <div class="relative">
                  
                  <input v-model="state.email" type="email" placeholder="votre@email.com"
                    autocomplete="email" :disabled="loading"
                    class="field-input pl-10" />
                </div>
              </UFormField>
            </div>

            <!-- Mot de passe + barre de force -->
            <div class="field">
              <label class="field-label">Mot de passe <span class="text-[#ea6c1e]">*</span></label>
              <UFormField name="password">
                <div class="relative">
                  
                  <input v-model="state.password" :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••" :disabled="loading"
                    class="field-input pl-10 pr-11" />
                  <button type="button" @click="showPassword = !showPassword"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#4a3f32] transition-colors">
                    <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                  </button>
                </div>
              </UFormField>
              <!-- Barre de force -->
              <div v-if="state.password" class="mt-2 space-y-1.5">
                <div class="flex gap-1">
                  <div v-for="i in 4" :key="i"
                    class="h-1 flex-1 rounded-full transition-all duration-300"
                    :style="{ background: i <= passwordStrength ? strengthLabel?.color : '#ede8e0' }" />
                </div>
                <p class="text-[11px] font-semibold" :style="{ color: strengthLabel?.color }">
                  {{ strengthLabel?.text }}
                </p>
              </div>
            </div>

            <!-- Confirmer mot de passe -->
            <div class="field">
              <label class="field-label">Confirmer le mot de passe <span class="text-[#ea6c1e]">*</span></label>
              <UFormField name="confirmPassword">
                <div class="relative">
                  
                  <input v-model="state.confirmPassword"
                    :type="showConfirm ? 'text' : 'password'"
                    placeholder="••••••••"
                    autocomplete="new-password" :disabled="loading"
                    class="field-input pl-10 pr-11" />
                  <button type="button" @click="showConfirm = !showConfirm"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#4a3f32] transition-colors">
                    <UIcon :name="showConfirm ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                  </button>
                </div>
              </UFormField>
            </div>

            <!-- Captcha -->
            <div class="cf-turnstile" :data-sitekey="config.public.turnstileSiteKey" />

            <!-- Bouton submit -->
            <button
              type="submit" :disabled="loading"
              class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                     text-white text-[14px] font-bold
                     shadow-[0_4px_18px_rgba(234,108,30,0.28)]
                     hover:opacity-90 hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                     transition-all duration-200"
              style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
              <template v-if="!loading">
                <UIcon name="i-heroicons-user-plus" class="w-4 h-4" />
                Créer mon compte
              </template>
              <template v-else>
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Inscription…
              </template>
            </button>

          </UForm>
        </div>

        <!-- ── Footer card ── -->
        <div class="px-6 py-4 bg-[#faf8f5] border-t border-[#ede8e0] flex items-center justify-center gap-1.5">
          <span class="text-[12.5px] text-[#b0a898]">Déjà un compte ?</span>
          <NuxtLink to="/auth/login"
            class="text-[12.5px] font-bold text-[#ea6c1e] hover:underline transition-colors">
            Se connecter
          </NuxtLink>
        </div>

      </div>

      <!-- Liens légaux -->
      <div class="flex items-center justify-center gap-4 mt-5">
        <NuxtLink to="/helps/privacy" class="text-[11px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Confidentialité</NuxtLink>
        <span class="text-[#d4cec5]">·</span>
        <NuxtLink to="/helps/terms"   class="text-[11px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Conditions</NuxtLink>
        <span class="text-[#d4cec5]">·</span>
        <NuxtLink to="/contact"       class="text-[11px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Aide</NuxtLink>
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
.field-input:disabled { opacity: 0.6; }
</style>
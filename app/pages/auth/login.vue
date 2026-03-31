<script setup lang="ts">
definePageMeta({ layout: 'auth' })

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useAuth } from '../../../composables/useAuth'
import { onMounted, ref } from 'vue'
import { useToast } from '#imports'

const showPassword = ref(false)
const config = useRuntimeConfig()
const toast = useToast()
const loadingProvider = ref<string | null>(null)
const loading = ref(false)
const route = useRoute()

const { loginWithGoogle, loginWithFacebook, loginWithEmail, fetchSession } = useAuth()

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Doit contenir au moins 8 caractères'),
  remember: z.boolean().optional(),
})
type Schema = z.output<typeof schema>

const state = ref({ email: '', password: '', remember: false })

// ── Social login ──
const handleSocial = async (provider: 'Google' | 'Facebook') => {
  loadingProvider.value = provider
  try {
    if (provider === 'Google')   await loginWithGoogle()
    if (provider === 'Facebook') await loginWithFacebook()
  } catch {
    toast.add({ title: `Erreur de connexion ${provider}`, color: 'red', icon: 'i-heroicons-x-circle' })
  } finally {
    loadingProvider.value = null
  }
}

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
        callback: () => { tokenReady.value = true },
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
    await loginWithEmail(event.data.email, event.data.password, event.data.remember)
    await fetchSession()

    toast.add({
      title: 'Connexion réussie ✅',
      description: 'Bienvenue sur WeLoveEvent !',
      color: 'green',
      icon: 'i-heroicons-check-circle',
    })

    const redirect = route.query.redirect as string
    await navigateTo(redirect || '/dashboard/events')
  } catch (error: any) {
    toast.add({
      title: 'Erreur de connexion',
      description: error?.data?.message || error.message || 'Identifiants incorrects.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSession()
  refreshCaptcha()
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit flex items-center justify-center p-4">

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

        <!-- ── Header option B ── -->
        <div class="border-b border-[#ede8e0] px-6 pt-6 pb-5">
          <!-- Ligne logo + badge -->
          <div class="flex items-start justify-between mb-4">
            <NuxtLink to="/" class="flex items-center gap-2 flex-shrink-0 group">
          <svg width="32" height="32" viewBox="0 0 100 110" class="transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
            <circle cx="50" cy="18" r="16" fill="#ea6c1e"/>
            <path d="M10 55 Q10 95 30 95 Q40 95 50 80 Q60 95 70 95 Q90 95 90 55 L90 50 Q90 40 80 40 L70 40 Q60 40 60 50 L60 68 Q60 75 50 75 Q40 75 40 68 L40 50 Q40 40 30 40 L20 40 Q10 40 10 50 Z" fill="#ea6c1e"/>
          </svg>
          <span class="text-[16px] sm:text-[17px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">WeLoveEvent</span>
        </NuxtLink>
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#faf8f5] border border-[#ede8e0]">
              <UIcon name="i-heroicons-shield-check" class="w-3 h-3 text-emerald-500" />
              <span class="text-[10px] font-medium text-[#8a8078]">Connexion sécurisée</span>
            </div>
          </div>
          <!-- Titre + accroche -->
          <h1 class="text-[21px] font-bold text-[#1a1612] leading-snug mb-1">Bienvenue de retour</h1>
          <p class="text-[13px] text-[#8a8078] leading-relaxed">Connectez-vous pour accéder à vos événements.</p>
        </div>

        <!-- ── Corps ── -->
        <div class="p-6 space-y-5">

         

          <!-- Formulaire -->
          <UForm :schema="schema" :state="state" validate-on="input" @submit="onSubmit" class="space-y-4">

            <!-- Email -->
            <div class="field">
              <label class="field-label">Email <span class="text-[#ea6c1e]">*</span></label>
              <UFormField name="email">
                <div class="relative">
                  
                  <input
                    v-model="state.email"
                    type="email"
                    placeholder="votre@email.com"
                    autocomplete="email"
                    autofocus
                    :disabled="loading"
                    @focus="refreshCaptcha"
                    class="field-input pl-10"
                  />
                </div>
              </UFormField>
            </div>

            <!-- Mot de passe -->
            <div class="field">
              <div class="flex items-center justify-between">
                <label class="field-label">Mot de passe <span class="text-[#ea6c1e]">*</span></label>
                
              </div>
              <UFormField name="password">
                <div class="relative">
                
                  <input
                    v-model="state.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    :disabled="loading"
                    class="field-input pl-10 pr-11"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#4a3f32] transition-colors">
                    <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                  </button>
                </div>
              </UFormField>
            </div>

            <!-- Se souvenir -->
            <label class="flex items-center gap-2.5 cursor-pointer group">
              <div class="relative flex-shrink-0">
                <input v-model="state.remember" type="checkbox" class="sr-only peer" />
                <div class="w-4 h-4 rounded border border-[#ede8e0] bg-[#faf8f5]
                            peer-checked:bg-[#ea6c1e] peer-checked:border-[#ea6c1e]
                            transition-all flex items-center justify-center">
                  <UIcon v-if="state.remember" name="i-heroicons-check" class="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <span class="text-[12.5px] text-[#8a8078] group-hover:text-[#4a3f32] transition-colors">
                Se souvenir de moi
              </span>
            </label>

            <!-- Captcha -->
            <div class="cf-turnstile" :data-sitekey="config.public.turnstileSiteKey" />

            <!-- Bouton submit -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                     text-white text-[14px] font-bold
                     shadow-[0_4px_18px_rgba(234,108,30,0.28)]
                     hover:opacity-90 hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                     transition-all duration-200"
              style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
              <template v-if="!loading">
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
                Se connecter
              </template>
              <template v-else>
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Connexion…
              </template>
            </button>
            <!-- Séparateur -->
          <div class="relative flex items-center gap-3">
            <div class="flex-1 h-px bg-[#ede8e0]" />
            <span class="text-[11px] font-medium text-[#c0b8ad] flex-shrink-0">ou continuer avec</span>
            <div class="flex-1 h-px bg-[#ede8e0]" />
          </div>
             <!-- Boutons sociaux -->
          <div class="grid grid-cols-2 gap-2.5">
            <button
              @click="handleSocial('Google')"
              :disabled="!!loadingProvider"
              class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                     bg-[#faf8f5] border border-[#ede8e0] text-[12.5px] font-semibold text-[#1a1612]
                     hover:border-[#c0b8ad] hover:bg-white
                     disabled:opacity-50 transition-all duration-150">
              <svg v-if="loadingProvider === 'Google'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#4285F4" stroke-width="4"/>
                <path class="opacity-75" fill="#4285F4" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <button
              @click="handleSocial('Facebook')"
              :disabled="!!loadingProvider"
              class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                     text-[12.5px] font-semibold text-white
                     hover:opacity-90 disabled:opacity-50 transition-all duration-150"
              style="background: #1877F2; border: 1px solid #1565C0">
              <svg v-if="loadingProvider === 'Facebook'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"/>
                <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          

          </UForm>
        </div>

        <!-- ── Footer card ── -->
        <div class="px-6 py-4 bg-[#faf8f5] border-t border-[#ede8e0] flex items-center justify-center gap-1.5">
          <span class="text-[12.5px] text-[#b0a898]">Pas encore de compte ?</span>
          <NuxtLink to="/auth/signup"
            class="text-[12.5px] font-bold text-[#ea6c1e] hover:underline transition-colors">
            Créer un compte
          </NuxtLink>
        </div>

      </div>

      <!-- Liens légaux -->
      <div class="flex items-center justify-center gap-4 mt-5">
        <NuxtLink to="/helps/faq"
          class="text-[11px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Confidentialité</NuxtLink>
        <span class="text-[#d4cec5]">·</span>
        <NuxtLink to="/helps/terms"
          class="text-[11px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Conditions</NuxtLink>
        <span class="text-[#d4cec5]">·</span>
        <NuxtLink to="/contact"
          class="text-[11px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Aide</NuxtLink>
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
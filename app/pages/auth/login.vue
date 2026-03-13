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

    // ✅ Redirige vers la page d'origine si elle existe (ex: /organizerForm)
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

    <!-- Blobs décoratifs discrets -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30
                  bg-gradient-to-br from-[#ea6c1e]/20 to-transparent blur-3xl" />
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-30
                  bg-gradient-to-br from-[#5b47e0]/20 to-transparent blur-3xl" />
    </div>

    <div class="relative z-10 w-full max-w-md">

      <!-- ══ CARD PRINCIPALE ══ -->
      <div class="bg-white rounded-2xl border border-[#ede8e0]
                  shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-7 sm:p-9">

        <!-- ══ HEADER AMÉLIORÉ ══ -->
        <div class="relative mb-7 -mx-7 sm:-mx-9 -mt-7 sm:-mt-9 rounded-t-2xl overflow-hidden">

          <!-- Fond dégradé -->
          <div class="bg-gradient-to-br from-[#5b47e0] to-[#ea6c1e] px-7 sm:px-9 pt-7 pb-8">

            <!-- Motif de points décoratif -->
            <div class="absolute inset-0 opacity-10"
              style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px;" />

            <!-- Logo en haut -->
            <NuxtLink to="/" class="relative inline-flex items-center gap-2 mb-5">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold
                          bg-white/20 border border-white/30 text-white backdrop-blur-sm">
                WLE
              </div>
              <span class="text-[15px] font-bold text-white/90">
                WeLove<span class="text-white">Event</span>
              </span>
            </NuxtLink>

            <!-- Icône centrale + titre -->
            <div class="relative flex items-end justify-between">
              <div>
                <!-- Badge pill -->
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3
                            bg-white/15 border border-white/25 backdrop-blur-sm">
                  <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span class="text-[10.5px] font-semibold text-white/90 uppercase tracking-widest">
                    Connexion
                  </span>
                </div>
                <h1 class="text-[26px] font-extrabold text-white tracking-tight leading-tight">
                  Bienvenue<br>
                  <span class="text-white/80">de retour !</span>
                </h1>
              </div>

              <!-- Icône + éléments décoratifs -->
              <div class="flex flex-col items-center gap-1.5 mb-1">
                <div class="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/30
                            flex items-center justify-center backdrop-blur-sm">
                  <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-7 h-7 text-white" />
                </div>
                <!-- Indicateur sécurisé -->
                <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/20">
                  <UIcon name="i-heroicons-shield-check" class="w-3 h-3 text-white/80" />
                  <span class="text-[9px] font-semibold text-white/80">Sécurisé</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Vague de séparation -->
          <div class="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 400 16" preserveAspectRatio="none" class="w-full h-4">
              <path d="M0,16 C100,0 300,0 400,16 L400,16 L0,16 Z" fill="white"/>
            </svg>
          </div>
        </div>

        

        <!-- Formulaire -->
        <UForm :schema="schema" :state="state" validate-on="input" @submit="onSubmit">
          <div class="space-y-4 mb-4">

            <!-- Email -->
            <div>
              <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
                Email <span class="text-[#ea6c1e]">*</span>
              </label>
              <UFormField name="email">
                <div class="relative">
                  <UIcon name="i-heroicons-at-symbol"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                  <input
                    v-model="state.email"
                    type="email"
                    placeholder="votre@email.com"
                    autocomplete="email"
                    autofocus
                    :disabled="loading"
                    @focus="refreshCaptcha"
                    class="w-full pl-10 pr-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                           bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                           outline-none transition-all duration-200
                           focus:bg-white focus:border-[#ea6c1e]
                           focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]
                           disabled:opacity-60"
                  />
                </div>
              </UFormField>
            </div>

            <!-- Mot de passe -->
            <div>
              <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
                Mot de passe <span class="text-[#ea6c1e]">*</span>
              </label>
              <UFormField name="password">
                <div class="relative">
                  <UIcon name="i-heroicons-key"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                  <input
                    v-model="state.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Mot de passe"
                    :disabled="loading"
                    class="w-full pl-10 pr-11 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                           bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                           outline-none transition-all duration-200
                           focus:bg-white focus:border-[#ea6c1e]
                           focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]
                           disabled:opacity-60"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2
                           text-[#c0b8ad] hover:text-[#4a3f32] transition-colors"
                  >
                    <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                      class="w-4 h-4" />
                  </button>
                </div>
              </UFormField>
            </div>
          </div>

          <!-- Se souvenir + mot de passe oublié -->
          <div class="flex items-center justify-between mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="state.remember"
                type="checkbox"
                class="w-3.5 h-3.5 rounded border-[#ede8e0] accent-[#ea6c1e]"
              />
              <span class="text-[12px] text-[#8a8078]">Se souvenir</span>
            </label>
            <NuxtLink to="/forgot"
              class="text-[12px] font-semibold text-[#ea6c1e] hover:underline transition-colors">
              Mot de passe oublié ?
            </NuxtLink>
          </div>

          <!-- Captcha Cloudflare -->
          <div class="cf-turnstile mb-4" :data-sitekey="config.public.turnstileSiteKey" />

          <!-- Bouton connexion -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl 
                   bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                   text-white text-[14px] font-bold
                   shadow-[0_4px_20px_rgba(234,108,30,0.25)]
                   hover:shadow-[0_6px_28px_rgba(234,108,30,0.35)]
                   hover:-translate-y-0.5
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                   transition-all duration-200"
          >
            <template v-if="!loading">
              <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
              Se connecter
            </template>
            <template v-else>
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Connexion...
            </template>
          </button>
        </UForm>

         <!-- Séparateur -->
        <div class="relative my-7">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full h-px bg-[#ede8e0]" />
          </div>
          <div class="relative flex justify-center">
            <span class="px-3 bg-white text-[11.5px] font-medium text-[#c0b8ad]">OU</span>
          </div>
        </div>

        <!-- ══ BOUTONS SOCIAUX — vraies couleurs de marque ══ -->
        <div class="grid grid-cols-2 gap-2.5 mb-7">

          <!-- ─ Google : fond blanc, logo SVG 4 couleurs officiel ─ -->
          <button
            @click="handleSocial('Google')"
            :disabled="!!loadingProvider"
            class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                   bg-white border border-[#dadce0] text-[12.5px] font-medium text-[#3c4043]
                   hover:bg-[#f8f9fa] hover:shadow-[0_1px_8px_rgba(0,0,0,0.1)]
                   disabled:opacity-60 transition-all duration-150"
          >
            <svg v-if="loadingProvider === 'Google'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#4285F4" stroke-width="4"/>
              <path class="opacity-75" fill="#4285F4" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <svg v-else class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <!-- ─ Facebook : fond #1877F2 officiel, logo blanc ─ -->
          <button
            @click="handleSocial('Facebook')"
            :disabled="!!loadingProvider"
            class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                   text-[12.5px] font-medium text-white
                   hover:brightness-110 hover:shadow-[0_1px_8px_rgba(24,119,242,0.35)]
                   disabled:opacity-60 transition-all duration-150"
            style="background-color: #1877F2; border: 1px solid #1565C0"
          >
            <svg v-if="loadingProvider === 'Facebook'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"/>
              <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <svg v-else class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

       

        <!-- Créer un compte -->
        <p class="text-center text-[12.5px] text-[#b0a898] mt-5">
          Nouveau ici ?
          <NuxtLink to="/auth/signup"
            class="text-[#ea6c1e] font-semibold hover:underline transition-colors">
            Créer un compte
          </NuxtLink>
        </p>
      </div>

      <!-- Liens footer -->
      <div class="flex items-center justify-center gap-4 mt-5">
        <NuxtLink to="/helps/faq"
          class="text-[11.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">
          Confidentialité
        </NuxtLink>
        <span class="text-[#d4cec5]">·</span>
        <NuxtLink to="/helps/terms"
          class="text-[11.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">
          Conditions
        </NuxtLink>
        <span class="text-[#d4cec5]">·</span>
        <NuxtLink to="/contact"
          class="text-[11.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">
          Aide
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
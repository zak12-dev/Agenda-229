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
  if (pwd.length < 8)          ctx.addIssue({ path: ['password'], message: 'Au moins 8 caractères',           code: z.ZodIssueCode.custom })
  if (!/[A-Z]/.test(pwd))      ctx.addIssue({ path: ['password'], message: 'Au moins une majuscule',          code: z.ZodIssueCode.custom })
  if (!/[0-9]/.test(pwd))      ctx.addIssue({ path: ['password'], message: 'Au moins un chiffre',             code: z.ZodIssueCode.custom })
  if (!/[!@#$%^&*]/.test(pwd)) ctx.addIssue({ path: ['password'], message: 'Au moins un caractère spécial',   code: z.ZodIssueCode.custom })
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
      <div class="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-25
                  bg-gradient-to-br from-[#ea6c1e]/20 to-transparent blur-3xl" />
      <div class="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-25
                  bg-gradient-to-br from-[#5b47e0]/20 to-transparent blur-3xl" />
    </div>

    <div class="relative z-10 w-full max-w-md">

      <!-- ══ CARD ══ -->
      <div class="bg-white rounded-2xl border border-[#ede8e0]
                  shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-7 sm:p-9">

        <!-- ══ HEADER AMÉLIORÉ ══ -->
        <div class="relative mb-7 -mx-7 sm:-mx-9 -mt-7 sm:-mt-9 rounded-t-2xl overflow-hidden">

          <!-- Fond dégradé -->
          <div class="bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] px-7 sm:px-9 pt-7 pb-8">

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
                    Nouveau compte
                  </span>
                </div>
                <h1 class="text-[26px] font-extrabold text-white tracking-tight leading-tight">
                  Rejoignez<br>
                  <span class="text-white/80">la communauté</span>
                </h1>
              </div>

              <!-- Avatar décoratif avec initiales -->
              <div class="flex flex-col items-center gap-1.5 mb-1">
                <div class="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/30
                            flex items-center justify-center backdrop-blur-sm">
                  <UIcon name="i-heroicons-user-plus" class="w-7 h-7 text-white" />
                </div>
                <!-- 3 petits avatars stackés -->
                <div class="flex -space-x-2">
                  <div v-for="(color, i) in ['#ea6c1e','#5b47e0','#059669']" :key="i"
                    class="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center"
                    :style="{ background: color }">
                    <UIcon name="i-heroicons-user" class="w-2.5 h-2.5 text-white" />
                  </div>
                  <div class="w-5 h-5 rounded-full border-2 border-white/40
                              bg-white/20 flex items-center justify-center text-[8px] font-bold text-white">
                    +
                  </div>
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

       
        <!-- ══ FORMULAIRE ══ -->
        <UForm :schema="schema" :state="state" @submit="onSubmit">
          <div class="space-y-4 mb-4">

            <!-- Nom -->
            <div>
              <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
                Nom complet <span class="text-[#ea6c1e]">*</span>
              </label>
              <UFormField name="name">
                <div class="relative">
                  <UIcon name="i-heroicons-user"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                  <input v-model="state.name" type="text" placeholder="Votre nom complet"
                    autocomplete="name" autofocus :disabled="loading"
                    class="w-full pl-10 pr-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                           bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                           outline-none transition-all duration-200 disabled:opacity-60
                           focus:bg-white focus:border-[#ea6c1e]
                           focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]" />
                </div>
              </UFormField>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
                Email <span class="text-[#ea6c1e]">*</span>
              </label>
              <UFormField name="email">
                <div class="relative">
                  <UIcon name="i-heroicons-at-symbol"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                  <input v-model="state.email" type="email" placeholder="votre@email.com"
                    autocomplete="email" :disabled="loading"
                    class="w-full pl-10 pr-4 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                           bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                           outline-none transition-all duration-200 disabled:opacity-60
                           focus:bg-white focus:border-[#ea6c1e]
                           focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]" />
                </div>
              </UFormField>
            </div>

            <!-- Mot de passe + barre de force -->
            <div>
              <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
                Mot de passe <span class="text-[#ea6c1e]">*</span>
              </label>
              <UFormField name="password">
                <div class="relative">
                  <UIcon name="i-heroicons-key"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                  <input v-model="state.password" :type="showPassword ? 'text' : 'password'"
                    placeholder="Mot de passe" :disabled="loading"
                    class="w-full pl-10 pr-11 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                           bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                           outline-none transition-all duration-200 disabled:opacity-60
                           focus:bg-white focus:border-[#ea6c1e]
                           focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]" />
                  <button type="button" @click="showPassword = !showPassword"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#4a3f32] transition-colors">
                    <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                  </button>
                </div>
              </UFormField>
              <!-- Barre de force -->
              <div v-if="state.password" class="mt-2 space-y-1">
                <div class="flex gap-1">
                  <div v-for="i in 4" :key="i"
                    class="h-1 flex-1 rounded-full transition-all duration-300"
                    :style="{ background: i <= passwordStrength ? strengthLabel?.color : '#ede8e0' }" />
                </div>
                <p class="text-[10.5px] font-semibold" :style="{ color: strengthLabel?.color }">
                  {{ strengthLabel?.text }}
                </p>
              </div>
            </div>

            <!-- Confirmer mot de passe -->
            <div>
              <label class="block text-[11.5px] font-semibold text-[#4a3f32] uppercase tracking-wide mb-1.5">
                Confirmer le mot de passe <span class="text-[#ea6c1e]">*</span>
              </label>
              <UFormField name="confirmPassword">
                <div class="relative">
                  <UIcon name="i-heroicons-lock-closed"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
                  <input v-model="state.confirmPassword"
                    :type="showConfirm ? 'text' : 'password'"
                    placeholder="Confirmez le mot de passe"
                    autocomplete="new-password" :disabled="loading"
                    class="w-full pl-10 pr-11 py-3 rounded-xl text-[13.5px] text-[#1a1612]
                           bg-[#faf8f5] border border-[#ede8e0] placeholder:text-[#c0b8ad]
                           outline-none transition-all duration-200 disabled:opacity-60
                           focus:bg-white focus:border-[#ea6c1e]
                           focus:shadow-[0_0_0_3px_rgba(234,108,30,0.1)]" />
                  <button type="button" @click="showConfirm = !showConfirm"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#4a3f32] transition-colors">
                    <UIcon :name="showConfirm ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                  </button>
                </div>
              </UFormField>
            </div>

            <!-- Captcha -->
            <div class="cf-turnstile" :data-sitekey="config.public.turnstileSiteKey" />
          </div>

          <!-- Bouton inscription -->
          <button
            type="submit" :disabled="loading"
            class="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                   bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                   text-white text-[14px] font-bold
                   shadow-[0_4px_20px_rgba(234,108,30,0.25)]
                   hover:shadow-[0_6px_28px_rgba(234,108,30,0.35)] hover:-translate-y-0.5
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                   transition-all duration-200"
          >
            <template v-if="!loading">
              <UIcon name="i-heroicons-user-plus" class="w-4 h-4" />
              S'inscrire
            </template>
            <template v-else>
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Inscription...
            </template>
          </button>
        </UForm>

        <!-- Déjà un compte -->
        <p class="text-center text-[12.5px] text-[#b0a898] mt-5">
          Déjà un compte ?
          <NuxtLink to="/auth/login" class="text-[#ea6c1e] font-semibold hover:underline">
            Se connecter
          </NuxtLink>
        </p>
      </div>

      <!-- Liens footer -->
      <div class="flex items-center justify-center gap-4 mt-5">
        <NuxtLink to="/helps/privacy" class="text-[11.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Confidentialité</NuxtLink>
        <span class="text-[#d4cec5]">·</span>
        <NuxtLink to="/helps/terms"   class="text-[11.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Conditions</NuxtLink>
        <span class="text-[#d4cec5]">·</span>
        <NuxtLink to="/contact"       class="text-[11.5px] text-[#c0b8ad] hover:text-[#8a8078] transition-colors">Aide</NuxtLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
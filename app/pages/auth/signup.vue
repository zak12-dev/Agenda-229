<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { onMounted, ref } from 'vue'
import { useToast } from '#imports'
import { useAuth } from '../../../composables/useAuth'

const toast = useToast()
const loading = ref(false)


const { createUser } = useAuth()

const schema = z.object({
  name: z.string().min(3, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Les mots de passe ne correspondent pas'
})



type Schema = z.infer<typeof schema>

const state = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})
    

async function onSubmit() {
  loading.value = true    

  try {
    const { name, email, password, confirmPassword } = state.value

    await createUser(name, email, password, confirmPassword)

    toast.add({ title: 'Compte créé avec succès', color: 'green' })
    await navigateTo('/auth/login')

  } catch (e: any) {
    let message = 'Erreur lors de l’inscription'

    if (e?.data?.message) message = e.data.message
    else if (e?.data?.error) message = e.data.error
    else if (typeof e?.data === 'string') message = e.data

    toast.add({ title: message, color: 'red' })

  } finally {
    loading.value = false
  }
}


</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950 dark:to-indigo-950"></div>
    
    <!-- Animated Blobs -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-blob"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md">
      <div class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 md:p-10">
        
        <!-- Logo -->
        <div class="text-center mb-8 space-y-3">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Inscription
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Créez votre compte Agenda 229 pour commencer
          </p>
        </div>

        <!-- Form -->
        <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-5">
            <div class="grid gap-4 w-full">
          <UFormGroup label="Name" name="name" required>
            <UInput
              v-model="state.name"
              type="text"
              placeholder="Votre nom complet"
              icon="i-heroicons-user"
              size="lg"
              :ui="{ icon: { trailing: { pointer: '' } } }"
              class="w-full"
              autocomplete="name"
              :disabled="loading"
                aria-label="Nom complet"
                autofocus=""
            />
          </UFormGroup>
           <UFormGroup label="Email" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="votre@email.com"
              icon="i-heroicons-at-symbol"
              size="lg"
              :ui="{ icon: { trailing: { pointer: '' } } }"
              class="w-full"
              autocomplete="email"
              :disabled="loading"
              aria-label="Email"
            />
          </UFormGroup>
          

          <UFormGroup label="Mot de passe" name="password" required>
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Mot de passe"
              icon="i-heroicons-key"
              size="lg"
              class="w-full"
              autocomplete="new-password"
              :disabled="loading"
                aria-label="Mot de passe"
            />
          </UFormGroup>
          <UFormGroup label="Confirmer le mot de passe" name="confirmPassword" required>
            <UInput
                v-model="state.confirmPassword"
                type="password"
                placeholder="Confirmez le mot de passe"
                icon="i-heroicons-lock-closed"
                size="lg"
                class="w-full" 
                autocomplete="new-password"
                :disabled="loading"
                aria-label="Confirmer le mot de passe"
            />
          </UFormGroup>

          </div>

        

          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :disabled="loading"

            class="font-semibold shadow-lg shadow-purple-500/40"
          >
            <span v-if="!loading">S'inscrire</span>
            <span v-else>Inscription...</span>

          </UButton>
        </UForm>

        <!-- Sign Up -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
           Déjà un compte ici ?
            <NuxtLink to="/auth/login"  class="font-semibold text-purple-600 dark:text-indigo-400 hover:underline">
              Se connecter
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Footer Links -->
      <div class="mt-8 text-center">
        <div class="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <NuxtLink to="/privacy" class="hover:text-purple-600 dark:hover:text-indigo-400">
            Confidentialité
          </NuxtLink>
          <span>•</span>
          <NuxtLink to="/terms" class="hover:text-purple-600 dark:hover:text-indigo-400">
            Conditions
          </NuxtLink>
          <span>•</span>
          <NuxtLink to="/help" class="hover:text-purple-600 dark:hover:text-indigo-400">
            Aide
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useAuth } from '../../../composables/useAuth'
import { onMounted, ref } from 'vue'
import { useToast } from '#imports'

const toast = useToast()
const loadingProvider = ref<string | null>(null) // null ou le label du provider en cours
const loading = ref(false)

const { loginWithGoogle, loginWithFacebook, loginWithEmail, fetchSession, session } = useAuth()
console.log('SESSION CLIENT 👉', fetchSession)

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Doit contenir au moins 8 caractères'),
  remember: z.boolean().optional(),
})

type Schema = z.output<typeof schema>

const state = ref({
  email: '',
  password: '',
  remember: false,
})

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: async () => {
      loadingProvider.value = 'Google'
      try {
        await loginWithGoogle()
        toast.add({ title: 'Connexion réussie', color: 'green' })
      } catch (err) {
        console.error('Login error:', error)
        toast.add({ title: 'Erreur de connexion', color: 'red' })
      } finally {
        loading.value = false
      }
    },
  },
  {
    label: 'Facebook',
    icon: 'i-simple-icons-facebook',
    onClick: async () => {
      loadingProvider.value = 'Facebook'
      try {
        await loginWithFacebook()
        toast.add({ title: 'Connexion réussie', color: 'green' })
      } catch (err) {
        console.error('Login error:', error)
        toast.add({ title: 'Erreur de connexion', color: 'red' })
      } finally {
        loading.value = false
      }
    },
  },
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;

  try {
    await loginWithEmail(
      event.data.email,
      event.data.password,
      event.data.remember
    );

    await fetchSession();

    toast.add({
      title: 'Connexion réussie',
      color: 'green',
    });

    await navigateTo('/admin');

  } catch (error: any) {

    toast.add({
      title: error.message || 'Erreur de connexion',
      color: 'red',
    });

  } finally {
    loading.value = false;
  }
}

onMounted(() => fetchSession())
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
    <!-- Animated Background -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950 dark:to-indigo-950"
    ></div>

    <!-- Animated Blobs -->
    <div
      class="absolute top-0 left-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-blob"
    ></div>
    <div
      class="absolute top-0 right-0 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl animate-blob animation-delay-2000"
    ></div>
    <div
      class="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-blob animation-delay-4000"
    ></div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md">
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 md:p-10"
      >
        <!-- Logo -->
        <div class="text-center mb-8 -mt-5">
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
          >
            Bienvenue
          </h1>
          <p class="text-gray-600 dark:text-gray-400">Connectez-vous à votre compte</p>
        </div>

        <!-- Social Buttons -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <UButton
            v-for="provider in providers"
            :key="provider.label"
            :icon="provider.icon"
            variant="outline"
            size="lg"
            :loading="loadingProvider === provider.label"
            @click="provider.onClick"
            class="justify-center"
          >
            {{ provider.label }}
          </UButton>
        </div>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-3 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400">
              OU
            </span>
          </div>
        </div>

        <!-- Form -->
        <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-5">
          <div class="grid gap-4">
            <UFormGroup label="Email" name="email" required class=" " aria-required="true">
              <UInput
                v-model="state.email"
                type="email"
                placeholder="votre@email.com"
                icon="i-heroicons-at-symbol"
                size="xl"
                :ui="{ icon: { trailing: { pointer: '' } } }"
                class="w-full border border-gray-100 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-purple-500 dark:focus:ring-indigo-400"
                autocomplete="email"
                :disabled="loading"
                aria-label="Email"
                autofocus="email"
              />
            </UFormGroup>

            <UFormGroup label="Mot de passe" name="password" required aria-required="true">
              <UInput
                v-model="state.password"
                type="password"
                placeholder="Mot de passe"
                icon="i-heroicons-key"
                size="lg"
                class="w-full mb-4"
                autocomplete="current-password"
                :disabled="loading"
                aria-label="Mot de passe"
              />
            </UFormGroup>
          </div>
          <div class="flex items-center justify-between">
            <UCheckbox v-model="state.remember">
              <template #label>
                <span class="text-sm">Se souvenir</span>
              </template>
            </UCheckbox>
            <NuxtLink
              to="/forgot"
              class="text-sm font-medium text-purple-600 dark:text-indigo-400 hover:underline"
            >
              Mot de passe oublié ?
            </NuxtLink>
          </div>

          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="loading"
            class="font-semibold shadow-lg shadow-purple-500/40"
          >
            <span v-if="!loading">Se connecter</span>
            <span v-else>Connexion...</span>
          </UButton>
        </UForm>

        <!-- Sign Up -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Nouveau ici ?
            <NuxtLink
              to="/auth/signup"
              class="font-semibold text-purple-600 dark:text-indigo-400 hover:underline"
            >
              Créer un compte
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Footer Links -->
      <div class="mt-8 text-center">
        <div
          class="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400"
        >
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
  0%,
  100% {
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

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'
import { useRouter } from '#imports'

const orgName = ref('')
const description = ref('')
const website = ref('')
const phone = ref('')

const isSubmitting = ref(false)
const toast = useToast()
const router = useRouter()

const handleSubmit = async () => {
  if (!orgName.value) {
    toast.add({
      title: 'Erreur',
      description: 'Le nom de votre organisation est requis.',
      duration: 3000,
    })
    return
  }

  isSubmitting.value = true

  try {
    // Appel API
    const response = await $fetch('/api/organizer/request', {
      method: 'POST',
      body: {
        name: orgName.value,
        description: description.value,
        website: website.value,
        phone: phone.value,
      }
    })

    // Reset des champs
    orgName.value = ''
    description.value = ''
    website.value = ''
    phone.value = ''

    toast.add({
      title: 'Demande envoyée',
      description: 'Votre compte organisateur est en attente de validation.',
      duration: 5000,
    })

    // Optionnel : redirection
    // router.push('/merci')
    
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de la demande :', error)
    toast.add({
      title: 'Erreur',
      description: error?.message || 'Une erreur est survenue lors de l\'envoi de votre demande.',
      color: 'red',
      duration: 5000,
    })
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-50">
    <AppHeader />
    
    <div class="max-w-5xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      
      <!-- Hero Section -->
      <div class="text-center mb-12">
        
        <h1 class="text-4xl sm:text-5xl font-light text-gray-900 mb-4">
          Devenez <span class="text-transparent font-semibold bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600">Organisateur</span>
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Créez des événements d'exception et développez votre communauté
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        
        <!-- Avantages Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Vos avantages
            </h2>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                  <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-sm">Gestion complète</h3>
                  <p class="text-xs text-gray-600">Créez et gérez vos événements facilement</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                  <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-sm">Analytics en temps réel</h3>
                  <p class="text-xs text-gray-600">Suivez vos performances en direct</p>
                </div>
              </div>

              

              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                  <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-sm">Équipe collaborative</h3>
                  <p class="text-xs text-gray-600">1 membre gratuit inclus</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                  <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-sm">Support prioritaire</h3>
                  <p class="text-xs text-gray-600">Assistance dédiée 24/7</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Box -->
          <div class="bg-gradient-to-br from-orange-600 to-indigo-600 rounded-2xl p-6 text-white">
            <svg class="w-10 h-10 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="font-bold text-lg mb-2">Validation sous 24-48h</h3>
            <p class="text-sm text-orange-100">
              Un administrateur examinera votre demande et vous contactera rapidement
            </p>
          </div>
        </div>

        <!-- Formulaire -->
        <div class="lg:col-span-2">
          <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div class="space-y-6">
              
              <!-- Nom organisation -->
              <div>
                <label for="orgName" class="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de votre organisation <span class="text-red-500">*</span>
                </label>
                <input
                  id="orgName"
                  v-model="orgName"
                  type="text"
                  placeholder="Ex: EventPro Bénin"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <p class="text-xs text-gray-500 mt-1.5">Ce nom apparaîtra sur tous vos événements</p>
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="description"
                  rows="4"
                  placeholder="Présentez votre organisation, votre mission, vos valeurs..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <!-- Website -->
              <div>
                <label for="website" class="block text-sm font-semibold text-gray-700 mb-2">
                  Site web
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <input
                    id="website"
                    v-model="website"
                    type="url"
                    placeholder="https://votre-site.com"
                    class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone de contact
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    id="phone"
                    v-model="phone"
                    type="tel"
                    placeholder="+229 XX XX XX XX"
                    class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Notice -->
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <div class="flex">
                  <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="ml-3 text-sm text-blue-700">
                    Votre compte sera créé avec le statut "En attente de validation". Un administrateur examinera votre demande sous 24-48h.
                  </p>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-600 disabled:hover:to-indigo-600"
              >
                <span v-if="!isSubmitting" class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Créer mon compte organisateur
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </span>
              </button>

              <!-- Terms -->
              <p class="text-xs text-gray-500 text-center">
                En créant un compte organisateur, vous acceptez nos
                <NuxtLink to="/terms" class="text-orange-600 hover:text-orange-700 underline font-medium">
                  conditions d'utilisation
                </NuxtLink>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>

  </div>
</template>
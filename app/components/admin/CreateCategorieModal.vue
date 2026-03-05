<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Ouverture du modal
const isOpen = ref(false)

// Formulaire simplifié
interface Category {
  name: string
}

const form = reactive<Category>({
  name: ''
})

// Validation
const isFormValid = computed(() => {
  return form.name && form.name.trim().length > 0
})

// Compteur
const nameMaxLength = 50

// Soumission
const loading = ref(false)
const error = ref<string | null>(null)

const submit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/categories', {
      method: 'POST',
      body: { name: form.name.trim() }
    })

    if (response) {
      // Reset du formulaire
      form.name = ''
      isOpen.value = false
      
      // Rafraîchir la liste des catégories (émettre un événement ou recharger)
      window.location.reload() // Simple refresh, ou utilise un emit/store
    }
  } catch (err: any) {
    console.error(err)
    error.value = err?.data?.statusMessage || 'Erreur lors de la création'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- BOUTON OUVRIR LE MODAL -->
  <button
    @click="isOpen = true"
    class="ml-auto inline-flex items-center -mt-44 ml-10 gap-2 px-4 py-2 m-3 bg-gradient-to-r from-orange-600 via-indigo-600 to-orange-700 hover:from-orange-700 hover:via-indigo-700 hover:to-orange-800 text-white font-semibold max-w-[300px] rounded-xl shadow-md float-right shadow-orange-500/40 hover:shadow-md hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
  >
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    Nouvelle catégorie
  </button>

  <!-- MODAL OVERLAY -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="isOpen = false"
    >
      <!-- CONTAINER MODAL -->
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          
          <!-- HEADER -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-indigo-600 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Nouvelle catégorie</h3>
                  <p class="text-xs text-gray-500">Organisez vos contenus</p>
                </div>
              </div>
              
              <button
                @click="isOpen = false"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- BODY -->
          <div class="p-6 space-y-4">
            
            <!-- Message d'erreur -->
            <div v-if="error" class="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>

            <!-- NOM -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-semibold text-gray-700">
                  Nom de la catégorie <span class="text-red-500">*</span>
                </label>
                <span class="text-xs text-gray-400">{{ form.name.length }}/{{ nameMaxLength }}</span>
              </div>
              <input
                type="text"
                v-model="form.name"
                :maxlength="nameMaxLength"
                placeholder="Ex: Technologie, Sport, Culture..."
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                @keyup.enter="submit"
                autofocus
              />
              <p class="text-xs text-gray-500">Le nom doit être unique et descriptif</p>
            </div>

            
          </div>

          <!-- FOOTER -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
            <button 
              @click="isOpen = false" 
              class="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-all"
              :disabled="loading"
            >
              Annuler
            </button>
            <button 
              @click="submit" 
              :disabled="!isFormValid || loading" 
              class="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="!loading" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Création...' : 'Créer la catégorie' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
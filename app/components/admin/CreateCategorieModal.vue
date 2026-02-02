<script setup lang="ts">

import { ref, reactive, computed } from 'vue'

// Ouverture du modal
const isOpen = ref(false)

// Formulaire réactif
interface Category {
  name: string
  slug: string
  description: string
  icon: string
  color: string
  parentCategory?: string
}

const form = reactive<Category>({
  name: '',
  slug: '',
  description: '',
  icon: '',
  color: '#9333EA', // Purple par défaut
  parentCategory: ''
})

// Liste des icônes disponibles
const availableIcons = [
  { value: 'i-heroicons-home', label: 'Maison', preview: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { value: 'i-heroicons-sparkles', label: 'Luxe', preview: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { value: 'i-heroicons-building-office', label: 'Architecture', preview: 'M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7m-18 0V5a3 3 0 013-3h12a3 3 0 013 3v2M3 7h18M13 11h.01M9 11h.01M13 15h.01M9 15h.01M13 19h.01M9 19h.01' },
  { value: 'i-heroicons-light-bulb', label: 'Inspiration', preview: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { value: 'i-heroicons-paint-brush', label: 'Décoration', preview: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
  { value: 'i-heroicons-scissors', label: 'Rénovation', preview: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { value: 'i-heroicons-photo', label: 'Galerie', preview: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { value: 'i-heroicons-heart', label: 'Lifestyle', preview: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
]

// Couleurs prédéfinies
const availableColors = [
  { value: '#9333EA', label: 'Purple' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#EF4444', label: 'Red' },
  { value: '#6B7280', label: 'Gray' }
]
const parentCategories = ref<{ value: string | number; label: string }[]>([])

// Catégories parentes (simulation)
onMounted(async () => {
  const categories = await $fetch('/api/categories')
  parentCategories.value = categories.map((c: any) => ({
    value: c.id,    // ou c.slug si tu préfères utiliser le slug
    label: c.name
  }))
})




// Auto-génération du slug à partir du nom
const generateSlug = () => {
  form.slug = form.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Validation
const isFormValid = computed(() => {
  return form.name && form.slug && form.description && form.icon && form.color
})

// Compteurs
const nameMaxLength = 50
const descriptionMaxLength = 200

// Soumission
const loading = ref(false)
const error = ref<string | null>(null)

const submit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = null;

  try {
    // Convertir parentCategory en categoryId avant envoi
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      icon: form.icon,
      color: form.color,
      categoryId: form.parentCategory || null // Met null si vide
    };

    const response = await $fetch('/api/subCategory', {
      method: 'POST',
      body: payload
    });

    if (response) {
      Object.assign(form, {
        name: '',
        slug: '',
        description: '',
        icon: '',
        color: '#9333EA',
        parentCategory: ''
      });
      isOpen.value = false;
    }
  } catch (err: any) {
    console.error(err);
    error.value = err?.message || 'Erreur lors de la création';
  } finally {
    loading.value = false;
  }
};



  // Reset
  Object.assign(form, {
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#9333EA',
    parentCategory: ''
  })

  isOpen.value = false

</script>

<template>
  <!-- BOUTON OUVRIR LE MODAL -->
  <button
    @click="isOpen = true"
    class="ml-auto inline-flex items-center gap-2 px-4 py-2 m-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 text-white font-semibold max-w-[220px] rounded-xl shadow-md float-right shadow-purple-500/40 hover:shadow-md hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
  >
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
    Nouvelle catégorie
  </button>

  <!-- MODAL OVERLAY -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="isOpen = false"
  >
    <!-- CONTAINER MODAL -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/60 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
      
      <!-- HEADER -->
      <div class="px-6 py-5 border-b border-gray-200/60 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 via-purple-50/30 to-indigo-50/50 dark:from-gray-900/50 dark:via-purple-950/20 dark:to-indigo-950/20 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Créer une catégorie</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Organisez vos articles par thématique</p>
            </div>
          </div>
          
          <button
            @click="isOpen = false"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- BODY SCROLLABLE -->
      <div class="p-6 space-y-6 overflow-y-auto flex-1">
        
        <!-- NOM -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nom de la catégorie <span class="text-red-500">*</span>
            </label>
            <span class="text-xs text-gray-400">{{ form.name.length }}/{{ nameMaxLength }}</span>
          </div>
          <input
            type="text"
            v-model="form.name"
            @input="generateSlug"
            :maxlength="nameMaxLength"
            placeholder="Ex: Architecture moderne, Décoration intérieure..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-indigo-500 transition-all"
          />
        </div>

        <!-- SLUG -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Slug (URL) <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">/categories/</span>
            <input
              type="text"
              v-model="form.slug"
              placeholder="architecture-moderne"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-indigo-500 transition-all"
            />
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Le slug est généré automatiquement depuis le nom</p>
        </div>

        <!-- DESCRIPTION -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description <span class="text-red-500">*</span>
            </label>
            <span class="text-xs text-gray-400">{{ form.description.length }}/{{ descriptionMaxLength }}</span>
          </div>
          <textarea
            v-model="form.description"
            :maxlength="descriptionMaxLength"
            placeholder="Décrivez cette catégorie et son contenu..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-indigo-500 transition-all resize-none"
            rows="3"
          ></textarea>
        </div>

        <!-- ICÔNE -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Icône <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-4 md:grid-cols-4 gap-3">
            <button
              v-for="icon in availableIcons"
              :key="icon.value"
              @click="form.icon = icon.value"
              :class="[
                'group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                form.icon === icon.value
                  ? 'border-purple-600 dark:border-indigo-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-900'
              ]"
              :title="icon.label"
            >
              <svg 
                class="w-6 h-6 transition-colors" 
                :class="form.icon === icon.value ? 'text-purple-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-purple-500 dark:group-hover:text-indigo-400'" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon.preview" />
              </svg>
              <span :class="['text-xs font-medium', form.icon === icon.value ? 'text-purple-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400']">
                {{ icon.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- COULEUR -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Couleur <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-4 md:grid-cols-8 gap-3">
            <button
              v-for="color in availableColors"
              :key="color.value"
              @click="form.color = color.value"
              :class="[
                'group relative w-full aspect-square rounded-xl transition-all duration-200 border-2',
                form.color === color.value
                  ? 'border-gray-900 dark:border-white scale-110 shadow-lg'
                  : 'border-transparent hover:scale-105'
              ]"
              :style="{ backgroundColor: color.value }"
              :title="color.label"
            >
              <svg 
                v-if="form.color === color.value"
                class="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- CATÉGORIE PARENTE -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Catégorie parente (optionnel)
          </label>
          <select
            v-model="form.parentCategory"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-indigo-500 transition-all"
          >
            <option v-for="parent in parentCategories" :key="parent.value" :value="parent.value">
              {{ parent.label }}
            </option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400">Créez une hiérarchie en assignant une catégorie parente</p>
        </div>

        <!-- PREVIEW -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/50 dark:border-indigo-800/50">
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Aperçu de la catégorie :</p>
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2" :style="{ borderColor: form.color, backgroundColor: form.color + '10' }">
            <svg v-if="form.icon" class="w-5 h-5" :style="{ color: form.color }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="availableIcons.find(i => i.value === form.icon)?.preview || ''" />
            </svg>
            <span class="font-semibold" :style="{ color: form.color }">
              {{ form.name || 'Nom de la catégorie' }}
            </span>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="px-6 py-4 border-t border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl flex items-center justify-between">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          <span class="text-red-500">*</span> Champs obligatoires
        </p>
        
        <div class="flex gap-3">
          <button 
            @click="isOpen = false" 
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-all"
          >
            Annuler
          </button>
          <button 
            @click="submit" 
            :disabled="!isFormValid" 
            :class="['inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:via-indigo-600 disabled:hover:to-purple-700']"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Créer la catégorie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
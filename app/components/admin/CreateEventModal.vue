<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// Utilisateur connecté
const currentUser = 'Zaki AGOKOLI'

// Ouverture du modal
const isOpen = ref(false)

interface Category {
  id: string
  name: string
  icon: string
}

interface Ville {
  id: string
  name: string
}

const categories = ref<Category[]>([])
const villes = ref<Ville[]>([])

// Formulaire réactif
interface EventForm {
  title: string
  description: string
  location: string
  details: string
  eventDate: string
  startDate: string
  endDate: string
  villeId: string
  categoryId: string
  images: File[]
  priceType: 'FREE' | 'PAID'
  price: string
  status: 'DRAFT' | 'PUBLISHED'
}

const form = reactive<EventForm>({
  title: '',
  description: '',
  location: '',
  details: '',
  eventDate: '',
  startDate: '',
  endDate: '',
  villeId: '',
  categoryId: '',
  images: [],
  priceType: 'FREE', // 👈 par défaut gratuit
  price: '',
  status: 'DRAFT',
})

// Chargement des catégories
const loadingCategories = ref(true)
onMounted(async () => {
  try {
    const res = await fetch('/api/categories')
    if (!res.ok) throw new Error('Erreur API catégories')
    const data = await res.json()
    categories.value = data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || 'i-heroicons-tag',
    }))
  } catch (err) {
    console.error(err)
    categories.value = []
  } finally {
    loadingCategories.value = false
  }

  // Chargement des villes
  try {
    const res = await fetch('/api/villes')
    if (!res.ok) throw new Error('Erreur API villes')
    const data = await res.json()
    villes.value = data.map((ville: any) => ({
      id: ville.id,
      name: ville.nomVille,
    }))
        console.log('VILLES', data)

  } catch (err) {
    console.error(err)
    villes.value = []
  }
})

// Gestion de l'image
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const newFiles = Array.from(target.files)
  // Ajouter aux anciennes images et limiter à 3
  form.images = [...form.images, ...newFiles].slice(0, 3)
}

// Supprimer une image spécifique
const removeImageAt = (index: number) => {
  form.images.splice(index, 1)
}

// Validation
const isFormValid = computed(() => {
  return (
    form.title &&
    form.description &&
    form.location &&
    form.details &&
    form.eventDate &&
    form.startDate &&
    form.villeId &&
    form.images.length > 0 &&
    form.categoryId &&
    (form.priceType === 'FREE' || (form.priceType === 'PAID' && form.price))
  )
})

// Compteurs
const titleMaxLength = 100
const descriptionMaxLength = 250

const draftId = ref<string | null>(null)

// Soumission
const isPublishing = ref(false)
const isSavingDraft = ref(false)
const submit = async (status: 'DRAFT' | 'PUBLISHED') => {
  if (!isFormValid.value && status === 'PUBLISHED') return

  if (status === 'PUBLISHED') {
    isPublishing.value = true
  } else {
    isSavingDraft.value = true
  }

  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('description', form.description)
  formData.append('location', form.location)
  formData.append('details', form.details)
  formData.append('eventDate', form.eventDate)
  formData.append('startDate', form.startDate)
  formData.append('endDate', form.endDate || '')
  formData.append('villeId', form.villeId)
  formData.append('categoryId', form.categoryId)
  formData.append('priceType', form.priceType)
  formData.append('status', status)

  if (form.priceType === 'PAID') {
    formData.append('price', form.price)
  }

  form.images.forEach((file) => {
    formData.append('images', file)
  })

  try {
    let response: Response

    if (draftId.value && status === 'DRAFT') {
      // Mettre à jour le brouillon existant
      response = await fetch(`/api/events/${draftId.value}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      })
    } else {
      // Créer un nouvel événement
      response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
    }

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.statusMessage || "Erreur lors de la création de l'événement")
    }

    const data = await response.json()
    console.log('Événement créé ✅', data)

    // Si c'est un brouillon, on garde l'ID pour les prochaines sauvegardes
    if (status === 'DRAFT') {
      draftId.value = data.event.id
    }

    if (status === 'DRAFT') {
      draftId.value = data.event.id
    }

    // Si publication → reset complet
    if (status === 'PUBLISHED') {
      Object.assign(form, {
        title: '',
        description: '',
        location: '',
        eventDate: '',
        startDate: '',
        endDate: '',
        villeId: '',
        categoryId: '',
        images: [],
        priceType: 'FREE',
        price: '',
      })

      draftId.value = null
    }

    // ✅ Fermer modal seulement si succès
    isOpen.value = false

    alert(status === 'PUBLISHED' ? 'Événement publié avec succès !' : 'Brouillon enregistré !')
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
    } else {
      alert('Une erreur est survenue')
    }
  } finally {
    isPublishing.value = false
    isSavingDraft.value = false
  }
}

// Format de la date pour l'aperçu
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    location: '',
    eventDate: '',
    startDate: '',
    endDate: '',
    villeId: '',
    categoryId: '',
    images: [],
    priceType: 'FREE',
    price: '',
  })

  draftId.value = null
}
</script>

<template>
  <!-- BOUTON OUVRIR LE MODAL -->
  <<button
    @click="
      () => {
        resetForm()
        isOpen = true
      }
    "
    size="lg"
    class="ml-auto inline-flex items-center -mt-46 gap-2 px-4 py-2 m-3 bg-gradient-to-r from-orange-600 via-indigo-600 to-orange-700 hover:from-orange-700 hover:via-indigo-700 hover:to-orange-800 text-white font-semibold max-w-[300px] rounded-xl shadow-md float-right shadow-orange-500/40 hover:shadow-md hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
  >
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    Créer votre événement
  </button>

  <!-- MODAL OVERLAY -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="isOpen = false"
  >
    <!-- CONTAINER MODAL -->
    <div
      class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/60 dark:border-gray-800 animate-in fade-in zoom-in duration-300"
    >
      <!-- HEADER -->
      <div
        class="px-6 py-5 border-b border-gray-200/60 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 via-orange-50/30 to-indigo-50/50 dark:from-gray-900/50 dark:via-orange-950/20 dark:to-indigo-950/20 rounded-t-2xl"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 via-indigo-600 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Créer un événement</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Partagez votre événement avec votre communauté
              </p>
            </div>
          </div>

          <button
            @click="isOpen = false"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- BODY SCROLLABLE -->
      <div class="p-6 space-y-6 overflow-y-auto flex-1">
        <!-- TITRE -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Titre de l'événement <span class="text-red-500">*</span>
            </label>
            <span class="text-xs text-gray-400">{{ form.title.length }}/{{ titleMaxLength }}</span>
          </div>
          <input
            type="text"
            v-model="form.title"
            :maxlength="titleMaxLength"
            placeholder="Ex: Concert Jazz au clair de lune"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-indigo-500 transition-all"
          />
        </div>

        <!-- DESCRIPTION -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description <span class="text-red-500">*</span>
            </label>
            <span class="text-xs text-gray-400"
              >{{ form.description.length }}/{{ descriptionMaxLength }}</span
            >
          </div>
          <textarea
            v-model="form.description"
            :maxlength="descriptionMaxLength"
            placeholder="Décrivez votre événement en quelques mots..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-indigo-500 transition-all resize-none"
            rows="3"
          ></textarea>
        </div>

        <!-- DETAILS -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Détails sur l'événement<span class="text-red-500">*</span>
            </label>
            <p class="text-xs text-gray-400 mt-1">{{ form.details?.length || 0 }}/500</p>
          </div>
          <textarea
            v-model="form.details"
            placeholder="Ajoutez des informations supplémentaires sur l'événement..."
            rows="3"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-indigo-500 transition-all resize-none"
          ></textarea>
        </div>

        <!-- TYPE DE PRIX -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Type de prix
          </label>

          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="FREE" v-model="form.priceType" class="accent-orange-600" />
              <span>Gratuit</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="PAID" v-model="form.priceType" class="accent-orange-600" />
              <span>Payant</span>
            </label>
          </div>
        </div>

        <!-- PRIX -->
        <div v-if="form.priceType === 'PAID'" class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Prix (FCFA) <span class="text-red-500">*</span>
          </label>

          <input
            type="number"
            min="0"
            step="500"
            v-model="form.price"
            placeholder="Ex: 20"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>

        <!-- GRID: LIEU & VILLE -->
        <div class="grid md:grid-cols-2 gap-4">
          <!-- LIEU -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Lieu <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="form.location"
              placeholder="Ex: Salle Pleyel"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-indigo-500 transition-all"
            />
          </div>

          <!-- VILLE -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ville <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.villeId"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-indigo-500 transition-all"
            >
              <option value="" disabled>Sélectionnez une ville</option>
              <option v-for="ville in villes" :key="ville.id" :value="ville.id">
                {{ ville.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- GRID: DATE & HORAIRES -->
        <div class="grid md:grid-cols-3 gap-4">
          <!-- DATE -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Date <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              v-model="form.eventDate"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-indigo-500 transition-all"
            />
          </div>

          <!-- HEURE DÉBUT -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Heure début <span class="text-red-500">*</span>
            </label>
            <input
              type="time"
              v-model="form.startDate"
              placeholder="Ex: 20:00"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-indigo-500 transition-all"
            />
          </div>

          <!-- HEURE FIN -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Heure fin
            </label>
            <input
              type="time"
              v-model="form.endDate"
              placeholder="Ex: 23:00"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <!-- CATÉGORIE -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Catégorie <span class="text-red-500">*</span>
          </label>

          <select
            v-model="form.categoryId"
            class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option disabled value="">Sélectionnez une catégorie</option>

            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>

          <p v-if="form.categoryId" class="text-xs text-orange-600 dark:text-indigo-400 mt-1">
            Catégorie sélectionnée
          </p>
        </div>

        <!-- Aperçu des images -->
        <div v-if="form.images.length > 0" class="grid grid-cols-3 gap-4 mb-4 w-full">
          <div
            v-for="(img, index) in form.images"
            :key="index"
            class="relative border rounded-xl p-3 bg-orange-50/30 dark:bg-indigo-950/20"
          >
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {{ img.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ (img.size / 1024 / 1024).toFixed(2) }} MB
            </p>

            <button
              type="button"
              class="absolute top-1 right-1 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
              @click="removeImageAt(index)"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Zone d'upload -->
        <label v-if="form.images.length < 3" class="group cursor-pointer block">
          <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-orange-400 dark:hover:border-indigo-600 hover:bg-orange-50/30 dark:hover:bg-indigo-950/20 transition-all duration-200"
          >
            <svg
              class="w-10 h-10 mx-auto text-gray-400 group-hover:text-orange-500 dark:group-hover:text-indigo-400 transition-colors mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p
              class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-indigo-400"
            >
              Cliquez pour télécharger jusqu'à 3 images
            </p>
            <p class="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</p>
          </div>
          <input type="file" accept="image/*" multiple class="hidden" @change="handleImageUpload" />
        </label>

        <!-- APERÇU DATE -->
        <div
          v-if="form.eventDate"
          class="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-50/50 to-indigo-50/50 dark:from-orange-950/20 dark:to-indigo-950/20 border border-orange-200/50 dark:border-indigo-800/50"
        >
          <svg
            class="w-5 h-5 text-orange-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Votre événement aura lieu le
              <span class="font-bold text-orange-600 dark:text-indigo-400">{{
                formatDate(form.eventDate)
              }}</span>
            </p>
            <p v-if="form.startDate" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              De {{ form.startDate }}<span v-if="form.endDate"> à {{ form.endDate }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div
        class="px-6 py-4 border-t border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl flex items-center justify-between"
      >
        <p class="text-xs text-gray-500 dark:text-gray-400">
          <span class="text-red-500">*</span> Champs obligatoires
        </p>

        <div class="flex gap-3">
          <button
            @click="isOpen = false"
            type="button"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-all"
          >
            Annuler
          </button>
          <button
            :disabled="isSavingDraft"
            @click="submit('DRAFT')"
            type="button"
            class="px-4 py-2 bg-gray-200 rounded-lg inline-flex items-center gap-2"
          >
            <!-- Spinner pendant sauvegarde -->
            <svg v-if="isSavingDraft" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>

            <!-- Icône normale -->
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>

            Enregistrer brouillon
          </button>

          <button
            @click="submit('PUBLISHED')"
            type="button"
            :disabled="!isFormValid || isPublishing"
            :class="[
              'inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-600 via-indigo-600 to-orange-700 hover:from-orange-700 hover:via-indigo-700 hover:to-orange-800 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/30 transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-600 disabled:hover:via-indigo-600 disabled:hover:to-orange-700',
            ]"
          >
            <svg
              v-if="isPublishing"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg v-if="isPublishing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ isPublishing ? 'Publication...' : "Créer l'événement" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

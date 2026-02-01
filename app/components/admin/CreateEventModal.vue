<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { watch } from 'vue'


// Simule la récupération de l'utilisateur connecté
const currentUser = 'Zaki AGOKOLI'

// Ouverture du modal
const isOpen = ref(false)

interface Category {
  id: number
  value: string
  label: string
  icon: string
}
const categories = ref<Category[]>([])


// Formulaire réactif
interface Post {
  category: string
  sub_category_id: number | null
  title: string
  content: string
  description: string
  images: File[]
  author?: string
}

const form = reactive<Post>({
  category: '',
 sub_category_id: null,
   title: '',
  content: '',
  description: '',
  images: [],
  author: ''
})

// Liste des catégories avec icônes
const loadingCategories = ref(true)
onMounted(async () => {
  try {
    const res = await fetch('/api/subCategory')
    if (!res.ok) throw new Error('Erreur API catégories')
    const data = await res.json()
    // Exemple : data = [{ id: 1, name: "Tech", icon: "i-heroicons-cpu-chip" }, ...]
   categories.value = data.map(cat => ({
  id: cat.id,       // <- Ajout de l'id
  value: cat.name,
  label: cat.name,
  icon: cat.icon || 'i-heroicons-collection'
}))

  } catch (err) {
    console.error(err)
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
})


// Gestion des fichiers upload
const handleFiles = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return
  form.images = Array.from(target.files)
}

// Supprimer une image
const removeImage = (index: number) => {
  form.images.splice(index, 1)
}

// Validation
const isFormValid = computed(() => {
  return form.category && form.title && form.content && form.description
})

// Compteurs
const generateUniqueSlug = async (title: string) => {
  let slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const randomSuffix = () => '-' + Math.floor(Math.random() * 10000)
  // Tu peux ici faire un appel API pour vérifier si le slug existe et le regénérer
  slug += randomSuffix()
  return slug
}

const props = defineProps<{
  postToEdit?: {
    id: number
    category: string
    title: string
    content: string
    description: string
    images?: string[] // URL des images existantes
    author?: string
  }
}>()


watch(() => props.postToEdit, (newPost) => {
  if (newPost) {
    form.category = newPost.category
    form.title = newPost.title
    form.description = newPost.description
    form.content = newPost.content
    form.author = newPost.author || ''
    // Pour les images existantes, tu peux créer un tableau supplémentaire
    // exemple : form.existingImages = newPost.images || []
  } else {
    Object.assign(form, { category: '', title: '', description: '', content: '', images: [], author: '' })
  }
}, { immediate: true })




// Soumission
const submit = async () => {
  if (!isFormValid.value) return

  if (!form.images[0]) {
    alert('Veuillez sélectionner une image principale pour l’article')
    return
  }

  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('content', form.content)
  formData.append('description', form.description)
  formData.append('author', form.author || '')
  formData.append('slug', await generateUniqueSlug(form.title)) // ✅ await ici
  formData.append('image', form.images[0])
  formData.append('sub_category_id', String(form.sub_category_id))


formData.append(
  'sub_category_id',
  String(form.sub_category_id)
)

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Erreur lors de la création de l’article')
    }

    const data = await response.json()
    console.log('Article créé ✅', data)

    // Reset formulaire
    Object.assign(form, {
      category: '',
      title: '',
      content: '',
      description: '',
      images: [],
      author: ''
    })

    // ✅ fermer le modal uniquement ici si tout s'est bien passé
    isOpen.value = false
  } catch (err: any) {
    console.error(err)
    alert(err.message)
  }
}
const titleMaxLength = 100
const descriptionMaxLength = 250


</script>

<template>
  <!-- BOUTON OUVRIR LE MODAL -->
  <button
    @click="isOpen = true"
    size="lg"
    class="ml-auto inline-flex items-center gap-2 px-4 py-2 m-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 text-white font-semibold max-w-[300px] rounded-xl shadow-md float-right shadow-purple-500/40 hover:shadow-md hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
  >
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    Créer votre evenement
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Créer un article</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Partagez votre contenu avec votre audience</p>
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
        
        <!-- CATÉGORIE -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Catégorie <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
               v-for="cat in categories"
                :key="cat.value"
              
                @click="form.sub_category_id = cat.id; form.category = cat.value"
              :class="[
                'group relative flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
                form.category === cat.value
                  ? 'border-purple-600 dark:border-indigo-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-900'
              ]"
            >
              <svg class="w-5 h-5 transition-colors" :class="form.category === cat.value ? 'text-purple-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-purple-500 dark:group-hover:text-indigo-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="cat.value === 'Tech'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                <path v-else-if="cat.value === 'Lifestyle'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                <path v-else-if="cat.value === 'Voyage'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path v-else-if="cat.value === 'Sport'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span :class="['text-sm font-medium', form.category === cat.value ? 'text-purple-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300']">
                {{ cat.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- TITRE -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Titre <span class="text-red-500">*</span>
            </label>
            <span class="text-xs text-gray-400">{{ form.title.length }}/{{ titleMaxLength }}</span>
          </div>
          <input
            type="text"
            v-model="form.title"
            :maxlength="titleMaxLength"
            placeholder="Donnez un titre accrocheur à votre article..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-indigo-500 transition-all"
          />
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
            placeholder="Résumez votre article en quelques mots..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-indigo-500 transition-all resize-none"
            rows="2"
          ></textarea>
        </div>

        <!-- CONTENU -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Contenu <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.content"
            placeholder="Rédigez le contenu complet de votre article..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-indigo-500 transition-all resize-none"
            rows="6"
          ></textarea>
        </div>

        <!-- UPLOAD IMAGES -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Images (optionnel)</label>
          
          <label class="group cursor-pointer block">
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-purple-400 dark:hover:border-indigo-600 hover:bg-purple-50/30 dark:hover:bg-indigo-950/20 transition-all duration-200">
              <svg class="w-10 h-10 mx-auto text-gray-400 group-hover:text-purple-500 dark:group-hover:text-indigo-400 transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-indigo-400">Cliquez pour télécharger des images</p>
              <p class="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</p>
            </div>
            <input type="file" multiple accept="image/*" @change="handleFiles" class="hidden" />
          </label>

          <div v-if="form.images.length > 0" class="grid grid-cols-2 gap-3 mt-3">
            <div v-for="(file, index) in form.images" :key="index" class="group relative flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <svg class="w-5 h-5 text-purple-500 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{{ file.name }}</span>
              <button @click="removeImage(index)" class="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- AUTEUR -->
        <div class="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/50 dark:border-indigo-800/50">
          <input type="checkbox" v-model="form.author" true-value="self" id="author-checkbox" class="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 cursor-pointer" />
          <label for="author-checkbox" class="flex-1 cursor-pointer">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Définir l'auteur comme <span class="font-bold text-purple-600 dark:text-indigo-400">{{ currentUser }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Votre nom apparaîtra sur cet article</p>
          </label>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="px-6 py-4 border-t border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl flex items-center justify-between">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          <span class="text-red-500">*</span> Champs obligatoires
        </p>
        
        <div class="flex gap-3">
          <button @click="isOpen = false" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-all">
            Annuler
          </button>
          <button @click="submit" :disabled="!isFormValid" :class="['inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:via-indigo-600 disabled:hover:to-purple-700']">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Créer l'article
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<template>
  <form 
    action="/fr/search" 
    method="get" 
    class="relative w-full max-w-2xl mx-auto"
    @submit.prevent="handleSubmit"
  >
    <!-- Conteneur de recherche -->
    <div class="relative group">
      <!-- Icône de recherche à gauche -->
      <div 
        class="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Input principal -->
      <input
        ref="searchInput"
        type="text"
        name="q"
        :placeholder="isMobile ? 'Rechercher...' : 'Rechercher un événement, un lieu, une catégorie...'"
        v-model="query"
        class="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-xl sm:rounded-full shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-md hover:border-gray-300 h-11"
        @input="onInput"
        @focus="handleFocus"
        @keydown.esc="closeSuggestions"
        @keydown.down.prevent="navigateSuggestions(1)"
        @keydown.up.prevent="navigateSuggestions(-1)"
        @keydown.enter.prevent="selectCurrentSuggestion"
        autocomplete="off"
      />

      <!-- Bouton effacer -->
      <button
        v-if="query"
        type="button"
        @click="clearSearch"
        class="absolute right-12 sm:right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
        aria-label="Effacer la recherche"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Bouton de soumission -->
     
    </div>

    <!-- Dropdown des suggestions -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showSuggestions && filteredSuggestions.length"
        :class="[
          'absolute w-full mt-2 bg-white border border-gray-200 shadow-xl z-50 overflow-hidden',
          'rounded-xl sm:rounded-2xl',
          // Sur mobile, ajuster si trop près du bord
          'left-0 right-0'
        ]"
      >
        <!-- En-tête des suggestions -->
        <div class="px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-100">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Suggestions
          </span>
        </div>

        <!-- Liste des suggestions -->
        <ul class="max-h-60 sm:max-h-64 overflow-y-auto">
          <li
            v-for="(item, index) in filteredSuggestions"
            :key="item"
            :class="[
              'px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-3 cursor-pointer transition-colors touch-manipulation',
              selectedIndex === index 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'hover:bg-gray-50 active:bg-gray-100 text-gray-700'
            ]"
            @click="selectSuggestion(item)"
            @mouseenter="selectedIndex = index"
          >
            <!-- Icône -->
            <svg class="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            <!-- Texte de la suggestion avec highlight -->
            <span class="flex-1 text-sm sm:text-base">
              <span v-html="highlightMatch(item)"></span>
            </span>

            <!-- Icône flèche -->
            <svg 
              v-if="selectedIndex === index"
              class="w-4 h-4 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </li>
        </ul>

        <!-- Footer mobile avec action rapide -->
        <div class="sm:hidden border-t border-gray-100 px-3 py-2 bg-gray-50">
          <button
            @click="handleSubmit"
            class="w-full text-center text-sm text-purple-600 font-medium py-2"
          >
            Voir tous les résultats pour "{{ query }}"
          </button>
        </div>
      </div>
    </Transition>

    <!-- Overlay pour fermer les suggestions (mobile) -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showSuggestions && filteredSuggestions.length"
        class="fixed inset-0 bg-black/20 z-40 lg:hidden"
        @click="closeSuggestions"
      />
    </Transition>
  </form>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const query = ref('')
const showSuggestions = ref(false)
const selectedIndex = ref(-1)
const searchInput = ref(null)
const isMobile = ref(false)

// Détection mobile
const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 640
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkMobile)
  }
})

// Liste de suggestions enrichie
const suggestions = [
  'Concerts et musique',
  'Théâtre et spectacles',
  'Expositions et musées',
  'Conférences et formations',
  'Sport et fitness',
  'Festivals',
  'Événements gastronomiques',
  'Sorties en famille'
]

// Filtrer les suggestions
const filteredSuggestions = computed(() => {
  if (!query.value || query.value.length < 2) return []
  return suggestions.filter((item) => 
    item.toLowerCase().includes(query.value.toLowerCase())
  ).slice(0, isMobile.value ? 5 : 6) // Moins de résultats sur mobile
})

// Highlight du texte correspondant
const highlightMatch = (text) => {
  if (!query.value) return text
  const regex = new RegExp(`(${query.value})`, 'gi')
  return text.replace(regex, '<strong class="font-semibold">$1</strong>')
}

const onInput = () => {
  selectedIndex.value = -1
  showSuggestions.value = true
  // Appel API optionnel ici
}

const handleFocus = () => {
  showSuggestions.value = true
  
  // Sur mobile, scroll jusqu'à l'input
  if (isMobile.value && searchInput.value) {
    setTimeout(() => {
      searchInput.value?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }, 300)
  }
}

const selectSuggestion = (item) => {
  query.value = item
  closeSuggestions()
  handleSubmit()
}

const clearSearch = () => {
  query.value = ''
  selectedIndex.value = -1
  searchInput.value?.focus()
}

const closeSuggestions = () => {
  showSuggestions.value = false
  selectedIndex.value = -1
}

const navigateSuggestions = (direction) => {
  if (!filteredSuggestions.value.length) return
  
  const maxIndex = filteredSuggestions.value.length - 1
  selectedIndex.value = Math.max(
    -1,
    Math.min(maxIndex, selectedIndex.value + direction)
  )
}

const selectCurrentSuggestion = () => {
  if (selectedIndex.value >= 0 && filteredSuggestions.value[selectedIndex.value]) {
    selectSuggestion(filteredSuggestions.value[selectedIndex.value])
  } else if (query.value.trim()) {
    handleSubmit()
  }
}

const handleSubmit = () => {
  if (!query.value.trim()) return
  
  closeSuggestions()
  // Navigation ou soumission du formulaire
  window.location.href = `/fr/search?q=${encodeURIComponent(query.value)}`
}

// Fermer les suggestions quand on clique ailleurs
if (process.client) {
  const handleClickOutside = (e) => {
    if (!e.target.closest('form')) {
      closeSuggestions()
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
}
</script>

<style scoped>
/* Amélioration du touch sur mobile */
@media (max-width: 640px) {
  input {
    font-size: 16px !important; /* Empêche le zoom sur iOS */
  }
}

/* Scroll smooth pour les suggestions */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Webkit scrollbar personnalisé */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation du bouton de recherche */
button[type="submit"]:active {
  transform: translate(-50%, -50%) scale(0.95);
}

/* Touch feedback amélioré */
.touch-manipulation {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
</style>
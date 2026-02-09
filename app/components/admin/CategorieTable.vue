<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Category {
  id: number
  name: string
}

const categories = ref<Category[]>([])
const loading = ref(true)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedCategory = ref<Category | null>(null)
const newCategoryName = ref('')

const fetchCategories = async () => {
  loading.value = true
  try {
    const data = await $fetch<Category[]>('/api/categories')
    categories.value = data
  } catch (err) {
    console.error('Erreur API:', err)
  } finally {
    loading.value = false
  }
}

const updateCategory = async () => {
  if (!selectedCategory.value) return

  try {
    await $fetch(`/api/categories/${selectedCategory.value.id}`, {
      method: 'patch',
      body: { name: selectedCategory.value.name },
    })

    isEditModalOpen.value = false
    await fetchCategories()
    alert('Modifié ✅')
  } catch (err) {
    alert('Erreur')
  }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Supprimer cette catégorie ?')) return

  try {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    categories.value = categories.value.filter((c) => c.id !== id)
  } catch (err) {
    alert('Erreur')
  }
}

const openEditModal = (category: Category) => {
  selectedCategory.value = { ...category }
  isEditModalOpen.value = true
}

onMounted(fetchCategories)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 -mt-2">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="border-b border-gray-200 pb-3">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Catégories</h1>
            <p class="text-gray-600 mt-1">{{ categories.length }} catégorie(s)</p>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="space-y-2 max-h-[280px] overflow-y-auto">
        <div
          v-if="!loading"
          v-for="category in categories"
          :key="category.id"
          class="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-tag" class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                <p class="text-sm text-gray-500">ID: {{ category.id }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="openEditModal(category)"
                class="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-all"
              >
                <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
              </button>
              <button
                @click="deleteCategory(category.id)"
                class="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-all"
              >
                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-else v-for="i in 5" :key="i" class="border border-gray-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <USkeleton class="h-10 w-10 rounded-lg" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-1/3" />
              <USkeleton class="h-3 w-1/4" />
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-if="!loading && categories.length === 0"
          class="text-center py-16 border border-gray-200 rounded-xl"
        >
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-600">Aucune catégorie</p>
        </div>
      </div>
    </div>

    <!-- Modals (identiques à Variante 1) -->

    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isEditModalOpen && selectedCategory"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="isEditModalOpen = false"
      >
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 sticky top-0 z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-pencil-square" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Modifier la catégorie</h3>
                  <p class="text-sm text-purple-100">Mettez à jour les informations</p>
                </div>
              </div>
              <button
                @click="isEditModalOpen = false"
                class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all"
              >
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="p-6">
            <label class="block text-sm font-semibold mb-2"
              >Nom <span class="text-red-500">*</span></label
            >
            <input
              v-model="selectedCategory.name"
              type="text"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              @keyup.enter="updateCategory"
            />
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              @click="isEditModalOpen = false"
              class="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-all"
            >
              Annuler
            </button>
            <button
              @click="updateCategory"
              class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
             <UIcon name="i-heroicons-check" class="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

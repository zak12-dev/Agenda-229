<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Organizer {
  organizerId: number
  name: string
  image: string | null
  description: string | null
  count: number
  period: {
    start: string
    end: string
  }
}

const organizers = ref<Organizer[]>([])
const loading = ref(true)
const sortBy = ref<'name' | 'count'>('count')
const searchQuery = ref('')

const fetchOrganizers = async () => {
  loading.value = true
  try {
    const data = await $fetch<Organizer[]>('/api/events/count')
    organizers.value = data
  } catch (err) {
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

const filteredOrganizers = computed(() => {
  let result = [...organizers.value]

  // Filtrer par recherche
  if (searchQuery.value) {
    result = result.filter(
      (org) =>
        org.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Trier
  return result.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    return b.count - a.count
  })
})

onMounted(fetchOrganizers)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 w-auto">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <p class="text-gray-600">Vous aviez {{ organizers.length }} organisateur(s)</p>
      </div>

      <!-- Search & Sort -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <!-- Search Bar -->
        <div class="flex-1 relative">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom ou description..."
            class="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Sort -->
        <div class="flex gap-2 bg-white rounded-xl border-2 border-gray-200 p-1">
          <button
            @click="sortBy = 'count'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              sortBy === 'count' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            Plus actifs
          </button>
          <button
            @click="sortBy = 'name'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              sortBy === 'name' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            Alphabétique
          </button>
        </div>
      </div>

      <!-- Results count -->
      <div v-if="searchQuery" class="mb-4">
        <p class="text-sm text-gray-600">
          <span class="font-semibold text-gray-900">{{ filteredOrganizers.length }}</span>
          résultat{{ filteredOrganizers.length > 1 ? 's' : '' }} trouvé{{
            filteredOrganizers.length > 1 ? 's' : ''
          }}
        </p>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-y-auto w-auto">
        <div class="overflow-y-auto max-h-[500px]">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Organisateur
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Description
                </th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                  Événements
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-if="!loading"
                v-for="(org, index) in filteredOrganizers"
                :key="org.organizerId"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Rang -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                    <span class="text-sm font-bold text-orange-600">{{ index + 1 }}</span>
                  </div>
                </td>

                <!-- Organisateur -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-12 h-12 bg-gradient-to-br from-orange-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    >
                      <template v-if="org.image">
                        <img
                          :src="org.image"
                          :alt="org.name"
                          class="w-full h-full rounded-full object-cover"
                        />
                      </template>
                      <template v-else>
                        {{ org.name.charAt(0).toUpperCase() }}
                      </template>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ org.name }}</p>
                    </div>
                  </div>
                </td>

                <!-- Description -->
                <td class="px-6 py-4 max-w-xs">
                  <p class="text-sm text-gray-600 line-clamp-2">
                    {{ org.description || 'Organisateur professionnel' }}
                  </p>
                </td>

                <!-- Événements -->
                <td class="px-6 py-4 text-center">
                  <span
                    class="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                    {{ org.count }}
                  </span>
                </td>
              </tr>

              <!-- Loading -->
              <tr v-if="loading" v-for="i in 5" :key="i">
                <td class="px-6 py-4"><USkeleton class="h-8 w-8 rounded-full" /></td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <USkeleton class="h-12 w-12 rounded-full" />
                    <div class="space-y-2">
                      <USkeleton class="h-4 w-32" />
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4"><USkeleton class="h-4 w-48" /></td>
                <td class="px-6 py-4 text-center">
                  <USkeleton class="h-6 w-16 mx-auto rounded-full" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && filteredOrganizers.length === 0" class="p-12 text-center">
          <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
          <p class="text-gray-600 mb-4">Aucun organisateur ne correspond à "{{ searchQuery }}"</p>
          <button
            @click="searchQuery = ''"
            class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all"
          >
            Réinitialiser la recherche
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

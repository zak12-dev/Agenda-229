<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Organizer {
  organizerId: number
  name: string
  image: string | null
  description: string | null
  count: number
  period: { start: string; end: string }
}

const organizers = ref<Organizer[]>([])
const loading = ref(true)
const sortBy = ref<'name' | 'count'>('count')
const searchQuery = ref('')

const fetchOrganizers = async () => {
  loading.value = true
  try {
    organizers.value = await $fetch<Organizer[]>('/api/events/count')
    console.log('Organizers fetched:', organizers.value)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const filteredOrganizers = computed(() => {
  let result = [...organizers.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      o => o.name.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)
    )
  }
  return result.sort((a, b) =>
    sortBy.value === 'name' ? a.name.localeCompare(b.name) : b.count - a.count
  )
})

// Couleur d'avatar cyclique par index
const getAvatarColor = (index: number) => {
  const colors = [
    { from: '#ea6c1e', to: '#f59e0b' },
    { from: '#5b47e0', to: '#818cf8' },
    { from: '#059669', to: '#34d399' },
    { from: '#dc2626', to: '#f87171' },
    { from: '#0891b2', to: '#67e8f9' },
    { from: '#7c3aed', to: '#c4b5fd' },
  ]
  return colors[index % colors.length]
}

// Médaille top 3
const getMedal = (index: number) => {
  if (sortBy.value !== 'count') return null
  if (index === 0) return { icon: '🥇', color: 'text-amber-500' }
  if (index === 1) return { icon: '🥈', color: 'text-slate-400' }
  if (index === 2) return { icon: '🥉', color: 'text-orange-600' }
  return null
}

onMounted(fetchOrganizers)
</script>

<template>
  <div class="bg-[#f5f3ef] px-4 pt-4 pb-32 sm:px-6 sm:pb-12 font-outfit w-full min-h-screen overflow-y-auto mb-10">
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- ── KPI + Recherche + Tri ── -->
      <div class="flex items-stretch gap-3">

        <!-- Bloc recherche + tri -->
        <div class="flex-1 bg-white rounded-2xl border border-[#ede8e0] p-4
                    shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">

          <!-- Search -->
          <div class="relative">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad]"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un organisateur…"
              class="w-full pl-10 pr-9 py-2.5 bg-[#faf8f5] border border-[#ede8e0] rounded-xl
                     text-[13.5px] text-[#1a1612] placeholder:text-[#c0b8ad] font-outfit
                     focus:outline-none focus:border-[#ea6c1e] focus:ring-2 focus:ring-[#ea6c1e]/10
                     transition-all"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#8a8078] transition-colors"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Tri -->
          <div class="flex gap-2 flex-wrap">
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide self-center mr-1">Trier :</p>
            <button
              @click="sortBy = 'count'"
              :class="['sort-pill', sortBy === 'count' ? 'sort-pill--active' : '']"
            >
              <UIcon name="i-heroicons-fire" class="w-3.5 h-3.5" />
              Plus actifs
            </button>
            <button
              @click="sortBy = 'name'"
              :class="['sort-pill', sortBy === 'name' ? 'sort-pill--active' : '']"
            >
              <UIcon name="i-heroicons-bars-arrow-down" class="w-3.5 h-3.5" />
              Alphabétique
            </button>
          </div>
        </div>

        <!-- Stat card -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] px-5
                    shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center gap-1 min-w-[80px]">
          <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-1">
            <UIcon name="i-heroicons-users" class="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <p class="text-2xl font-bold text-[#1a1612] tracking-tight leading-none">{{ organizers.length }}</p>
          <p class="text-[10px] font-medium text-[#b0a898] uppercase tracking-wide text-center leading-tight">organisateurs</p>
        </div>
      </div>

      <!-- ── Résultats recherche ── -->
      <p v-if="searchQuery" class="text-[12.5px] text-[#8a8078] px-1">
        <span class="font-semibold text-[#1a1612]">{{ filteredOrganizers.length }}</span>
        résultat{{ filteredOrganizers.length > 1 ? 's' : '' }} pour
        "<span class="text-[#ea6c1e]">{{ searchQuery }}</span>"
      </p>

      <!-- ── Table ── -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

        <!-- Header tableau -->
        <div class="px-5 py-3.5 border-b border-[#ede8e0] bg-[#faf8f5] flex items-center justify-between">
          <p class="text-[13px] font-semibold text-[#1a1612]">
            {{ filteredOrganizers.length }} organisateur{{ filteredOrganizers.length > 1 ? 's' : '' }}
          </p>
          <button
            @click="fetchOrganizers"
            class="flex items-center gap-1.5 text-[11.5px] font-medium text-[#b0a898] hover:text-[#ea6c1e] transition-colors"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>

        <!-- ── MOBILE : cards ── -->
        <div class="sm:hidden divide-y divide-[#ede8e0]">
          <!-- Skeleton -->
          <div v-if="loading" v-for="i in 5" :key="'m-sk-'+i" class="p-4 flex items-center gap-3 animate-pulse">
            <div class="w-10 h-10 rounded-full bg-[#f0ede8] flex-shrink-0" />
            <div class="flex-1 space-y-1.5">
              <USkeleton class="h-3.5 w-1/2 rounded" />
              <USkeleton class="h-3 w-2/3 rounded" />
            </div>
            <USkeleton class="h-6 w-14 rounded-full" />
          </div>

          <!-- Items -->
          <div
            v-else
            v-for="(org, index) in filteredOrganizers"
            :key="org.organizerId"
            class="p-4 flex items-center gap-3 hover:bg-[#faf5ee] transition-colors"
          >
            <!-- Rang -->
            <div class="flex-shrink-0 w-6 text-center">
              <span v-if="getMedal(index)" class="text-base">{{ getMedal(index)!.icon }}</span>
              <span v-else class="text-[11px] font-bold text-[#c0b8ad]">{{ index + 1 }}</span>
            </div>

            <!-- Avatar -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              :style="`background: linear-gradient(135deg, ${getAvatarColor(index).from}, ${getAvatarColor(index).to})`"
            >
              <img v-if="org.image" :src="org.image" :alt="org.name" class="w-full h-full object-cover" />
              <span v-else class="text-white font-bold text-[14px]">{{ org.name.charAt(0).toUpperCase() }}</span>
            </div>

            <!-- Infos -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-[13px] text-[#1a1612] truncate">{{ org.name }}</p>
              <p class="text-[11px] text-[#b0a898] truncate">{{ org.description || 'Organisateur professionnel' }}</p>
            </div>

            <!-- Compteur -->
            <span class="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-full text-[12px] font-bold text-[#ea6c1e] flex-shrink-0">
              <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
              {{ org.count }}
            </span>
          </div>

          <!-- Empty mobile -->
          <div v-if="!loading && filteredOrganizers.length === 0" class="py-14 text-center">
            <UIcon name="i-heroicons-users" class="w-10 h-10 text-[#d4cec5] mx-auto mb-3" />
            <p class="text-[#8a8078] text-[13px] font-medium mb-1">Aucun résultat</p>
            <p class="text-[#b0a898] text-[12px] mb-4">Aucun organisateur pour "{{ searchQuery }}"</p>
            <button @click="searchQuery = ''" class="px-4 py-2 bg-[#ea6c1e] text-white text-[12.5px] font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Réinitialiser
            </button>
          </div>
        </div>

        <!-- ── DESKTOP : tableau ── -->
        <div class="hidden sm:block overflow-x-auto overflow-y-auto max-h-[600px] mb-4">
          <table class="w-full">
            <thead class="bg-[#f5f0e8] border-b border-[#ede8e0]">
              <tr>
                <th class="th">Organisateur</th>
                <th class="th hidden md:table-cell">Description</th>
                <th class="th text-center">Événements</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#ede8e0]">

              <!-- Skeleton -->
              <tr v-if="loading" v-for="i in 6" :key="'sk-'+i" class="animate-pulse">
                <td class="px-5 py-4"><USkeleton class="h-7 w-7 rounded-full mx-auto" /></td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#f0ede8] flex-shrink-0" />
                    <USkeleton class="h-3.5 w-32 rounded" />
                  </div>
                </td>
                <td class="px-5 py-4 hidden md:table-cell"><USkeleton class="h-3.5 w-48 rounded" /></td>
                <td class="px-5 py-4 text-center"><USkeleton class="h-6 w-16 mx-auto rounded-full" /></td>
              </tr>

              <!-- Rows -->
              <tr
                v-else
                v-for="(org, index) in filteredOrganizers"
                :key="org.organizerId"
                class="hover:bg-[#faf5ee] transition-colors group"
              >
             

                <!-- Organisateur -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden transition-transform duration-200 group-hover:scale-105"
                      :style="`background: linear-gradient(135deg, ${getAvatarColor(index)?.from}, ${getAvatarColor(index)?.to})`"
                    >
                      <img v-if="org.image" :src="org.image" :alt="org.name" class="w-full h-full object-cover" />
                      <span v-else class="text-white font-bold text-[14px]">{{ org.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <p class="font-semibold text-[13.5px] text-[#1a1612]">{{ org.name }}</p>
                  </div>
                </td>

                <!-- Description -->
                <td class="px-5 py-3.5 hidden md:table-cell max-w-xs">
                  <p class="text-[12.5px] text-[#8a8078] line-clamp-2">
                    {{ org.description || 'Organisateur professionnel' }}
                  </p>
                </td>

                <!-- Compteur -->
                <td class="px-5 py-3.5 text-center">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full text-[12.5px] font-bold text-[#ea6c1e]">
                    <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
                    {{ org.count }} événement{{ org.count > 1 ? 's' : '' }}
                  </span>
                </td>
              </tr>

              <!-- Empty desktop -->
              <tr v-if="!loading && filteredOrganizers.length === 0">
                <td colspan="4" class="py-16 text-center">
                  <div class="w-14 h-14 rounded-2xl bg-[#f5f0e8] border border-[#ede8e0] flex items-center justify-center mx-auto mb-4">
                    <UIcon name="i-heroicons-users" class="w-6 h-6 text-[#c0b8ad]" />
                  </div>
                  <p class="text-[13px] font-medium text-[#8a8078] mb-1">Aucun résultat</p>
                  <p class="text-[12px] text-[#b0a898] mb-4">Aucun organisateur pour "{{ searchQuery }}"</p>
                  <button @click="searchQuery = ''" class="px-5 py-2 bg-[#ea6c1e] text-white text-[12.5px] font-semibold rounded-xl hover:opacity-90 transition-opacity">
                    Réinitialiser la recherche
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>


/* ── Table header ── */
.th {
  padding: 10px 20px;
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.09em; text-transform: uppercase;
  color: #8a8078; text-align: left;
}

/* ── Sort pills ── */
.sort-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 500; color: #8a8078;
  font-family: 'Outfit', sans-serif; cursor: pointer;
  background: #faf8f5; border: 1px solid #ede8e0;
  transition: all 0.15s;
}
.sort-pill:hover { color: #4a3f32; border-color: #c0b8ad; background: white; }
.sort-pill--active {
  background: white; color: #1a1612; font-weight: 600;
  border-color: #ea6c1e; box-shadow: 0 0 0 2px rgba(234,108,30,0.1);
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
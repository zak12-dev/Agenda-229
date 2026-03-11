<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Ville {
  id: string
  nomVille: string
  createdAt: string
  updatedAt: string
}

const searchQuery = ref('')
const sortBy = ref<'name' | 'date'>('name')
const villes = ref<Ville[]>([])
const loading = ref(true)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedVille = ref<Ville | null>(null)
const newVilleName = ref('')
const createLoading = ref(false)

const filteredVilles = computed(() => {
  let list = [...villes.value]
  if (searchQuery.value) {
    list = list.filter(v =>
      v.nomVille.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (sortBy.value === 'name') {
    list.sort((a, b) => a.nomVille.localeCompare(b.nomVille))
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return list
})

const fetchVilles = async () => {
  loading.value = true
  try {
    villes.value = await $fetch<Ville[]>('/api/villes')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const createVille = async () => {
  if (!newVilleName.value.trim()) return
  createLoading.value = true
  try {
    await $fetch('/api/villes', {
      method: 'POST',
      body: { nomVille: newVilleName.value.trim() },
    })
    newVilleName.value = ''
    isCreateModalOpen.value = false
    await fetchVilles()
  } catch (err) {
    console.error(err)
  } finally {
    createLoading.value = false
  }
}

const updateVille = async () => {
  if (!selectedVille.value?.nomVille.trim()) return
  try {
    await $fetch(`/api/villes/${selectedVille.value.id}`, {
      method: 'PATCH',
      body: { nomVille: selectedVille.value.nomVille },
    })
    isEditModalOpen.value = false
    await fetchVilles()
  } catch (err) {
    console.error(err)
  }
}

const deleteVille = async (id: string) => {
  if (!confirm('Supprimer cette ville ?')) return
  try {
    await $fetch(`/api/villes/${id}`, { method: 'DELETE' })
    villes.value = villes.value.filter(v => v.id !== id)
  } catch (err) {
    console.error(err)
  }
}

const openEditModal = (ville: Ville) => {
  selectedVille.value = { ...ville }
  isEditModalOpen.value = true
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const getInitialColor = (index: number) => {
  const colors = [
    { bg: 'bg-orange-50',  border: 'border-orange-100',  text: 'text-[#ea6c1e]' },
    { bg: 'bg-indigo-50',  border: 'border-indigo-100',  text: 'text-indigo-500' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
    { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-600' },
    { bg: 'bg-rose-50',    border: 'border-rose-100',    text: 'text-rose-500' },
    { bg: 'bg-cyan-50',    border: 'border-cyan-100',    text: 'text-cyan-600' },
  ]
  return colors[index % colors.length]
}

onMounted(fetchVilles)
</script>

<template>
  <div class="bg-[#f5f3ef] px-4 pt-4 pb-32 sm:px-6 sm:pb-12 font-outfit w-full min-h-screen overflow-y-auto mb-10">
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- ── KPI + Bouton créer ── -->
      <div class="flex items-center gap-3">
        <div class="flex-1 bg-white rounded-2xl border border-[#ede8e0] px-5 py-4
                    shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <p class="text-[11px] font-medium text-[#b0a898] uppercase tracking-wide mb-1">Total villes</p>
            <p class="text-3xl font-bold text-[#1a1612] tracking-tight leading-none">{{ villes.length }}</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <button
          @click="isCreateModalOpen = true"
          class="btn-primary h-full px-4 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 min-w-[72px]"
        >
          <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          <span class="text-[11px] font-semibold hidden sm:block">Nouvelle</span>
        </button>
      </div>

      <!-- ── Recherche + Tri ── -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] p-4
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad]" />
          <input
            v-model="searchQuery" type="text"
            placeholder="Rechercher une ville…"
            class="w-full pl-10 pr-9 py-2.5 bg-[#faf8f5] border border-[#ede8e0] rounded-xl
                   text-[13.5px] text-[#1a1612] placeholder:text-[#c0b8ad] font-outfit
                   focus:outline-none focus:border-[#ea6c1e] focus:ring-2 focus:ring-[#ea6c1e]/10 transition-all"
          />
          <button v-if="searchQuery" @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0b8ad] hover:text-[#8a8078] transition-colors">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="flex bg-[#faf8f5] border border-[#ede8e0] rounded-xl p-1 gap-1 self-start sm:self-auto">
          <button @click="sortBy = 'name'" :class="['sort-pill', sortBy === 'name' ? 'sort-pill--active' : '']">
            <UIcon name="i-heroicons-bars-arrow-down" class="w-3.5 h-3.5" /> A–Z
          </button>
          <button @click="sortBy = 'date'" :class="['sort-pill', sortBy === 'date' ? 'sort-pill--active' : '']">
            <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" /> Récentes
          </button>
        </div>
      </div>

      <!-- ── Liste ── -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

        <div class="px-5 py-3.5 border-b border-[#ede8e0] bg-[#faf8f5] flex items-center justify-between">
          <p class="text-[12.5px] font-semibold text-[#1a1612]">
            {{ filteredVilles.length }} ville{{ filteredVilles.length > 1 ? 's' : '' }}
            <span v-if="searchQuery" class="text-[#b0a898] font-normal"> pour "{{ searchQuery }}"</span>
          </p>
          <span class="text-[11px] text-[#b0a898]">{{ villes.length }} au total</span>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="divide-y divide-[#ede8e0]">
          <div v-for="i in 6" :key="i" class="px-5 py-4 flex items-center gap-4 animate-pulse">
            <div class="w-10 h-10 rounded-xl bg-[#f0ede8] flex-shrink-0" />
            <div class="flex-1 space-y-1.5">
              <USkeleton class="h-3.5 w-1/3 rounded" />
              <USkeleton class="h-3 w-1/5 rounded" />
            </div>
            <div class="flex gap-2">
              <div class="w-8 h-8 rounded-lg bg-[#f0ede8]" />
              <div class="w-8 h-8 rounded-lg bg-[#f0ede8]" />
            </div>
          </div>
        </div>

        <!-- Items -->
        <div v-else class="divide-y divide-[#ede8e0] overflow-y-auto max-h-[600px] mb-4">
          <div
            v-for="(ville, index) in filteredVilles" :key="ville.id"
            class="px-5 py-4 flex items-center gap-4 hover:bg-[#faf5ee] transition-colors group"
          >
            <!-- Icône colorée -->
            <div
              :class="[
                'w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                getInitialColor(index).bg, getInitialColor(index).border,
              ]"
            >
              <span :class="['text-[15px] font-bold', getInitialColor(index).text]">
                {{ ville.nomVille[0]?.toUpperCase() }}
              </span>
            </div>

            <!-- Nom + date -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-[13.5px] text-[#1a1612] leading-tight truncate">{{ ville.nomVille }}</p>
              <p class="text-[11.5px] text-[#b0a898] mt-0.5 flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-3 h-3 flex-shrink-0" />
                Ajoutée le {{ formatDate(ville.createdAt) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <div class="relative group/tip">
                <button @click="openEditModal(ville)"
                  class="action-btn text-[#ea6c1e] bg-white border-[#ede8e0] hover:bg-orange-50 hover:border-orange-200">
                  <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
                </button>
                <div class="tooltip">Modifier</div>
              </div>
              <div class="relative group/tip">
                <button @click="deleteVille(ville.id)"
                  class="action-btn text-red-400 bg-white border-[#ede8e0] hover:bg-red-50 hover:border-red-200">
                  <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
                </button>
                <div class="tooltip">Supprimer</div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredVilles.length === 0" class="py-16 text-center">
            <div class="w-14 h-14 rounded-2xl bg-[#f5f0e8] border border-[#ede8e0] flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-[#c0b8ad]" />
            </div>
            <p class="text-[13px] font-medium text-[#8a8078] mb-1">
              {{ searchQuery ? 'Aucun résultat' : 'Aucune ville' }}
            </p>
            <p class="text-[12px] text-[#b0a898]">
              {{ searchQuery ? `Aucune ville ne correspond à "${searchQuery}"` : 'Ajoutez votre première ville' }}
            </p>
            <button v-if="!searchQuery" @click="isCreateModalOpen = true" class="mt-4 btn-primary px-5 py-2 text-[13px]">
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
              Ajouter une ville
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MODAL CRÉER ══ -->
    <Transition name="fade">
      <div v-if="isCreateModalOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        @click.self="isCreateModalOpen = false">
        <Transition name="slide-up">
          <div v-if="isCreateModalOpen" class="modal-sheet sm:max-w-md">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Nouvelle ville</h3>
                  <p class="text-xs text-orange-100/70">Ajoutez une ville à la liste</p>
                </div>
              </div>
              <button @click="isCreateModalOpen = false" class="modal-close">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>

            <div class="p-5 sm:p-6">
              <div class="field">
                <label class="field-label">Nom de la ville <span class="text-red-400">*</span></label>
                <input v-model="newVilleName" type="text" placeholder="Ex: Cotonou, Porto-Novo, Parakou…"
                  class="field-input" @keyup.enter="createVille" autofocus />
              </div>
            </div>

            <div class="modal-footer">
              <button @click="isCreateModalOpen = false" class="btn-ghost">Annuler</button>
              <button @click="createVille" :disabled="!newVilleName.trim() || createLoading"
                class="btn-primary px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                <UIcon v-if="createLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                <UIcon v-else name="i-heroicons-plus" class="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══ MODAL ÉDITER ══ -->
    <Transition name="fade">
      <div v-if="isEditModalOpen && selectedVille"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        @click.self="isEditModalOpen = false">
        <Transition name="slide-up">
          <div v-if="isEditModalOpen && selectedVille" class="modal-sheet sm:max-w-md">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Modifier la ville</h3>
                  <p class="text-xs text-orange-100/70">{{ selectedVille.nomVille }}</p>
                </div>
              </div>
              <button @click="isEditModalOpen = false" class="modal-close">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>

            <div class="p-5 sm:p-6">
              <div class="field">
                <label class="field-label">Nom <span class="text-red-400">*</span></label>
                <input v-model="selectedVille.nomVille" type="text" class="field-input" @keyup.enter="updateVille" />
              </div>
            </div>

            <div class="modal-footer">
              <button @click="isEditModalOpen = false" class="btn-ghost">Annuler</button>
              <button @click="updateVille" :disabled="!selectedVille.nomVille.trim()"
                class="btn-primary px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                <UIcon name="i-heroicons-check" class="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1); }
.slide-up-enter-from { opacity: 0; transform: translateY(40px) scale(0.97); }
.slide-up-leave-to  { opacity: 0; transform: translateY(20px) scale(0.97); }

.modal-sheet { background: #ffffff; border-radius: 24px 24px 0 0; width: 100%; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 -8px 40px rgba(0,0,0,0.12); }
@media (min-width: 640px) { .modal-sheet { border-radius: 20px; max-height: 88vh; box-shadow: 0 24px 80px rgba(0,0,0,0.15); } }

.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; background: linear-gradient(135deg, #ea6c1e, #5b47e0); flex-shrink: 0; }
.modal-close { width: 34px; height: 34px; background: rgba(255,255,255,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; transition: background 0.2s; cursor: pointer; border: none; }
.modal-close:hover { background: rgba(255,255,255,0.25); }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid #ede8e0; background: #faf8f5; flex-shrink: 0; }

.btn-primary { display: inline-flex; align-items: center; gap: 7px; border-radius: 12px; font-size: 13px; font-weight: 600; color: white; background: linear-gradient(135deg, #ea6c1e, #5b47e0); transition: opacity 0.15s; font-family: 'Outfit', sans-serif; box-shadow: 0 4px 14px rgba(234,108,30,0.2); cursor: pointer; border: none; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }

.btn-ghost { padding: 9px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; color: #8a8078; background: white; border: 1px solid #ede8e0; transition: background 0.15s; font-family: 'Outfit', sans-serif; cursor: pointer; }
.btn-ghost:hover { background: #f5f0e8; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12.5px; font-weight: 600; color: #4a3f32; }
.field-input { width: 100%; padding: 10px 14px; background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px; font-size: 13.5px; color: #1a1612; font-family: 'Outfit', sans-serif; transition: border-color 0.15s, box-shadow 0.15s; outline: none; }
.field-input:focus { border-color: #ea6c1e; box-shadow: 0 0 0 3px rgba(234,108,30,0.1); }
.field-input::placeholder { color: #c0b8ad; }

.action-btn { width: 32px; height: 32px; border-radius: 9px; border-width: 1px; border-style: solid; display: flex; align-items: center; justify-content: center; transition: all 0.15s; cursor: pointer; }

.tooltip { position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: #1a1612; color: white; font-size: 10px; font-weight: 500; font-family: 'Outfit', sans-serif; padding: 4px 8px; border-radius: 7px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.15s; z-index: 20; }
.group\/tip:hover .tooltip { opacity: 1; }

.sort-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 9px; font-size: 12px; font-weight: 500; color: #8a8078; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.15s; border: none; background: transparent; }
.sort-pill:hover { color: #4a3f32; background: white; }
.sort-pill--active { background: white; color: #1a1612; font-weight: 600; box-shadow: 0 1px 6px rgba(0,0,0,0.07); }

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
<script setup lang="ts">
/**
 * EventWizard.vue
 * Wizard création événement — Modal sur desktop, Page dédiée sur mobile
 *
 * Usage dans events.vue :
 *   <EventWizard v-model="isWizardOpen" @created="fetchEvents" />
 */
import { ref, reactive, computed, watch } from 'vue'


const props = defineProps<{ modelValue: boolean }>()
const emit  = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'created'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// ─── Types ───
interface Category { id: string; name: string; icon?: string }
interface Ville     { id: string; name: string }
interface EventForm {
  title: string; description: string; details: string
  location: string; villeId: string
  eventDate: string; startDate: string; endDate: string
  categoryId: string; priceType: 'FREE' | 'PAID'; price: string
  images: File[]
}

// ─── State ───
const currentStep   = ref(1)
const totalSteps    = 4
const isPublishing  = ref(false)
const isSavingDraft = ref(false)
const draftId       = ref<string | null>(null)
const categories    = ref<Category[]>([])
const villes        = ref<Ville[]>([])
const dataLoaded    = ref(false)

const titleMaxLength       = 100
const descriptionMaxLength = 250
const detailsMaxLength     = 500

const form = reactive<EventForm>({
  title: '', description: '', details: '',
  location: '', villeId: '',
  eventDate: '', startDate: '', endDate: '',
  categoryId: '', priceType: 'FREE', price: '',
  images: [],
})

// ─── Load data on open ───
const loadFormData = async () => {
  try {
    const [catsData, villesData] = await Promise.all([
      $fetch<any[]>('/api/categories'),
      $fetch<any[]>('/api/villes'),
    ])
    categories.value = (catsData || []).map((c: any) => ({
      id: String(c.id), name: c.name, icon: c.icon || 'i-heroicons-tag',
    }))
    villes.value = (villesData || []).map((v: any) => ({
      id: String(v.id), name: v.nomVille,
    }))
    dataLoaded.value = true
  } catch (e) { console.error('loadFormData error:', e) }
}

// Charge les données à l'ouverture
watch(isOpen, async (v) => {
  if (v && !dataLoaded.value) await loadFormData()
})

// Reset uniquement après fermeture complète (délai = fin de l'animation)
watch(isOpen, (v) => {
  if (!v) setTimeout(resetWizard, 300)
})

// ─── Steps ───
const steps = [
  { number: 1, label: "L'essentiel", icon: 'i-heroicons-document-text', color: '#ea6c1e', bg: 'bg-orange-50', border: 'border-orange-100' },
  { number: 2, label: 'Lieu & Date',  icon: 'i-heroicons-map-pin',       color: '#5b47e0', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { number: 3, label: 'Catégorie',    icon: 'i-heroicons-tag',            color: '#059669', bg: 'bg-emerald-50',border: 'border-emerald-100'},
  { number: 4, label: 'Médias',       icon: 'i-heroicons-photo',          color: '#0891b2', bg: 'bg-cyan-50',   border: 'border-cyan-100'   },
]

// ─── Validation par étape ───
const step1Valid = computed(() =>
  form.title.trim().length >= 3 &&
  form.description.trim().length >= 10 &&
  form.details.trim().length >= 10
)
const step2Valid = computed(() =>
  form.location.trim().length >= 2 &&
  form.villeId !== '' &&
  form.eventDate !== '' &&
  form.startDate !== ''
)
const step3Valid = computed(() =>
  form.categoryId !== '' &&
  (form.priceType === 'FREE' || (form.priceType === 'PAID' && form.price !== ''))
)
const step4Valid = computed(() => form.images.length > 0)

const stepValid = computed(() => {
  if (currentStep.value === 1) return step1Valid.value
  if (currentStep.value === 2) return step2Valid.value
  if (currentStep.value === 3) return step3Valid.value
  if (currentStep.value === 4) return step4Valid.value
  return false
})

// Indique si une étape a été "touchée" (visitée) pour afficher les erreurs
const visitedSteps = ref<Set<number>>(new Set())
watch(currentStep, (n, old) => { visitedSteps.value.add(old) })

const stepHasError = (n: number) => {
  if (!visitedSteps.value.has(n)) return false
  if (n === 1) return !step1Valid.value
  if (n === 2) return !step2Valid.value
  if (n === 3) return !step3Valid.value
  if (n === 4) return !step4Valid.value
  return false
}
const isFormValid = computed(() =>
  step1Valid.value && step2Valid.value && step3Valid.value && step4Valid.value
)
const progressPct = computed(() =>
  Math.round(((currentStep.value - 1) / totalSteps) * 100)
)

// ─── Navigation ───
const goNext = () => { if (currentStep.value < totalSteps) currentStep.value++ }
const goPrev = () => { if (currentStep.value > 1) currentStep.value-- }
const goToStep = (n: number) => { currentStep.value = n }

// ─── Images ───
const handleImageUpload = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  form.images = [...form.images, ...Array.from(files)].slice(0, 3)
}
const removeImageAt = (i: number) => form.images.splice(i, 1)
const imagePreviewUrl = (file: File) => URL.createObjectURL(file)

// ─── Submit ───
const submit = async (status: 'DRAFT' | 'PUBLISHED') => {
  if (status === 'PUBLISHED' && !isFormValid.value) return
  status === 'PUBLISHED' ? (isPublishing.value = true) : (isSavingDraft.value = true)
  const fd = new FormData()
  fd.append('title',       form.title)
  fd.append('description', form.description)
  fd.append('details',     form.details)
  fd.append('location',    form.location)
  fd.append('villeId',     form.villeId)
  fd.append('eventDate',   form.eventDate)
  fd.append('startDate',   form.startDate)
  fd.append('endDate',     form.endDate || '')
  fd.append('categoryId',  form.categoryId)
  fd.append('priceType',   form.priceType)
  fd.append('status',      status)
  if (form.priceType === 'PAID') fd.append('price', form.price)
  form.images.forEach(f => fd.append('images', f))
  try {
    const url    = draftId.value ? `/api/events/${draftId.value}` : '/api/events'
    const method = draftId.value ? 'PUT' : 'POST'
    const res    = await fetch(url, { method, body: fd, credentials: 'include' })
    if (!res.ok) { const err = await res.json(); throw new Error(err.statusMessage) }
    const data = await res.json()
    if (status === 'DRAFT') draftId.value = data.event.id
    emit('created')
    isOpen.value = false
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Une erreur est survenue')
  } finally {
    isPublishing.value  = false
    isSavingDraft.value = false
  }
}

const resetWizard = () => {
  currentStep.value = 1
  draftId.value = null
  visitedSteps.value = new Set()
  Object.assign(form, {
    title: '', description: '', details: '',
    location: '', villeId: '', eventDate: '', startDate: '', endDate: '',
    categoryId: '', priceType: 'FREE', price: '', images: [],
  })
}

// ─── Helpers ───
const formatDateLong = (d: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''
const selectedVilleName    = computed(() => villes.value.find(v => v.id === form.villeId)?.name || '')
const selectedCategoryName = computed(() => categories.value.find(c => c.id === form.categoryId)?.name || '')
</script>

<template>
  <!-- ══════════════════════════════════════════════════
       OVERLAY (commun desktop + mobile)
  ══════════════════════════════════════════════════ -->
  <Transition enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0" enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="isOpen"
      class="fixed inset-0 z-50 bg-[#1a1612]/40 backdrop-blur-sm"
      @click="isOpen = false" />
  </Transition>

  <!-- ══════════════════════════════════════════════════
       MOBILE — Bottom sheet plein écran
  ══════════════════════════════════════════════════ -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-y-full"
    enter-to-class="translate-y-0"
    leave-active-class="transition-transform duration-250 ease-in"
    leave-from-class="translate-y-0"
    leave-to-class="translate-y-full">
    <div v-if="isOpen"
      class="sm:hidden fixed inset-x-0 bottom-0 z-[60] flex flex-col font-outfit
             bg-[#faf8f5] rounded-t-3xl overflow-hidden"
      style="max-height: 95dvh">

      <!-- Drag handle -->
      <div class="flex justify-center pt-3 pb-1 flex-shrink-0">
        <div class="w-10 h-1 rounded-full bg-[#d4cec5]" />
      </div>

      <!-- Header mobile — sobre -->
      <div class="flex-shrink-0 px-5 pt-3 pb-4 bg-white border-b border-[#ede8e0]">
        <!-- Ligne titre + close -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              :style="`background: ${steps[currentStep-1].color}15; border: 1.5px solid ${steps[currentStep-1].color}30`">
              <UIcon :name="steps[currentStep-1].icon" class="w-4 h-4"
                :style="`color: ${steps[currentStep-1].color}`" />
            </div>
            <div>
              <p class="text-[10px] font-semibold text-[#c0b8ad] uppercase tracking-widest leading-none mb-0.5">
                Étape {{ currentStep }}/{{ totalSteps }}
              </p>
              <p class="text-[15px] font-bold text-[#1a1612] leading-tight">
                {{ steps[currentStep-1].label }}
              </p>
            </div>
          </div>
          <button @click="isOpen = false"
            class="w-8 h-8 rounded-xl bg-[#f5f3ef] border border-[#ede8e0]
                   flex items-center justify-center hover:border-[#c0b8ad] transition-all">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-[#8a8078]" />
          </button>
        </div>
        <!-- Steps pills -->
        <div class="flex items-center gap-1.5">
          <button v-for="step in steps" :key="step.number"
            @click="goToStep(step.number)"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 text-[11px] font-semibold"
            :style="currentStep === step.number
              ? `background: ${steps[currentStep-1].color}12; color: ${steps[currentStep-1].color}; border: 1px solid ${steps[currentStep-1].color}25`
              : step.number < currentStep
                ? 'background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0'
                : 'background: #f5f3ef; color: #c0b8ad; border: 1px solid #ede8e0'"
          >
            <UIcon v-if="step.number < currentStep && !stepHasError(step.number)" name="i-heroicons-check" class="w-3 h-3" />
            <UIcon v-else-if="stepHasError(step.number)" name="i-heroicons-exclamation-circle" class="w-3 h-3 text-red-400" />
            <span v-else>{{ step.number }}</span>
            <span class="hidden xs:inline">{{ step.label }}</span>
          </button>
        </div>
        <!-- Barre progression -->
        <div class="mt-3 h-1 bg-[#f0ede8] rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500"
            :style="`width: ${progressPct}%; background: ${steps[currentStep-1].color}`" />
        </div>
      </div>

      <!-- Corps scrollable mobile — même contenu que desktop -->
      <div class="flex-1 overflow-y-auto">
        <Transition name="step-fade" mode="out-in">
          <div v-if="currentStep === 1" key="ms1" class="p-5 space-y-5">
            <div class="field">
              <div class="flex items-center justify-between">
                <label class="field-label">Titre <span class="req">*</span></label>
                <span class="counter">{{ form.title.length }}/{{ titleMaxLength }}</span>
              </div>
              <input v-model="form.title" :maxlength="titleMaxLength" type="text"
                placeholder="Ex : Concert Jazz au clair de lune" class="field-input" />
              <p v-if="form.title.length > 0 && form.title.length < 3" class="hint-error">
                <UIcon name="i-heroicons-exclamation-circle" class="w-3.5 h-3.5" /> Minimum 3 caractères
              </p>
            </div>
            <div class="field">
              <div class="flex items-center justify-between">
                <label class="field-label">Description courte <span class="req">*</span></label>
                <span class="counter">{{ form.description.length }}/{{ descriptionMaxLength }}</span>
              </div>
              <textarea v-model="form.description" :maxlength="descriptionMaxLength" rows="3"
                placeholder="Résumez votre événement en quelques phrases…" class="field-input resize-none" />
            </div>
            <div class="field">
              <div class="flex items-center justify-between">
                <label class="field-label">Détails complets <span class="req">*</span></label>
                <span class="counter">{{ form.details.length }}/{{ detailsMaxLength }}</span>
              </div>
              <textarea v-model="form.details" :maxlength="detailsMaxLength" rows="4"
                placeholder="Programme, intervenants, consignes d'accès…" class="field-input resize-none" />
            </div>
          </div>

          <div v-else-if="currentStep === 2" key="ms2" class="p-5 space-y-5">
            <div class="field">
              <label class="field-label">Lieu précis <span class="req">*</span></label>
              <div class="relative">
                <UIcon name="i-heroicons-building-office-2" class="field-icon" />
                <input v-model="form.location" type="text"
                  placeholder="Ex : Palais des Congrès" class="field-input pl-10" />
              </div>
            </div>
            <div class="field">
              <label class="field-label">Ville <span class="req">*</span></label>
              <div class="relative">
                <UIcon name="i-heroicons-map-pin" class="field-icon" />
                <select v-model="form.villeId" class="field-input pl-10 appearance-none">
                  <option value="" disabled>Sélectionnez une ville</option>
                  <option v-for="v in villes" :key="v.id" :value="v.id">{{ v.name }}</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Date <span class="req">*</span></label>
              <div class="relative">
                <UIcon name="i-heroicons-calendar-days" class="field-icon" />
                <input v-model="form.eventDate" type="date" class="field-input pl-10"
                  :min="new Date().toISOString().split('T')[0]" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="field">
                <label class="field-label">Heure début <span class="req">*</span></label>
                <div class="relative">
                  <UIcon name="i-heroicons-clock" class="field-icon" />
                  <input v-model="form.startDate" type="time" class="field-input pl-10" />
                </div>
              </div>
              <div class="field">
                <label class="field-label">Heure fin</label>
                <div class="relative">
                  <UIcon name="i-heroicons-clock" class="field-icon" />
                  <input v-model="form.endDate" type="time" class="field-input pl-10" />
                </div>
              </div>
            </div>
            <Transition name="fade-in">
              <div v-if="form.eventDate" class="notice-indigo">
                <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-[#5b47e0] flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-[13px] font-semibold text-[#5b47e0]">{{ formatDateLong(form.eventDate) }}</p>
                  <p v-if="form.startDate" class="text-[11.5px] text-[#5b47e0]/70 mt-0.5">
                    {{ form.startDate }}{{ form.endDate ? ` → ${form.endDate}` : '' }}
                    <span v-if="selectedVilleName"> · {{ selectedVilleName }}</span>
                  </p>
                </div>
              </div>
            </Transition>
          </div>

          <div v-else-if="currentStep === 3" key="ms3" class="p-5 space-y-5">
            <div class="field">
              <label class="field-label">Catégorie <span class="req">*</span></label>
              <div class="grid grid-cols-2 gap-2 mt-1">
                <button v-for="cat in categories" :key="cat.id" type="button"
                  @click="form.categoryId = cat.id"
                  :class="['flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all',
                    form.categoryId === cat.id
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-[#faf8f5] border-[#ede8e0] text-[#8a8078]']">
                  <div :class="['w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0',
                    form.categoryId === cat.id ? 'bg-emerald-100 border border-emerald-200' : 'bg-white border border-[#ede8e0]']">
                    <UIcon :name="cat.icon || 'i-heroicons-tag'" class="w-3 h-3"
                      :class="form.categoryId === cat.id ? 'text-emerald-600' : 'text-[#c0b8ad]'" />
                  </div>
                  <span class="text-[12px] font-medium truncate">{{ cat.name }}</span>
                </button>
              </div>
            </div>
            <div class="h-px bg-[#ede8e0]" />
            <div class="field">
              <label class="field-label">Tarification <span class="req">*</span></label>
              <div class="grid grid-cols-2 gap-3 mt-1">
                <button type="button" @click="form.priceType = 'FREE'"
                  :class="['flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all',
                    form.priceType === 'FREE' ? 'bg-emerald-50 border-emerald-200' : 'bg-[#faf8f5] border-[#ede8e0]']">
                  <UIcon name="i-heroicons-gift" class="w-4 h-4"
                    :class="form.priceType === 'FREE' ? 'text-emerald-600' : 'text-[#c0b8ad]'" />
                  <span class="text-[13px] font-semibold"
                    :class="form.priceType === 'FREE' ? 'text-emerald-700' : 'text-[#4a3f32]'">Gratuit</span>
                </button>
                <button type="button" @click="form.priceType = 'PAID'"
                  :class="['flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all',
                    form.priceType === 'PAID' ? 'bg-orange-50 border-orange-200' : 'bg-[#faf8f5] border-[#ede8e0]']">
                  <UIcon name="i-heroicons-banknotes" class="w-4 h-4"
                    :class="form.priceType === 'PAID' ? 'text-[#ea6c1e]' : 'text-[#c0b8ad]'" />
                  <span class="text-[13px] font-semibold"
                    :class="form.priceType === 'PAID' ? 'text-[#ea6c1e]' : 'text-[#4a3f32]'">Payant</span>
                </button>
              </div>
            </div>
            <Transition name="fade-in">
              <div v-if="form.priceType === 'PAID'" class="field">
                <label class="field-label">Montant (FCFA) <span class="req">*</span></label>
                <div class="relative">
                  <UIcon name="i-heroicons-banknotes" class="field-icon" />
                  <input v-model="form.price" type="number" min="0" step="500"
                    placeholder="Ex : 5000" class="field-input pl-10" />
                </div>
              </div>
            </Transition>
          </div>

          <div v-else-if="currentStep === 4" key="ms4" class="p-5 space-y-5">
            <div class="field">
              <label class="field-label">Photos <span class="req">*</span> <span class="text-[#c0b8ad] font-normal">(max 3)</span></label>
              <div v-if="form.images.length > 0" class="grid grid-cols-3 gap-2 mb-3">
                <div v-for="(img, idx) in form.images" :key="idx"
                  class="relative rounded-xl overflow-hidden aspect-square bg-[#f0ede8] group">
                  <img :src="imagePreviewUrl(img)" :alt="img.name" class="w-full h-full object-cover" />
                  <button @click="removeImageAt(idx)" type="button"
                    class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <UIcon name="i-heroicons-x-mark" class="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
              <label v-if="form.images.length < 3" class="group cursor-pointer block">
                <div class="border-2 border-dashed border-[#d4cec5] rounded-xl p-6 text-center
                            hover:border-[#ea6c1e] hover:bg-orange-50/30 transition-all">
                  <UIcon name="i-heroicons-arrow-up-tray" class="w-8 h-8 mx-auto text-[#c0b8ad] group-hover:text-[#ea6c1e] mb-2 transition-colors" />
                  <p class="text-[13px] font-medium text-[#8a8078] group-hover:text-[#ea6c1e] transition-colors">
                    Ajouter des photos
                  </p>
                  <p class="text-[11px] text-[#b0a898] mt-0.5">PNG, JPG — max 10 MB</p>
                </div>
                <input type="file" accept="image/*" multiple class="hidden" @change="handleImageUpload" />
              </label>
            </div>
            <!-- Récap compact mobile -->
            <div class="bg-[#faf8f5] rounded-xl border border-[#ede8e0] p-4 space-y-2">
              <p class="text-[11px] font-bold text-[#b0a898] uppercase tracking-wide mb-3">Récap</p>
              <div class="recap-row"><span class="recap-label">Titre</span><span class="recap-value truncate max-w-[160px]">{{ form.title || '—' }}</span></div>
              <div class="recap-row"><span class="recap-label">Lieu</span><span class="recap-value">{{ form.location || '—' }}</span></div>
              <div class="recap-row"><span class="recap-label">Date</span><span class="recap-value">{{ form.eventDate || '—' }}</span></div>
              <div class="recap-row"><span class="recap-label">Catégorie</span><span class="recap-value">{{ selectedCategoryName || '—' }}</span></div>
              <div class="recap-row">
                <span class="recap-label">Prix</span>
                <span v-if="form.priceType === 'FREE'" class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">Gratuit</span>
                <span v-else class="recap-value text-[#ea6c1e] font-bold">{{ form.price || '—' }} FCFA</span>
              </div>
            </div>
            <div v-if="!isFormValid" class="notice-amber">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p>Des champs sont incomplets dans les étapes précédentes.</p>
            </div>
            <div v-else class="notice-green">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p>Tout est prêt ! Vous pouvez publier.</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Footer navigation mobile -->
      <div class="flex-shrink-0 px-5 py-4 border-t border-[#ede8e0] bg-white space-y-2.5">
        <!-- Brouillon -->
        <button @click="submit('DRAFT')" :disabled="isSavingDraft || !step1Valid"
          class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                 bg-[#faf8f5] border border-[#ede8e0] text-[13px] font-medium text-[#8a8078]
                 hover:border-[#c0b8ad] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          <UIcon v-if="isSavingDraft" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
          <UIcon v-else name="i-heroicons-document-text" class="w-3.5 h-3.5" />
          Sauvegarder brouillon
        </button>
        <!-- Prev / Next / Publish -->
        <div class="flex gap-2.5">
          <button v-if="currentStep > 1" @click="goPrev"
            class="flex items-center gap-1.5 px-4 py-3 rounded-xl
                   bg-white border border-[#ede8e0] text-[13px] font-medium text-[#8a8078]
                   hover:border-[#c0b8ad] transition-all flex-shrink-0">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          </button>
          <button v-if="currentStep < totalSteps"
            @click="goNext"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                   text-[13.5px] font-bold text-white transition-all"
            style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
            Continuer
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </button>
          <button v-else
            @click="submit('PUBLISHED')" :disabled="!isFormValid || isPublishing"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                   text-[13.5px] font-bold text-white transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed"
            style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
            <UIcon v-if="isPublishing" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <UIcon v-else name="i-heroicons-check" class="w-4 h-4" />
            {{ isPublishing ? 'Publication…' : 'Publier' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ══════════════════════════════════════════════════
       DESKTOP — Modal centrée
  ══════════════════════════════════════════════════ -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-2">
    <div v-if="isOpen"
      class="hidden sm:flex fixed inset-0 z-[60] items-center justify-center p-4 font-outfit">
      <div class="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.18)]
                  w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        <!-- Header desktop — sobre et élégant -->
        <div class="flex-shrink-0 bg-white border-b border-[#ede8e0] px-6 py-4">
          <!-- Ligne 1 : titre + étape + close -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                :style="`background: ${steps[currentStep-1].color}12; border: 1.5px solid ${steps[currentStep-1].color}25`">
                <UIcon :name="steps[currentStep-1].icon" class="w-4.5 h-4.5 transition-all"
                  :style="`color: ${steps[currentStep-1].color}`" />
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-widest leading-none mb-0.5 transition-colors"
                  :style="`color: ${steps[currentStep-1].color}`">
                  Étape {{ currentStep }} sur {{ totalSteps }}
                </p>
                <h2 class="text-[17px] font-bold text-[#1a1612] leading-tight">
                  {{ steps[currentStep-1].label }}
                </h2>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[12px] font-semibold text-[#b0a898]">{{ progressPct }}%</span>
              <button @click="isOpen = false"
                class="w-8 h-8 rounded-xl bg-[#f5f3ef] border border-[#ede8e0]
                       flex items-center justify-center hover:border-[#c0b8ad]
                       hover:bg-[#ede8e0] transition-all">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-[#8a8078]" />
              </button>
            </div>
          </div>

          <!-- Ligne 2 : steps avec séparateurs -->
          <div class="flex items-center gap-1">
            <template v-for="(step, idx) in steps" :key="step.number">
              <button @click="goToStep(step.number)"
                class="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 group"
                :style="currentStep === step.number
                  ? `background: ${step.color}10; border: 1px solid ${step.color}25`
                  : 'background: transparent; border: 1px solid transparent'"
              >
                <!-- Numéro / check -->
                <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  :style="stepHasError(step.number)
                    ? 'background: #ef4444; border: none'
                    : step.number < currentStep
                      ? 'background: #16a34a; border: none'
                      : currentStep === step.number
                        ? `background: ${step.color}; border: none`
                        : 'background: transparent; border: 1.5px solid #d4cec5'"
                >
                  <UIcon v-if="step.number < currentStep && !stepHasError(step.number)" name="i-heroicons-check"
                    class="w-2.5 h-2.5 text-white" />
                  <UIcon v-else-if="stepHasError(step.number)" name="i-heroicons-exclamation-circle"
                    class="w-2.5 h-2.5 text-white" />
                  <span v-else class="text-[9px] font-bold"
                    :style="currentStep === step.number ? 'color: white' : 'color: #b0a898'">
                    {{ step.number }}
                  </span>
                </div>
                <!-- Label -->
                <span class="text-[12px] font-semibold transition-colors"
                  :style="step.number < currentStep
                    ? 'color: #16a34a'
                    : currentStep === step.number
                      ? `color: ${step.color}`
                      : 'color: #b0a898'"
                >{{ step.label }}</span>
              </button>
              <!-- Séparateur -->
              <div v-if="idx < steps.length - 1" class="flex-1 h-px mx-1 transition-all"
                :style="step.number < currentStep ? 'background: #bbf7d0' : 'background: #ede8e0'" />
            </template>
          </div>

          
        </div>

        <!-- Corps scrollable desktop -->
        <div class="flex-1 overflow-y-auto">
          <Transition name="step-fade" mode="out-in">

            <!-- ── Étape 1 — L'essentiel ── -->
            <div v-if="currentStep === 1" key="s1" class="p-6 space-y-5">
              <div class="field">
                <div class="flex items-center justify-between">
                  <label class="field-label">Titre <span class="req">*</span></label>
                  <span class="counter">{{ form.title.length }}/{{ titleMaxLength }}</span>
                </div>
                <input v-model="form.title" :maxlength="titleMaxLength" type="text"
                  placeholder="Ex : Concert Jazz au clair de lune" class="field-input" />
                <p v-if="form.title.length > 0 && form.title.length < 3" class="hint-error">
                  <UIcon name="i-heroicons-exclamation-circle" class="w-3.5 h-3.5" /> Minimum 3 caractères
                </p>
              </div>
              <div class="field">
                <div class="flex items-center justify-between">
                  <label class="field-label">Description courte <span class="req">*</span></label>
                  <span class="counter">{{ form.description.length }}/{{ descriptionMaxLength }}</span>
                </div>
                <textarea v-model="form.description" :maxlength="descriptionMaxLength" rows="3"
                  placeholder="Résumez votre événement en quelques phrases percutantes…" class="field-input resize-none" />
                <p class="hint">Affiché dans les cartes et aperçus de l'événement.</p>
              </div>
              <div class="field">
                <div class="flex items-center justify-between">
                  <label class="field-label">Détails complets <span class="req">*</span></label>
                  <span class="counter">{{ form.details.length }}/{{ detailsMaxLength }}</span>
                </div>
                <textarea v-model="form.details" :maxlength="detailsMaxLength" rows="5"
                  placeholder="Programme, intervenants, informations pratiques, consignes d'accès…" class="field-input resize-none" />
                <p class="hint">Visible sur la page complète de l'événement.</p>
              </div>
              <div class="notice-orange">
                <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[#ea6c1e] flex-shrink-0 mt-0.5" />
                <p>Un titre accrocheur et une description claire augmentent jusqu'à <strong>3×</strong> le nombre de vues.</p>
              </div>
            </div>

            <!-- ── Étape 2 — Lieu & Date ── -->
            <div v-else-if="currentStep === 2" key="s2" class="p-6 space-y-5">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="field">
                  <label class="field-label">Lieu précis <span class="req">*</span></label>
                  <div class="relative">
                    <UIcon name="i-heroicons-building-office-2" class="field-icon" />
                    <input v-model="form.location" type="text"
                      placeholder="Ex : Palais des Congrès, Stade…" class="field-input pl-10" />
                  </div>
                </div>
                <div class="field">
                  <label class="field-label">Ville <span class="req">*</span></label>
                  <div class="relative ">
                    <select v-model="form.villeId" class="field-input pl-10 appearance-none">
                      <option value="" disabled>Sélectionnez une ville</option>
                      <option v-for="v in villes" :key="v.id" :value="v.id">{{ v.name }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="field-label">Date de l'événement <span class="req">*</span></label>
                <div class="relative">
                  <input v-model="form.eventDate" type="date" class="field-input pl-10"
                    :min="new Date().toISOString().split('T')[0]" />
                </div>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="field">
                  <label class="field-label">Heure de début <span class="req">*</span></label>
                  <div class="relative">
                    <input v-model="form.startDate" type="time" class="field-input pl-10" />
                  </div>
                </div>
                <div class="field">
                  <label class="field-label">Heure de fin <span class="text-[#c0b8ad] font-normal">(optionnel)</span></label>
                  <div class="relative">
                    <input v-model="form.endDate" type="time" class="field-input pl-10" />
                  </div>
                </div>
              </div>
              <Transition name="fade-in">
                <div v-if="form.eventDate" class="notice-indigo">
                  <div class="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
                    <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-[#5b47e0]" />
                  </div>
                  <div>
                    <p class="text-[13px] font-semibold text-[#5b47e0]">{{ formatDateLong(form.eventDate) }}</p>
                    <p v-if="form.startDate" class="text-[11.5px] text-[#5b47e0]/70 mt-0.5">
                      {{ form.startDate }}{{ form.endDate ? ` → ${form.endDate}` : '' }}
                      <span v-if="selectedVilleName"> · {{ selectedVilleName }}</span>
                    </p>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- ── Étape 3 — Catégorie & Prix ── -->
            <div v-else-if="currentStep === 3" key="s3" class="p-6 space-y-5">
              <div class="field">
                <label class="field-label">Catégorie <span class="req">*</span></label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
                  <button v-for="cat in categories" :key="cat.id" type="button"
                    @click="form.categoryId = cat.id"
                    :class="['flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left transition-all duration-150',
                      form.categoryId === cat.id
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-[0_0_0_2px_rgba(5,150,105,0.12)]'
                        : 'bg-[#faf8f5] border-[#ede8e0] text-[#8a8078] hover:border-[#c0b8ad]']">
                    <div :class="['w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                      form.categoryId === cat.id ? 'bg-emerald-100 border border-emerald-200' : 'bg-white border border-[#ede8e0]']">
                      <UIcon :name="cat.icon || 'i-heroicons-tag'" class="w-3.5 h-3.5"
                        :class="form.categoryId === cat.id ? 'text-emerald-600' : 'text-[#c0b8ad]'" />
                    </div>
                    <span class="text-[12.5px] font-medium">{{ cat.name }}</span>
                    <UIcon v-if="form.categoryId === cat.id" name="i-heroicons-check-circle"
                      class="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                  </button>
                </div>
              </div>
              <div class="h-px bg-[#ede8e0]" />
              <div class="field">
                <label class="field-label">Tarification <span class="req">*</span></label>
                <div class="grid grid-cols-2 gap-3 mt-1">
                  <button type="button" @click="form.priceType = 'FREE'"
                    :class="['flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150',
                      form.priceType === 'FREE'
                        ? 'bg-emerald-50 border-emerald-200 shadow-[0_0_0_2px_rgba(5,150,105,0.10)]'
                        : 'bg-[#faf8f5] border-[#ede8e0] hover:border-[#c0b8ad]']">
                    <div :class="['w-8 h-8 rounded-lg flex items-center justify-center',
                      form.priceType === 'FREE' ? 'bg-emerald-100 border border-emerald-200' : 'bg-white border border-[#ede8e0]']">
                      <UIcon name="i-heroicons-gift" class="w-4 h-4"
                        :class="form.priceType === 'FREE' ? 'text-emerald-600' : 'text-[#c0b8ad]'" />
                    </div>
                    <div>
                      <p class="text-[13px] font-bold" :class="form.priceType === 'FREE' ? 'text-emerald-700' : 'text-[#4a3f32]'">Gratuit</p>
                      <p class="text-[11px]" :class="form.priceType === 'FREE' ? 'text-emerald-600/70' : 'text-[#b0a898]'">Entrée libre</p>
                    </div>
                    <div v-if="form.priceType === 'FREE'"
                      class="ml-auto w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <UIcon name="i-heroicons-check" class="w-3 h-3 text-white" />
                    </div>
                  </button>
                  <button type="button" @click="form.priceType = 'PAID'"
                    :class="['flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150',
                      form.priceType === 'PAID'
                        ? 'bg-orange-50 border-orange-200 shadow-[0_0_0_2px_rgba(234,108,30,0.10)]'
                        : 'bg-[#faf8f5] border-[#ede8e0] hover:border-[#c0b8ad]']">
                    <div :class="['w-8 h-8 rounded-lg flex items-center justify-center',
                      form.priceType === 'PAID' ? 'bg-orange-100 border border-orange-200' : 'bg-white border border-[#ede8e0]']">
                      <UIcon name="i-heroicons-banknotes" class="w-4 h-4"
                        :class="form.priceType === 'PAID' ? 'text-[#ea6c1e]' : 'text-[#c0b8ad]'" />
                    </div>
                    <div>
                      <p class="text-[13px] font-bold" :class="form.priceType === 'PAID' ? 'text-[#ea6c1e]' : 'text-[#4a3f32]'">Payant</p>
                      <p class="text-[11px]" :class="form.priceType === 'PAID' ? 'text-[#ea6c1e]/70' : 'text-[#b0a898]'">Billet requis</p>
                    </div>
                    <div v-if="form.priceType === 'PAID'"
                      class="ml-auto w-5 h-5 rounded-full bg-[#ea6c1e] flex items-center justify-center">
                      <UIcon name="i-heroicons-check" class="w-3 h-3 text-white" />
                    </div>
                  </button>
                </div>
              </div>
              <Transition name="fade-in">
                <div v-if="form.priceType === 'PAID'" class="field">
                  <label class="field-label">Montant (FCFA) <span class="req">*</span></label>
                  <div class="relative">
                    <UIcon name="i-heroicons-banknotes" class="field-icon" />
                    <input v-model="form.price" type="number" min="0" step="500"
                      placeholder="Ex : 5000" class="field-input pl-10" />
                    <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#b0a898]">FCFA</span>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- ── Étape 4 — Médias & Récap ── -->
            <div v-else-if="currentStep === 4" key="s4" class="p-6 space-y-5">

              <!-- Upload images -->
              <div class="field">
                <label class="field-label">Photos de l'événement <span class="req">*</span> <span class="text-[#c0b8ad] font-normal">(max 3)</span></label>

                <!-- Aperçu images uploadées -->
                <div v-if="form.images.length > 0" class="grid grid-cols-3 gap-2.5 mb-3">
                  <div v-for="(img, idx) in form.images" :key="idx"
                    class="relative rounded-xl overflow-hidden aspect-square bg-[#f0ede8] group">
                    <img :src="imagePreviewUrl(img)" :alt="img.name"
                      class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
                                flex items-center justify-center">
                      <button @click="removeImageAt(idx)" type="button"
                        class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <UIcon name="i-heroicons-trash" class="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div class="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-white/90 flex items-center justify-center">
                      <span class="text-[9px] font-bold text-[#4a3f32]">{{ idx + 1 }}</span>
                    </div>
                  </div>
                </div>

                <!-- Zone upload -->
                <label v-if="form.images.length < 3" class="group cursor-pointer block">
                  <div class="border-2 border-dashed border-[#d4cec5] rounded-xl p-8 text-center
                              hover:border-[#ea6c1e] hover:bg-orange-50/30 transition-all duration-200">
                    <div class="w-12 h-12 rounded-2xl bg-[#f5f0e8] border border-[#ede8e0]
                                flex items-center justify-center mx-auto mb-3
                                group-hover:bg-orange-100 group-hover:border-orange-200 transition-all">
                      <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5 text-[#c0b8ad] group-hover:text-[#ea6c1e] transition-colors" />
                    </div>
                    <p class="text-[13px] font-semibold text-[#8a8078] group-hover:text-[#ea6c1e] transition-colors">
                      {{ form.images.length === 0 ? 'Ajouter des photos' : `Ajouter encore ${3 - form.images.length} photo${3 - form.images.length > 1 ? 's' : ''}` }}
                    </p>
                    <p class="text-[11.5px] text-[#b0a898] mt-1">PNG, JPG — max 10 MB par image</p>
                  </div>
                  <input type="file" accept="image/*" multiple class="hidden" @change="handleImageUpload" />
                </label>
              </div>

              <!-- Récap -->
              <div class="bg-[#faf8f5] rounded-2xl border border-[#ede8e0] overflow-hidden">
                <div class="px-4 py-3 border-b border-[#ede8e0] flex items-center gap-2">
                  <UIcon name="i-heroicons-clipboard-document-check" class="w-4 h-4 text-[#ea6c1e]" />
                  <p class="text-[12.5px] font-bold text-[#1a1612]">Récapitulatif</p>
                </div>
                <div class="p-4 space-y-2.5">
                  <div class="recap-row">
                    <span class="recap-label"><UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />Titre</span>
                    <span class="recap-value">{{ form.title || '—' }}</span>
                  </div>
                  <div class="recap-row">
                    <span class="recap-label"><UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />Lieu</span>
                    <span class="recap-value">{{ form.location || '—' }}{{ selectedVilleName ? `, ${selectedVilleName}` : '' }}</span>
                  </div>
                  <div class="recap-row">
                    <span class="recap-label"><UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5" />Date</span>
                    <span class="recap-value">{{ form.eventDate ? formatDateLong(form.eventDate) : '—' }}</span>
                  </div>
                  <div class="recap-row">
                    <span class="recap-label"><UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />Horaire</span>
                    <span class="recap-value">{{ form.startDate || '—' }}{{ form.endDate ? ` → ${form.endDate}` : '' }}</span>
                  </div>
                  <div class="recap-row">
                    <span class="recap-label"><UIcon name="i-heroicons-tag" class="w-3.5 h-3.5" />Catégorie</span>
                    <span class="recap-value">{{ selectedCategoryName || '—' }}</span>
                  </div>
                  <div class="recap-row">
                    <span class="recap-label"><UIcon name="i-heroicons-banknotes" class="w-3.5 h-3.5" />Prix</span>
                    <span class="recap-value">
                      <span v-if="form.priceType === 'FREE'"
                        class="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold">
                        Gratuit
                      </span>
                      <span v-else class="font-bold text-[#ea6c1e]">{{ form.price }} FCFA</span>
                    </span>
                  </div>
                  <div class="recap-row">
                    <span class="recap-label"><UIcon name="i-heroicons-photo" class="w-3.5 h-3.5" />Photos</span>
                    <span class="recap-value">{{ form.images.length }} / 3</span>
                  </div>
                </div>
              </div>

              <!-- Validation globale -->
              <div v-if="!isFormValid" class="notice-amber">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>Certains champs des étapes précédentes sont incomplets. Vérifiez avant de publier.</p>
              </div>
              <div v-else class="notice-green">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>Tout est en ordre ! Vous pouvez publier votre événement.</p>
              </div>
            </div>

          </Transition>
        </div>

        <!-- Footer desktop -->
        <div class="flex-shrink-0 px-6 py-4 border-t border-[#ede8e0] bg-[#faf8f5] flex items-center gap-3">
          <button @click="submit('DRAFT')" :disabled="isSavingDraft || !step1Valid"
            class="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl
                   bg-white border border-[#ede8e0] text-[12.5px] font-medium text-[#8a8078]
                   hover:border-[#c0b8ad] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <UIcon v-if="isSavingDraft" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
            <UIcon v-else name="i-heroicons-document-text" class="w-3.5 h-3.5" />
            Brouillon
          </button>
          <div class="flex items-center gap-2.5 ml-auto">
            <button v-if="currentStep > 1" @click="goPrev"
              class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                     bg-white border border-[#ede8e0] text-[13px] font-medium text-[#8a8078]
                     hover:border-[#c0b8ad] transition-all">
              <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
              Retour
            </button>
            <button v-if="currentStep < totalSteps" @click="goNext"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-bold text-white
                     transition-all"
              style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
              Continuer
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
            </button>
            <button v-else @click="submit('PUBLISHED')" :disabled="!isFormValid || isPublishing"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-bold text-white
                     shadow-[0_4px_18px_rgba(234,108,30,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
              <UIcon v-if="isPublishing" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
              <UIcon v-else name="i-heroicons-rocket-launch" class="w-4 h-4" />
              {{ isPublishing ? 'Publication…' : 'Publier l\'événement' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

/* ── Transitions étapes ── */
.step-fade-enter-active, .step-fade-leave-active { transition: all 0.2s ease; }
.step-fade-enter-from  { opacity: 0; transform: translateX(12px); }
.step-fade-leave-to    { opacity: 0; transform: translateX(-12px); }
.fade-in-enter-active  { transition: all 0.25s ease; }
.fade-in-enter-from    { opacity: 0; transform: translateY(6px); }

/* ── Champs ── */
.field       { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12.5px; font-weight: 600; color: #4a3f32; }
.field-input {
  width: 100%; padding: 10px 14px;
  background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px;
  font-size: 13.5px; color: #1a1612; font-family: 'Outfit', sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s; outline: none;
}
.field-input:focus { border-color: #ea6c1e; box-shadow: 0 0 0 3px rgba(234,108,30,0.1); }
.field-input::placeholder { color: #c0b8ad; }
.field-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; color: #c0b8ad; z-index: 1; pointer-events: none;
}

/* ── Utilitaires ── */
.req     { color: #f87171; }
.counter { font-size: 11px; color: #b0a898; }
.hint    { font-size: 11.5px; color: #c0b8ad; }
.hint-error { font-size: 11.5px; color: #f87171; display: flex; align-items: center; gap: 4px; }

/* ── Notices ── */
.notice-orange {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px; border-radius: 12px;
  background: #fff7ed; border: 1px solid #fed7aa;
  font-size: 12.5px; color: rgba(234,108,30,0.9); line-height: 1.5;
}
.notice-indigo {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px; border-radius: 12px;
  background: #eef2ff; border: 1px solid #c7d2fe;
}
.notice-amber {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px; border-radius: 12px;
  background: #fffbeb; border: 1px solid #fde68a;
  font-size: 12.5px; color: #92400e; line-height: 1.5;
}
.notice-green {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px; border-radius: 12px;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  font-size: 12.5px; color: #14532d; line-height: 1.5;
}

/* ── Récap ── */
.recap-row   { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.recap-label { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; color: #b0a898; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0; }
.recap-value { font-size: 13px; font-weight: 500; color: #1a1612; text-align: right; }
</style>
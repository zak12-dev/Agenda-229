<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'

definePageMeta({ layout: 'dashboard' })

const { session } = useAuth()
const toast = useToast()

// ── State ──
const scanning    = ref(false)
const scanResult  = ref<any>(null)
const scanError   = ref('')
const loading     = ref(false)
const manualToken = ref('')
const showManual  = ref(false)
const scanHistory = ref<any[]>([])
const videoEl     = ref<HTMLVideoElement | null>(null)
const hasCamera   = ref(true)

let qrScanner: any = null

// ── Init QrScanner ──
const initScanner = async () => {
  if (typeof window === 'undefined' || !videoEl.value) return

  try {
    // Import dynamique de qr-scanner (npm)
    const { default: QrScanner } = await import('qr-scanner')

    // Vérifier qu'une caméra est disponible
    const cams = await QrScanner.listCameras(true)
    if (!cams.length) {
      hasCamera.value = false
      scanError.value = 'Aucune caméra détectée sur cet appareil.'
      return
    }

    qrScanner = new QrScanner(
      videoEl.value,
      (result: any) => {
        const token = typeof result === 'string' ? result : result.data
        if (token) {
          stopScan()
          verifyToken(token)
        }
      },
      {
        preferredCamera: 'environment',      // caméra arrière sur mobile
        highlightScanRegion: true,            // zone de scan mise en évidence
        highlightCodeOutline: true,           // contour du QR détecté
        returnDetailedScanResult: true,
      }
    )
  } catch (err: any) {
    console.error('QrScanner init error:', err)
    scanError.value = 'Impossible d\'initialiser le scanner. Assurez-vous que le site est en HTTPS.'
  }
}

// ── Démarrer ──
const startScan = async () => {
  scanError.value = ''

  try {
    // 🔥 Étape 1 : forcer la permission caméra
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })

    // 🔥 IMPORTANT : libérer la caméra immédiatement
    stream.getTracks().forEach(track => track.stop())

    // Étape 2 : lancer le scanner
    await qrScanner.start()

    scanning.value = true

  } catch (err: any) {
    console.error('CAMERA ERROR:', err.name, err.message)

    if (!window.isSecureContext) {
      scanError.value = "Site non sécurisé (HTTPS requis)"
    } else if (err.name === 'NotAllowedError') {
      scanError.value = "Permission caméra refusée"
    } else {
      scanError.value = "Accès caméra bloqué par le navigateur"
    }
  }
}

// ── Arrêter ──
const stopScan = () => {
  qrScanner?.stop()
  scanning.value = false
}

// ── Vérification token ──
const verifyToken = async (token: string) => {
  if (!token.trim()) return
  loading.value = true
  scanResult.value = null
  scanError.value = ''
  try {
    const res: any = await $fetch('/api/ticket/verify', {
      method: 'POST',
      body: { token: token.trim(), userId: session.value?.user?.id },
    })
    scanResult.value = res
    scanHistory.value.unshift({ ...res, token: token.trim(), time: new Date() })
    if (scanHistory.value.length > 20) scanHistory.value.pop()

    if (res.success) {
      toast.add({ title: 'Ticket valide ✅', color: 'green', icon: 'i-heroicons-check-circle' })
    } else {
      toast.add({ title: res.message || 'Ticket invalide', color: 'red', icon: 'i-heroicons-x-circle' })
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.statusMessage || 'Erreur lors de la vérification'
    scanError.value = msg
    toast.add({ title: msg, color: 'red', icon: 'i-heroicons-x-circle' })
  } finally {
    loading.value = false
    manualToken.value = ''
  }
}

const handleManual = () => {
  if (!manualToken.value.trim()) return
  verifyToken(manualToken.value)
}

const resetScan = () => {
  scanResult.value = null
  scanError.value = ''
}

const formatTime = (d: Date) =>
  new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

onMounted(async () => {
  await nextTick()
  await initScanner()
})

onUnmounted(() => {
  qrScanner?.destroy()
  qrScanner = null
})
</script>

<template>
  <div class="bg-[#f5f3ef] min-h-screen font-outfit px-4 pt-6 pb-16 sm:px-6 sm:pb-10 overflow-y-auto">
    <div class="max-w-7xl mx-auto space-y-5 mb-10">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[10px] font-semibold text-[#ea6c1e] uppercase tracking-widest mb-0.5">Scanner</p>
          <h1 class="text-[22px] font-bold text-[#1a1612]">Vérification de tickets</h1>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#ede8e0]
                    shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <span class="w-2 h-2 rounded-full bg-emerald-400" />
          <span class="text-[11.5px] font-semibold text-[#4a3f32]">{{ scanHistory.length }} scans</span>
        </div>
      </div>

      <!-- Card scanner -->
      <div class="bg-white rounded-2xl border border-[#ede8e0] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">

        <!-- Header card -->
        <div class="px-5 py-4 border-b border-[#ede8e0] bg-[#faf8f5] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center"
              style="background: #ea6c1e12; border: 1.5px solid #ea6c1e25">
              <UIcon name="i-heroicons-qr-code" class="w-4 h-4" style="color: #ea6c1e" />
            </div>
            <p class="text-[14px] font-bold text-[#1a1612]">Scanner un QR code</p>
          </div>
          <button @click="showManual = !showManual"
            class="text-[11.5px] font-medium text-[#8a8078] hover:text-[#ea6c1e] transition-colors">
            {{ showManual ? 'Utiliser la caméra' : 'Saisie manuelle' }}
          </button>
        </div>

        <!-- Vue caméra -->
        <div v-if="!showManual" class="p-5 space-y-4">

          <!-- Viewfinder -->
          <div class="relative rounded-2xl overflow-hidden bg-[#1a1612]"
            style="aspect-ratio: 4/3">

            <!-- Élément vidéo — QrScanner s'y attache -->
            <video ref="videoEl"
              class="w-full h-full object-cover"
              style="display: block"
              playsinline
              muted
            />

            <!-- Overlay idle (avant démarrage) -->
            <div v-if="!scanning && !loading"
              class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1a1612]">
              <div class="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20
                          flex items-center justify-center">
                <UIcon name="i-heroicons-qr-code" class="w-10 h-10 text-white/40" />
              </div>
              <p class="text-[13px] text-white/50">Appuyez sur "Démarrer" pour scanner</p>
            </div>

            <!-- Overlay chargement vérification -->
            <div v-if="loading"
              class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <svg class="w-8 h-8 animate-spin text-[#ea6c1e]" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p class="text-[13px] text-white">Vérification en cours…</p>
            </div>
          </div>

          <!-- Message d'erreur -->
          <div v-if="scanError"
            class="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100">
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p class="text-[12.5px] text-red-600 leading-relaxed">{{ scanError }}</p>
          </div>

          <!-- Boutons -->
          <div class="flex gap-2.5">
            <button v-if="!scanning" @click="startScan"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                     text-white text-[13.5px] font-bold transition-all
                     shadow-[0_4px_18px_rgba(234,108,30,0.28)] hover:opacity-90"
              style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
              <UIcon name="i-heroicons-camera" class="w-4 h-4" />
              Démarrer le scan
            </button>
            <button v-else @click="stopScan"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                     bg-[#faf8f5] border border-[#ede8e0] text-[13.5px] font-semibold
                     text-[#4a3f32] hover:border-red-200 hover:text-red-500 transition-all">
              <UIcon name="i-heroicons-stop" class="w-4 h-4" />
              Arrêter
            </button>
          </div>
        </div>

        <!-- Saisie manuelle -->
        <div v-else class="p-5 space-y-3">
          <div class="field">
            <label class="field-label">Token du ticket</label>
            <div class="relative">
              <UIcon name="i-heroicons-key"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b8ad] pointer-events-none" />
              <input v-model="manualToken" type="text" placeholder="Collez le token ici…"
                @keydown.enter="handleManual"
                class="field-input pl-10 font-mono" />
            </div>
          </div>
          <button @click="handleManual" :disabled="!manualToken.trim() || loading"
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                   text-white text-[13.5px] font-bold transition-all
                   shadow-[0_4px_18px_rgba(234,108,30,0.28)]
                   hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style="background: linear-gradient(135deg, #ea6c1e, #5b47e0)">
            <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
            Vérifier le ticket
          </button>
        </div>
      </div>

      <!-- Résultat du scan -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100">
        <div v-if="scanResult"
          class="bg-white rounded-2xl border overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
          :class="scanResult.success ? 'border-emerald-200' : 'border-red-200'">

          <!-- Bandeau résultat -->
          <div class="px-5 py-4 flex items-center gap-3"
            :class="scanResult.success ? 'bg-emerald-50' : 'bg-red-50'">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="scanResult.success
                ? 'bg-emerald-100 border border-emerald-200'
                : 'bg-red-100 border border-red-200'">
              <UIcon
                :name="scanResult.success ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                class="w-5 h-5"
                :class="scanResult.success ? 'text-emerald-600' : 'text-red-500'" />
            </div>
            <div>
              <p class="text-[14px] font-bold"
                :class="scanResult.success ? 'text-emerald-700' : 'text-red-600'">
                {{ scanResult.success ? 'Ticket valide' : 'Ticket invalide' }}
              </p>
              <p class="text-[12px]"
                :class="scanResult.success ? 'text-emerald-600/70' : 'text-red-500/70'">
                {{ scanResult.message }}
              </p>
            </div>
          </div>

          <!-- Détails participant + événement -->
          <div v-if="scanResult.success && scanResult.data" class="p-5 space-y-3">
            <div class="flex items-center gap-3 p-3.5 rounded-xl bg-[#faf8f5] border border-[#ede8e0]">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100
                          flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-user" class="w-4 h-4 text-[#5b47e0]" />
              </div>
              <div>
                <p class="text-[10px] font-semibold text-[#b0a898] uppercase tracking-wide mb-0.5">Participant</p>
                <p class="text-[13.5px] font-bold text-[#1a1612]">{{ scanResult.data.user.name }}</p>
                <p class="text-[11.5px] text-[#8a8078]">{{ scanResult.data.user.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3.5 rounded-xl bg-[#faf8f5] border border-[#ede8e0]">
              <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100
                          flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-[#ea6c1e]" />
              </div>
              <div>
                <p class="text-[10px] font-semibold text-[#b0a898] uppercase tracking-wide mb-0.5">Événement</p>
                <p class="text-[13.5px] font-bold text-[#1a1612]">{{ scanResult.data.event.title }}</p>
                <p class="text-[11.5px] text-[#8a8078]">{{ scanResult.data.event.startDate }}</p>
              </div>
            </div>
          </div>

          <!-- Bouton nouveau scan -->
          <div class="px-5 pb-5">
            <button @click="resetScan(); startScan()"
              class="w-full py-2.5 rounded-xl bg-[#faf8f5] border border-[#ede8e0]
                     text-[13px] font-semibold text-[#4a3f32]
                     hover:border-[#ea6c1e]/40 hover:text-[#ea6c1e] transition-all">
              Scanner un autre ticket
            </button>
          </div>
        </div>
      </Transition>

      <!-- Historique -->
      <div v-if="scanHistory.length > 0"
        class="bg-white rounded-2xl border border-[#ede8e0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div class="px-5 py-3.5 border-b border-[#ede8e0] bg-[#faf8f5] flex items-center justify-between">
          <p class="text-[13px] font-bold text-[#1a1612]">Historique de session</p>
          <button @click="scanHistory = []"
            class="text-[11.5px] text-[#b0a898] hover:text-red-400 transition-colors">
            Effacer
          </button>
        </div>
        <div class="divide-y divide-[#ede8e0]">
          <div v-for="(h, i) in scanHistory" :key="i"
            class="flex items-center gap-3 px-5 py-3">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="h.success
                ? 'bg-emerald-50 border border-emerald-100'
                : 'bg-red-50 border border-red-100'">
              <UIcon
                :name="h.success ? 'i-heroicons-check' : 'i-heroicons-x-mark'"
                class="w-3.5 h-3.5"
                :class="h.success ? 'text-emerald-500' : 'text-red-400'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[12.5px] font-semibold text-[#1a1612] truncate">
                {{ h.success ? h.data?.user?.name : h.message }}
              </p>
              <p class="text-[11px] text-[#b0a898]">{{ formatTime(h.time) }}</p>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              :class="h.success
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-red-50 text-red-500 border border-red-100'">
              {{ h.success ? 'VALIDE' : 'REFUSÉ' }}
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: #4a3f32; }
.field-input {
  width: 100%; padding: 11px 14px;
  background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px;
  font-size: 13.5px; color: #1a1612; font-family: 'Outfit', sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s; outline: none;
}
.field-input:focus {
  border-color: #ea6c1e;
  box-shadow: 0 0 0 3px rgba(234,108,30,0.1);
}

/* Styles injectés par QrScanner pour la zone de scan */
:deep(video) { width: 100% !important; height: 100% !important; object-fit: cover !important; }
:deep(.qr-scanner-region-highlight) { border-color: #ea6c1e !important; }
</style>
<script setup lang="ts">
import moderator from '../../../middleware/moderator'
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'

definePageMeta({
  name: 'admin-profile',
  layout: 'dashboard',
  middleware: [moderator]
})

const { logout } = useAuth()

type UserRole = 'ADMIN' | 'ORGANIZER'

const roleMap: Record<number, UserRole> = {
  1: 'ADMIN',
  2: 'ORGANIZER',
}

const user = reactive({
  name: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  avatar: '',
  joinedDate: '',
  role: 'USER' as UserRole,
})

const activeTab = ref<'profile' | 'security'>('profile')
const isEditing = ref(false)
const editForm = reactive({ ...user })
const saveLoading = ref(false)
const passwordLoading = ref(false)
const saveSuccess = ref(false)
const passwordSuccess = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordError = ref('')

const enableEdit = () => {
  Object.assign(editForm, user)
  isEditing.value = true
}

const saveProfile = async () => {
  saveLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 600))
    Object.assign(user, editForm)
    isEditing.value = false
    saveSuccess.value = true
    setTimeout(() => (saveSuccess.value = false), 3000)
  } catch (err) {
    console.error(err)
  } finally {
    saveLoading.value = false
  }
}

const updatePassword = async () => {
  passwordError.value = ''
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }
  if (passwordForm.newPassword.length < 8) {
    passwordError.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }
  passwordLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 600))
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordSuccess.value = true
    setTimeout(() => (passwordSuccess.value = false), 3000)
  } catch (err) {
    console.error(err)
  } finally {
    passwordLoading.value = false
  }
}

const handleLogout = async () => {
  if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
    await logout()
    navigateTo('/auth/login')
  }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const fetchUser = async () => {
  try {
    const res = await fetch('/api/me')
    if (!res.ok) throw new Error('Erreur lors de la récupération du profil')
    const data = await res.json()
    const u = data.user
    user.name = u.name || ''
    user.email = u.email || ''
    user.phone = '+229 99 99 99 99'
    user.location = 'Cotonou, Bénin'
    user.bio = u.bio || "Organisateur d'événements passionné par la culture et l'art."
    user.avatar = u.image || ''
    user.joinedDate = u.createdAt || new Date().toISOString()
    Object.assign(editForm, user)
  } catch (err) {
    console.error(err)
  }
}

const getRoleBadge = (role: UserRole) => {
  const badges = {
    ADMIN: {
      label: 'Administrateur',
      color: 'from-red-600 to-pink-600',
      icon: 'i-heroicons-shield-check',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
    },
    ORGANIZER: {
      label: 'Organisateur',
      color: 'from-orange-600 to-indigo-600',
      icon: 'i-heroicons-star',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
    },
    USER: {
      label: 'Utilisateur',
      color: 'from-blue-600 to-cyan-600',
      icon: 'i-heroicons-user',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
    },
  }
  return badges[role] || badges.USER
}

const getAvatarGradient = (name: string) => {
  const colors = [
    ['#ea6c1e', '#f59e0b'], ['#5b47e0', '#818cf8'], ['#059669', '#34d399'],
    ['#dc2626', '#f87171'], ['#0891b2', '#67e8f9'], ['#7c3aed', '#c4b5fd'],
  ]
  const i = (name.charCodeAt(0) || 0) % colors.length
  return `linear-gradient(135deg, ${colors[i][0]}, ${colors[i][1]})`
}

onMounted(fetchUser)
</script>

<template>
  <div class="bg-[#f5f3ef] px-4 pt-4 pb-32 sm:px-6 sm:pb-12 font-outfit w-full min-h-screen overflow-y-auto mb-10">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-3 gap-5">

        <!-- ══════════════════════════
             SIDEBAR
        ══════════════════════════ -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl border border-[#ede8e0] p-5 sticky top-6
                      shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

            <!-- Avatar + identité -->
            <div class="text-center mb-5 pb-5 border-b border-[#ede8e0]">
              <div
                class="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center
                       text-white text-2xl font-bold shadow-md overflow-hidden"
                :style="`background: ${getAvatarGradient(user.name)}`"
              >
                <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
                <span v-else>{{ user.name.charAt(0).toUpperCase() }}</span>
              </div>
              <h2 class="text-[15px] font-bold text-[#1a1612] leading-tight">{{ user.name }}</h2>
              <p class="text-[12px] text-[#b0a898] mt-0.5 truncate">{{ user.email }}</p>

              <!-- Badge rôle -->
              <div class="mt-3 inline-flex">
                <span
                  :class="[
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
                    getRoleBadge(user.role).bgColor,
                    getRoleBadge(user.role).textColor,
                  ]"
                >
                  <UIcon :name="getRoleBadge(user.role).icon" class="w-4 h-4" />
                  {{ getRoleBadge(user.role).label }}
                </span>
              </div>
            </div>

            <!-- Nav tabs -->
            <div class="space-y-1 mb-5 pb-5 border-b border-[#ede8e0]">
              <button
                @click="activeTab = 'profile'; isEditing = false"
                :class="[
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all',
                  activeTab === 'profile'
                    ? 'bg-white shadow ring-1 ring-[#ede8e0] text-[#1a1612]'
                    : 'text-[#8a8078] hover:bg-[#f5f0e8]',
                ]"
              >
                <div :class="[
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                  activeTab === 'profile' ? 'bg-orange-50' : 'bg-[#f5f0e8]'
                ]">
                  <UIcon name="i-heroicons-user" :class="['w-4 h-4', activeTab === 'profile' ? 'text-[#ea6c1e]' : 'text-[#c0b8ad]']" />
                </div>
                Profil
              </button>

                <!-- <button
                @click="activeTab = 'security'; isEditing = false"
                :class="[
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all',
                  activeTab === 'security'
                    ? 'bg-white shadow ring-1 ring-[#ede8e0] text-[#1a1612]'
                    : 'text-[#8a8078] hover:bg-[#f5f0e8]',
                ]"
              >
                <div :class="[
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                  activeTab === 'security' ? 'bg-indigo-50' : 'bg-[#f5f0e8]'
                ]">
                  <UIcon name="i-heroicons-lock-closed" :class="['w-4 h-4', activeTab === 'security' ? 'text-indigo-500' : 'text-[#c0b8ad]']" />
                </div>
                Sécurité
              </button>-->
            </div>

            <!-- Infos rapides -->
            <div class="space-y-3 mb-5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5 text-[#ea6c1e]" />
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-medium text-[#b0a898] uppercase tracking-wide">Membre depuis</p>
                  <p class="text-[12.5px] font-semibold text-[#1a1612] truncate">{{ formatDate(user.joinedDate) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-medium text-[#b0a898] uppercase tracking-wide">Localisation</p>
                  <p class="text-[12.5px] font-semibold text-[#1a1612] truncate">{{ user.location }}</p>
                </div>
              </div>
            </div>

            <!-- Déconnexion -->
            <button
              @click="handleLogout"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-red-50 border border-red-100 text-red-500 text-[13px] font-medium
                     rounded-xl hover:bg-red-100 hover:border-red-200 transition-all"
            >
              <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>

        <!-- ══════════════════════════
             MAIN CONTENT
        ══════════════════════════ -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden
                      shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

            <!-- Header panel -->
            <div class="px-6 py-4 border-b border-[#ede8e0] bg-[#faf8f5] flex items-center justify-between">
              <div>
                <p class="text-[14px] font-bold text-[#1a1612]">
                  {{ activeTab === 'profile' ? 'Informations personnelles' : 'Sécurité du compte' }}
                </p>
                <p class="text-[11.5px] text-[#b0a898] mt-0.5">
                  {{ activeTab === 'profile' ? 'Consultez ou modifiez vos données' : 'Gérez votre mot de passe et vos accès' }}
                </p>
              </div>
                <!-- <button
                v-if="activeTab === 'profile' && !isEditing"
                @click="enableEdit"
                class="btn-primary px-4 py-2 text-[12.5px]"
              >
                <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
                Modifier
              </button>-->
            </div>

            <div class="p-6">

              <!-- ── ONGLET PROFIL ── -->
              <div v-if="activeTab === 'profile'">

                <!-- Toast succès -->
                <Transition name="fade">
                  <div v-if="saveSuccess"
                    class="mb-5 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[13px] text-emerald-700">
                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4 flex-shrink-0" />
                    Profil mis à jour avec succès
                  </div>
                </Transition>

                <!-- Mode lecture -->
                <div v-if="!isEditing" class="space-y-5">
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="info-block">
                      <p class="info-label">Nom complet</p>
                      <p class="info-value">{{ user.name || '—' }}</p>
                    </div>
                    <div class="info-block">
                      <p class="info-label">Email</p>
                      <p class="info-value">{{ user.email || '—' }}</p>
                    </div>
                    <div class="info-block">
                      <p class="info-label">Téléphone</p>
                      <p class="info-value">{{ user.phone || '—' }}</p>
                    </div>
                    <div class="info-block">
                      <p class="info-label">Ville</p>
                      <p class="info-value">{{ user.location || '—' }}</p>
                    </div>
                  </div>

                  <div class="info-block">
                    <p class="info-label">Biographie</p>
                    <p class="info-value text-[13px] leading-relaxed">{{ user.bio || '—' }}</p>
                  </div>
                </div>

                <!-- Mode édition -->
                <div v-else class="space-y-4">
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="field">
                      <label class="field-label">Nom complet <span class="text-red-400">*</span></label>
                      <input v-model="editForm.name" type="text" class="field-input" placeholder="Votre nom" />
                    </div>
                    <div class="field">
                      <label class="field-label">Email <span class="text-red-400">*</span></label>
                      <input v-model="editForm.email" type="email" class="field-input" placeholder="votre@email.com" />
                    </div>
                    <div class="field">
                      <label class="field-label">Téléphone</label>
                      <input v-model="editForm.phone" type="tel" class="field-input" placeholder="+229 xx xx xx xx" />
                    </div>
                    <div class="field">
                      <label class="field-label">Ville</label>
                      <input v-model="editForm.location" type="text" class="field-input" placeholder="Ex: Cotonou, Bénin" />
                    </div>
                  </div>

                  <div class="field">
                    <label class="field-label">Biographie</label>
                    <textarea v-model="editForm.bio" rows="3" class="field-input resize-none"
                      placeholder="Quelques mots sur vous…" />
                  </div>

                  <div class="flex justify-end gap-2.5 pt-2">
                    <button @click="isEditing = false" class="btn-ghost">Annuler</button>
                    <button @click="saveProfile" :disabled="saveLoading"
                      class="btn-primary px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      <UIcon v-if="saveLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                      <UIcon v-else name="i-heroicons-check" class="w-4 h-4" />
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>

              <!-- ── ONGLET SÉCURITÉ ── -->
              <div v-if="activeTab === 'security'" class="space-y-6">

                <!-- Toast succès -->
                <Transition name="fade">
                  <div v-if="passwordSuccess"
                    class="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[13px] text-emerald-700">
                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4 flex-shrink-0" />
                    Mot de passe mis à jour avec succès
                  </div>
                </Transition>

                <!-- Formulaire mot de passe -->
                <div class="space-y-4 max-w-sm">
                  <div class="field">
                    <label class="field-label">Mot de passe actuel <span class="text-red-400">*</span></label>
                    <input v-model="passwordForm.currentPassword" type="password"
                      placeholder="••••••••" class="field-input" />
                  </div>
                  <div class="field">
                    <label class="field-label">Nouveau mot de passe <span class="text-red-400">*</span></label>
                    <input v-model="passwordForm.newPassword" type="password"
                      placeholder="••••••••" class="field-input" />
                    <p class="text-[11px] text-[#b0a898] mt-1">Minimum 8 caractères</p>
                  </div>
                  <div class="field">
                    <label class="field-label">Confirmer le mot de passe <span class="text-red-400">*</span></label>
                    <input v-model="passwordForm.confirmPassword" type="password"
                      placeholder="••••••••" class="field-input" />
                  </div>

                  <!-- Erreur -->
                  <Transition name="fade">
                    <div v-if="passwordError"
                      class="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[12.5px] text-red-600">
                      <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 flex-shrink-0" />
                      {{ passwordError }}
                    </div>
                  </Transition>

                  <!-- Info conseils -->
                  <div class="bg-[#faf8f5] border border-[#ede8e0] rounded-xl p-4">
                    <div class="flex gap-3">
                      <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[#ea6c1e] flex-shrink-0 mt-0.5" />
                      <div>
                        <p class="text-[12px] font-semibold text-[#4a3f32] mb-1">Conseils de sécurité</p>
                        <p class="text-[11.5px] text-[#8a8078] leading-relaxed">
                          Utilisez un mot de passe unique avec des lettres, chiffres et symboles. Ne le partagez jamais.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button @click="updatePassword" :disabled="passwordLoading"
                    class="btn-primary px-5 py-2.5 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <UIcon v-if="passwordLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                    <UIcon v-else name="i-heroicons-lock-closed" class="w-4 h-4" />
                    Mettre à jour le mot de passe
                  </button>
                </div>

                <!-- Options de sécurité -->
                <div class="pt-5 border-t border-[#ede8e0]">
                  <p class="text-[12.5px] font-semibold text-[#1a1612] mb-3">Options de sécurité</p>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between px-4 py-3 bg-[#faf8f5] border border-[#ede8e0] rounded-xl">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                          <UIcon name="i-heroicons-device-phone-mobile" class="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div>
                          <p class="text-[13px] font-medium text-[#1a1612]">Double authentification</p>
                          <p class="text-[11px] text-[#b0a898]">Sécurisez votre compte</p>
                        </div>
                      </div>
                      <button class="px-3 py-1.5 text-[11.5px] font-semibold text-[#ea6c1e]
                                     bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors">
                        Activer
                      </button>
                    </div>

                    <div class="flex items-center justify-between px-4 py-3 bg-[#faf8f5] border border-[#ede8e0] rounded-xl">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <p class="text-[13px] font-medium text-[#1a1612]">Sessions actives</p>
                          <p class="text-[11px] text-[#b0a898]">Gérez vos connexions ouvertes</p>
                        </div>
                      </div>
                      <button class="px-3 py-1.5 text-[11.5px] font-semibold text-[#8a8078]
                                     bg-white border border-[#ede8e0] rounded-lg hover:bg-[#f5f0e8] transition-colors">
                        Voir
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Info blocks (mode lecture) ── */
.info-block { padding: 12px 14px; background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px; }
.info-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #b0a898; margin-bottom: 4px; }
.info-value { font-size: 13.5px; font-weight: 600; color: #1a1612; }

/* ── Champs ── */
.field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 12.5px; font-weight: 600; color: #4a3f32; }
.field-input {
  width: 100%; padding: 10px 14px;
  background: #faf8f5; border: 1px solid #ede8e0; border-radius: 12px;
  font-size: 13.5px; color: #1a1612; font-family: 'Outfit', sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s; outline: none;
}
.field-input:focus { border-color: #ea6c1e; box-shadow: 0 0 0 3px rgba(234,108,30,0.1); }
.field-input::placeholder { color: #c0b8ad; }

/* ── Boutons ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px; border-radius: 12px;
  font-size: 13px; font-weight: 600; color: white;
  background: linear-gradient(135deg, #ea6c1e, #5b47e0);
  transition: opacity 0.15s; font-family: 'Outfit', sans-serif;
  box-shadow: 0 4px 14px rgba(234,108,30,0.2); cursor: pointer; border: none;
  padding: 8px 16px;
}
.btn-primary:hover:not(:disabled) { opacity: 0.9; }

.btn-ghost {
  padding: 9px 18px; border-radius: 12px; font-size: 13px; font-weight: 500;
  color: #8a8078; background: white; border: 1px solid #ede8e0;
  transition: background 0.15s; font-family: 'Outfit', sans-serif; cursor: pointer;
}
.btn-ghost:hover { background: #f5f0e8; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cec5; border-radius: 10px; }
</style>
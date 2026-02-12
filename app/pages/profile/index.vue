<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'




const { logout } = useAuth()

type UserRole = 'ADMIN' | 'ORGANIZER' | 'USER'

const roleMap: Record<number, UserRole> = {
  1: 'ADMIN',
  2: 'ORGANIZER',
  3: 'USER',
}

// L'objet user réactif
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

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Activer le mode édition
const enableEdit = () => {
  Object.assign(editForm, user)
  isEditing.value = true
}

// Sauvegarder le profil
const saveProfile = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    Object.assign(user, editForm)
    isEditing.value = false
    alert('Profil mis à jour ✅')
  } catch (err) {
    alert('Erreur lors de la mise à jour')
  }
}

// Mettre à jour le mot de passe
const updatePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }

  if (passwordForm.newPassword.length < 8) {
    alert('Le mot de passe doit contenir au moins 8 caractères')
    return
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    alert('Mot de passe mis à jour ✅')
  } catch (err) {
    alert('Erreur lors de la mise à jour du mot de passe')
  }
}

// Déconnexion
const handleLogout = async () => {
  if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
    await logout()
    navigateTo('/auth/login')
  }
}

// Formater la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Récupération de l'utilisateur depuis l'API
const fetchUser = async () => {
  try {
    const res = await fetch('/api/me')

    if (!res.ok) throw new Error('Erreur lors de la récupération du profil')
    const data = await res.json()
    console.log('USER DATA', data)

    const u = data.user

    user.name = u.name || ''
    user.email = u.email || ''
    user.phone = '+229 99 99 99 99'
    user.location = 'Cotonou, Bénin'
    user.bio = u.bio || "Organisateur d'événements passionné par la culture et l'art."
    user.avatar = u.image || ''
    user.joinedDate = u.createdAt || new Date().toISOString()
    user.role = roleMap[u.roleId] || 'USER'

    Object.assign(editForm, user)
  } catch (err) {
    console.error(err)
    alert('Impossible de charger le profil')
  }
}

// Fonction pour obtenir les infos du badge selon le rôle
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

onMounted(() => {
  fetchUser()
})
</script>

<template>
  
  <div class="bg-gradient-to-br from-gray-200 to-orange-50/30 p-6">
    <div class="max-w-6xl mx-auto mt-20 overflow-auto">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl sm:text-5xl font-light text-gray-900 mb-4">Mon profil</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
            <!-- Avatar -->
            <div class="text-center mb-6">
              <div
                class="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-orange-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg"
              >
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <h2 class="text-xl font-bold text-gray-900">{{ user.name }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ user.email }}</p>

              <!-- 👇 Badge de rôle -->
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

            <!-- Navigation Tabs -->
            <div class="space-y-2 mb-6 pb-6 border-b border-gray-200">
              <button
                @click="
                  activeTab = 'profile';
                  isEditing = false
                "
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
                  activeTab === 'profile'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50',
                ]"
              >
                <UIcon name="i-heroicons-user" class="w-5 h-5" />
                <span>Profil</span>
              </button>

              <button
                @click="
                  activeTab = 'security';
                  isEditing = false
                "
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
                  activeTab === 'security'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50',
                ]"
              >
                <UIcon name="i-heroicons-lock-closed" class="w-5 h-5" />
                <span>Sécurité</span>
              </button>
            </div>

            <!-- Stats -->
            <div class="space-y-4 mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500">Membre depuis</p>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ formatDate(user.joinedDate) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500">Localisation</p>
                  <p class="text-sm font-semibold text-gray-900">{{ user.location }}</p>
                </div>
              </div>
            </div>

            <!-- 👇 Bouton de déconnexion -->
            <div class="pt-6 border-t border-gray-200">
              <button
                @click="handleLogout"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-100 hover:border-red-300 transition-all"
              >
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl border border-gray-200 p-8">
            <!-- PROFILE TAB -->
            <div v-if="activeTab === 'profile'">
              <!-- View Mode -->
              <div v-if="!isEditing" class="space-y-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-bold text-gray-900">Informations personnelles</h3>
                  <button
                    @click="enableEdit"
                    class="px-4 py-2 bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                    Modifier
                  </button>
                </div>

                <div class="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label class="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                      >Nom complet</label
                    >
                    <p class="text-gray-900 font-medium mt-1">{{ user.name }}</p>
                  </div>

                  <div>
                    <label class="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                      >Email</label
                    >
                    <p class="text-gray-900 font-medium mt-1">{{ user.email }}</p>
                  </div>

                  <div>
                    <label class="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                      >Téléphone</label
                    >
                    <p class="text-gray-900 font-medium mt-1">{{ user.phone }}</p>
                  </div>

                  <div>
                    <label class="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                      >Ville</label
                    >
                    <p class="text-gray-900 font-medium mt-1">{{ user.location }}</p>
                  </div>

                  <!-- 👇 Rôle 
                  <div>
                    <label class="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                      >Rôle</label
                    >
                    <div class="mt-1">
                      <span
                        :class="[
                          'inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold',
                          getRoleBadge(user.role).bgColor,
                          getRoleBadge(user.role).textColor,
                        ]"
                      >
                        <UIcon :name="getRoleBadge(user.role).icon" class="w-4 h-4" />
                        {{ getRoleBadge(user.role).label }}
                      </span>
                    </div>
                  </div>-->
                </div>
              </div>

              <!-- Edit Mode -->
              <div v-else class="space-y-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-bold text-gray-900">Modifier mes informations</h3>
                </div>

                <div class="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                      Nom complet <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="editForm.name"
                      type="text"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                      Email <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="editForm.email"
                      type="email"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Téléphone</label>
                    <input
                      v-model="editForm.phone"
                      type="tel"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Ville</label>
                    <input
                      v-model="editForm.location"
                      type="text"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                  <button
                    @click="isEditing = false"
                    class="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    @click="saveProfile"
                    class="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-500/30"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>

            <!-- SECURITY TAB -->
            <div v-if="activeTab === 'security'">
              <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900">Changer le mot de passe</h3>
                    <p class="text-sm text-gray-600">
                      Mettez à jour votre mot de passe régulièrement
                    </p>
                  </div>
                </div>

                <div class="space-y-4 max-w-lg">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                      Mot de passe actuel <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="passwordForm.currentPassword"
                      type="password"
                      placeholder="••••••••"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                      Nouveau mot de passe <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      placeholder="••••••••"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p class="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">
                      Confirmer le mot de passe <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Info Box -->
                  <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div class="flex gap-3">
                      <UIcon
                        name="i-heroicons-information-circle"
                        class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      />
                      <div class="text-sm text-blue-700">
                        <p class="font-medium mb-1">Conseils de sécurité</p>
                        <ul class="list-disc list-inside space-y-1 text-xs">
                          <li>Utilisez un mot de passe unique</li>
                          <li>Mélangez lettres, chiffres et symboles</li>
                          <li>Ne partagez jamais votre mot de passe</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div class="pt-4">
                    <button
                      @click="updatePassword"
                      class="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-indigo-600 hover:from-orange-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-500/30"
                    >
                      Mettre à jour le mot de passe
                    </button>
                  </div>
                </div>

                <!-- Additional Security Options -->
                <div class="pt-6 border-t border-gray-200">
                  <h4 class="font-bold text-gray-900 mb-4">Options de sécurité</h4>

                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div class="flex items-center gap-3">
                        <UIcon
                          name="i-heroicons-device-phone-mobile"
                          class="w-5 h-5 text-gray-600"
                        />
                        <div>
                          <p class="font-medium text-gray-900">Authentification à deux facteurs</p>
                          <p class="text-xs text-gray-500">Activez la double authentification</p>
                        </div>
                      </div>
                      <button
                        class="px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                      >
                        Activer
                      </button>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div class="flex items-center gap-3">
                        <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-gray-600" />
                        <div>
                          <p class="font-medium text-gray-900">Sessions actives</p>
                          <p class="text-xs text-gray-500">Gérez vos sessions ouvertes</p>
                        </div>
                      </div>
                      <button
                        class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      >
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

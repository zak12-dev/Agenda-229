<script setup lang="ts">
import { ref } from 'vue'

const activeSection = ref('introduction')

const sections = [
  { id: 'introduction', title: 'Introduction', icon: 'i-heroicons-document-text' },
  { id: 'definitions', title: 'Définitions', icon: 'i-heroicons-book-open' },
  { id: 'acceptation', title: 'Acceptation', icon: 'i-heroicons-check-circle' },
  { id: 'services', title: 'Services proposés', icon: 'i-heroicons-sparkles' },
  { id: 'compte', title: 'Compte utilisateur', icon: 'i-heroicons-user-circle' },
  { id: 'organisateurs', title: 'Organisateurs', icon: 'i-heroicons-megaphone' },
  { id: 'paiements', title: 'Paiements', icon: 'i-heroicons-credit-card' },
  { id: 'propriete', title: 'Propriété intellectuelle', icon: 'i-heroicons-shield-check' },
  { id: 'responsabilite', title: 'Responsabilité', icon: 'i-heroicons-exclamation-triangle' },
  { id: 'donnees', title: 'Données personnelles', icon: 'i-heroicons-lock-closed' },
  { id: 'modification', title: 'Modification', icon: 'i-heroicons-arrow-path' },
  { id: 'contact', title: 'Contact', icon: 'i-heroicons-envelope' }
]

const scrollToSection = (id: string) => {
  activeSection.value = id
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Date actuelle
const lastUpdate = new Date()

// Formatage en français
const formattedLastUpdate = lastUpdate.toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: 'long', // affiche "février" au lieu de "02"
  year: 'numeric',
})

console.log(formattedLastUpdate)</script>

<template>
  <div class="min-h-screen bg-gray-50 mt-14">
    <div class="max-w-7xl mx-auto px-6 py-12">
      
      <div class="grid lg:grid-cols-4 gap-8 ">
        
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1 ">
          <div class="lg:sticky lg:top-6 space-y-6">
            
            <!-- Header Card -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 ">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-purple-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Conditions d'utilisation</h2>
              <p class="text-sm text-gray-600">Dernière mise à jour : {{ lastUpdate }}</p>
            </div>

            <!-- Navigation -->
            <nav class="bg-white rounded-xl border border-gray-200 p-4">
              <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 px-2">Sommaire</p>
              <div class="space-y-1">
                <button
                  v-for="section in sections"
                  :key="section.id"
                  @click="scrollToSection(section.id)"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left',
                    activeSection === section.id
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  <UIcon :name="section.icon" class="w-4 h-4 flex-shrink-0" />
                  <span>{{ section.title }}</span>
                </button>
              </div>
            </nav>

          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl border border-gray-200 p-8 lg:p-12 space-y-12">
            
            <!-- Introduction -->
            <section id="introduction" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-purple-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Introduction</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  Bienvenue sur <strong>WeLoveEvent</strong>, la plateforme dédiée à la découverte, la création et la gestion d'événements au Bénin. En accédant et en utilisant notre plateforme, vous acceptez de respecter les présentes conditions d'utilisation.
                </p>
                <p class="text-gray-700 leading-relaxed mt-4">
                  Ces conditions régissent votre utilisation de nos services, que vous soyez un simple visiteur, un utilisateur inscrit ou un organisateur d'événements.
                </p>
              </div>
            </section>

            <!-- Définitions -->
            <section id="definitions" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-blue-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Définitions</h2>
              </div>
              <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="font-semibold text-gray-900 mb-2">Plateforme</p>
                  <p class="text-gray-700">Le site web WeLoveEvent et l'ensemble de ses services accessibles via bj-events.com</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="font-semibold text-gray-900 mb-2">Utilisateur</p>
                  <p class="text-gray-700">Toute personne accédant à la plateforme, inscrite ou non</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="font-semibold text-gray-900 mb-2">Organisateur</p>
                  <p class="text-gray-700">Utilisateur ayant obtenu le statut d'organisateur et pouvant créer des événements</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="font-semibold text-gray-900 mb-2">Événement</p>
                  <p class="text-gray-700">Toute activité, manifestation ou rassemblement publié sur la plateforme</p>
                </div>
              </div>
            </section>

            <!-- Acceptation -->
            <section id="acceptation" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Acceptation des conditions</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  L'utilisation de la plateforme WeLoveEvent implique l'acceptation pleine et entière des présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser nos services.
                </p>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <div class="flex gap-3">
                    <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p class="text-sm text-amber-800">
                      En créant un compte, vous confirmez avoir lu et accepté ces conditions d'utilisation ainsi que notre politique de confidentialité.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Services proposés -->
            <section id="services" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-indigo-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Services proposés</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">WeLoveEvent propose les services suivants :</p>
                <ul class="space-y-3">
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700">Découverte et recherche d'événements au Bénin</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700">Achat de billets en ligne de manière sécurisée</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700">Création et gestion d'événements pour les organisateurs approuvés</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700">Gestion des inscriptions et validation des billets</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700">Statistiques et analyses pour les organisateurs</span>
                  </li>
                </ul>
              </div>
            </section>

            <!-- Compte utilisateur -->
            <section id="compte" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-purple-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Compte utilisateur</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Création de compte</h3>
                <p class="text-gray-700 leading-relaxed mb-4">
                  Pour accéder à certains services, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants.
                </p>
                
                <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">Obligations</h3>
                <ul class="space-y-2">
                  <li class="flex items-start gap-3">
                    <span class="text-purple-600">•</span>
                    <span class="text-gray-700">Fournir des informations véridiques et complètes</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-purple-600">•</span>
                    <span class="text-gray-700">Maintenir vos informations à jour</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-purple-600">•</span>
                    <span class="text-gray-700">Ne pas partager vos identifiants avec des tiers</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-purple-600">•</span>
                    <span class="text-gray-700">Nous informer immédiatement de toute utilisation non autorisée</span>
                  </li>
                </ul>
              </div>
            </section>

            <!-- Organisateurs -->
            <section id="organisateurs" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-megaphone" class="w-5 h-5 text-orange-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Conditions pour les organisateurs</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">
                  Les organisateurs doivent respecter des conditions supplémentaires :
                </p>
                <div class="space-y-4">
                  <div class="border-l-4 border-purple-600 pl-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Approbation</h4>
                    <p class="text-gray-700">Toute demande d'organisateur est soumise à validation par notre équipe sous 2-3 jours ouvrables.</p>
                  </div>
                  <div class="border-l-4 border-purple-600 pl-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Responsabilité</h4>
                    <p class="text-gray-700">L'organisateur est seul responsable du contenu de ses événements et de leur bon déroulement.</p>
                  </div>
                  <div class="border-l-4 border-purple-600 pl-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Commission</h4>
                    <p class="text-gray-700">Une commission de 5% s'applique sur chaque billet vendu (hors événements gratuits).</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Paiements -->
            <section id="paiements" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-green-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Paiements et remboursements</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">
                  Les paiements sont sécurisés et traités par nos partenaires certifiés. Nous acceptons les cartes bancaires et Mobile Money.
                </p>
                
                <div class="bg-blue-50 rounded-lg p-4 my-4">
                  <h4 class="font-semibold text-blue-900 mb-2">Politique de remboursement</h4>
                  <p class="text-sm text-blue-800">
                    Les remboursements dépendent de la politique de chaque organisateur. En général, les billets sont remboursables jusqu'à 48h avant l'événement.
                  </p>
                </div>
              </div>
            </section>

            <!-- Propriété intellectuelle -->
            <section id="propriete" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-yellow-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Propriété intellectuelle</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  Tous les contenus présents sur la plateforme (textes, images, logos, design) sont la propriété de WeLoveEvent ou de ses partenaires et sont protégés par les lois sur la propriété intellectuelle.
                </p>
                <p class="text-gray-700 leading-relaxed mt-4">
                  Toute reproduction, modification ou exploitation non autorisée est strictement interdite.
                </p>
              </div>
            </section>

            <!-- Responsabilité -->
            <section id="responsabilite" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Limitation de responsabilité</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  WeLoveEvent agit en tant qu'intermédiaire entre les organisateurs et les participants. Nous ne pouvons être tenus responsables :
                </p>
                <ul class="space-y-2 mt-4">
                  <li class="flex items-start gap-3">
                    <span class="text-red-600">•</span>
                    <span class="text-gray-700">De l'annulation ou du report d'un événement</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-red-600">•</span>
                    <span class="text-gray-700">De la qualité ou du contenu des événements</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-red-600">•</span>
                    <span class="text-gray-700">Des dommages directs ou indirects liés à l'utilisation de la plateforme</span>
                  </li>
                </ul>
              </div>
            </section>

            <!-- Données personnelles -->
            <section id="donnees" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 text-indigo-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Protection des données personnelles</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  Vos données personnelles sont collectées et traitées conformément à notre <NuxtLink to="/privacy" class="text-purple-600 hover:text-purple-700 font-medium">Politique de confidentialité</NuxtLink>. Nous nous engageons à protéger vos informations et à respecter votre vie privée.
                </p>
              </div>
            </section>

            <!-- Modification -->
            <section id="modification" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-teal-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Modification des conditions</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants par email et/ou via une notification sur la plateforme.
                </p>
                <p class="text-gray-700 leading-relaxed mt-4">
                  La poursuite de l'utilisation de nos services après modification vaut acceptation des nouvelles conditions.
                </p>
              </div>
            </section>

            <!-- Contact -->
            <section id="contact" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-purple-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Nous contacter</h2>
              </div>
              <div class="bg-gray-50 rounded-xl p-6">
                <p class="text-gray-700 mb-4">Pour toute question concernant ces conditions d'utilisation :</p>
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-purple-600" />
                    <a href="mailto:legal@bj-events.com" class="text-purple-600 hover:text-purple-700 font-medium">
                      legal@bj-events.com
                    </a>
                  </div>
                  <div class="flex items-center gap-3">
                    <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-purple-600" />
                    <span class="text-gray-700">Cotonou, Bénin</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>

    </div>
  </div>
</template>
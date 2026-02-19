<script setup lang="ts">
import { ref } from 'vue'

const activeSection = ref('introduction')

const sections = [
  { id: 'introduction', title: 'Introduction', icon: 'i-heroicons-document-text' },
  { id: 'collecte', title: 'Collecte des données', icon: 'i-heroicons-clipboard-document-list' },
  { id: 'utilisation', title: 'Utilisation des données', icon: 'i-heroicons-cog-6-tooth' },
  { id: 'partage', title: 'Partage des données', icon: 'i-heroicons-share' },
  { id: 'cookies', title: 'Cookies', icon: 'i-heroicons-computer-desktop' },
  { id: 'securite', title: 'Sécurité', icon: 'i-heroicons-shield-check' },
  { id: 'droits', title: 'Vos droits', icon: 'i-heroicons-hand-raised' },
  { id: 'conservation', title: 'Conservation', icon: 'i-heroicons-archive-box' },
  { id: 'mineurs', title: 'Mineurs', icon: 'i-heroicons-user-group' },
  { id: 'international', title: 'Transferts internationaux', icon: 'i-heroicons-globe-alt' },
  { id: 'modifications', title: 'Modifications', icon: 'i-heroicons-arrow-path' },
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

</script>

<template>
  <div class="min-h-screen bg-gray-50 mt-14">
    <div class="max-w-7xl mx-auto px-6 py-12">
      
      <div class="grid lg:grid-cols-4 gap-8">
        
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="lg:sticky lg:top-6 space-y-6">
            
            <!-- Header Card -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 text-indigo-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Politique de confidentialité</h2>
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
                      ? 'bg-indigo-50 text-indigo-700'
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
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-indigo-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Introduction</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  Chez <strong>WeLove Event</strong>, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre plateforme.
                </p>
                <p class="text-gray-700 leading-relaxed mt-4">
                  En utilisant WeLove Event, vous acceptez les pratiques décrites dans cette politique. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser nos services.
                </p>
                <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
                  <div class="flex gap-3">
                    <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p class="text-sm text-indigo-800">
                      Cette politique s'applique à tous les utilisateurs de WeLove Event, qu'ils soient visiteurs, utilisateurs inscrits ou organisateurs d'événements.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Collecte des données -->
            <section id="collecte" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-blue-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Données collectées</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">Nous collectons différents types de données :</p>
                
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Données fournies directement par vous</h3>
                <ul class="space-y-2 mb-6">
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700"><strong>Informations de compte :</strong> nom, prénom, email, numéro de téléphone, mot de passe</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700"><strong>Informations de paiement :</strong> coordonnées bancaires, Mobile Money</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700"><strong>Informations d'événements :</strong> pour les organisateurs (description, images, prix, etc.)</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700"><strong>Communications :</strong> messages envoyés via notre support</span>
                  </li>
                </ul>

                <h3 class="text-lg font-semibold text-gray-900 mb-3">Données collectées automatiquement</h3>
                <ul class="space-y-2">
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700"><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, durée de visite</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700"><strong>Données d'appareil :</strong> type d'appareil, système d'exploitation, identifiants uniques</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <UIcon name="i-heroicons-check" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span class="text-gray-700"><strong>Cookies et technologies similaires</strong> (voir section dédiée)</span>
                  </li>
                </ul>
              </div>
            </section>

            <!-- Utilisation des données -->
            <section id="utilisation" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 text-purple-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Utilisation des données</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">Nous utilisons vos données pour :</p>
                
                <div class="grid gap-4">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-indigo-600" />
                      Gestion de compte
                    </h4>
                    <p class="text-gray-700 text-sm">Créer et gérer votre compte, authentifier votre identité, personnaliser votre expérience</p>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <UIcon name="i-heroicons-ticket" class="w-5 h-5 text-indigo-600" />
                      Traitement des transactions
                    </h4>
                    <p class="text-gray-700 text-sm">Traiter les achats de billets, émettre des factures, gérer les remboursements</p>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <UIcon name="i-heroicons-bell" class="w-5 h-5 text-indigo-600" />
                      Communications
                    </h4>
                    <p class="text-gray-700 text-sm">Envoyer des confirmations, notifications d'événements, mises à jour importantes</p>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-indigo-600" />
                      Analyses et améliorations
                    </h4>
                    <p class="text-gray-700 text-sm">Analyser l'utilisation de la plateforme, améliorer nos services, développer de nouvelles fonctionnalités</p>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <UIcon name="i-heroicons-shield-exclamation" class="w-5 h-5 text-indigo-600" />
                      Sécurité et prévention
                    </h4>
                    <p class="text-gray-700 text-sm">Prévenir les fraudes, détecter les activités suspectes, garantir la sécurité de la plateforme</p>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <UIcon name="i-heroicons-megaphone" class="w-5 h-5 text-indigo-600" />
                      Marketing (avec consentement)
                    </h4>
                    <p class="text-gray-700 text-sm">Envoyer des offres personnalisées, newsletters (vous pouvez vous désabonner à tout moment)</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Partage des données -->
            <section id="partage" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-share" class="w-5 h-5 text-green-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Partage des données</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">
                  Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
                </p>

                <div class="space-y-4">
                  <div class="border-l-4 border-indigo-600 pl-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Avec les organisateurs</h4>
                    <p class="text-gray-700">Lorsque vous achetez un billet, l'organisateur reçoit vos coordonnées nécessaires (nom, email) pour la gestion de l'événement.</p>
                  </div>

                  <div class="border-l-4 border-indigo-600 pl-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Prestataires de services</h4>
                    <p class="text-gray-700">Partenaires de paiement, hébergeurs, services d'emailing (sous strictes obligations de confidentialité).</p>
                  </div>

                  <div class="border-l-4 border-indigo-600 pl-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Obligations légales</h4>
                    <p class="text-gray-700">En cas de demande légale d'autorités compétentes ou pour protéger nos droits.</p>
                  </div>

                  <div class="border-l-4 border-indigo-600 pl-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Transfert d'entreprise</h4>
                    <p class="text-gray-700">En cas de fusion, acquisition ou vente d'actifs, vos données peuvent être transférées (vous serez informés).</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Cookies -->
            <section id="cookies" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-computer-desktop" class="w-5 h-5 text-orange-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Cookies et technologies similaires</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">
                  Nous utilisons des cookies pour améliorer votre expérience sur la plateforme.
                </p>

                <h3 class="text-lg font-semibold text-gray-900 mb-3">Types de cookies utilisés</h3>
                <ul class="space-y-3">
                  <li class="flex items-start gap-3">
                    <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p class="font-medium text-gray-900">Cookies essentiels</p>
                      <p class="text-sm text-gray-700">Nécessaires au fonctionnement de la plateforme (connexion, panier)</p>
                    </div>
                  </li>
                  <li class="flex items-start gap-3">
                    <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p class="font-medium text-gray-900">Cookies de performance</p>
                      <p class="text-sm text-gray-700">Analysent l'utilisation de la plateforme (Google Analytics)</p>
                    </div>
                  </li>
                  <li class="flex items-start gap-3">
                    <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p class="font-medium text-gray-900">Cookies de fonctionnalité</p>
                      <p class="text-sm text-gray-700">Mémorisent vos préférences (langue, favoris)</p>
                    </div>
                  </li>
                  <li class="flex items-start gap-3">
                    <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p class="font-medium text-gray-900">Cookies publicitaires</p>
                      <p class="text-sm text-gray-700">Permettent d'afficher des publicités pertinentes (avec votre consentement)</p>
                    </div>
                  </li>
                </ul>

                <div class="bg-blue-50 rounded-lg p-4 mt-6">
                  <p class="text-sm text-blue-800">
                    <strong>Gestion des cookies :</strong> Vous pouvez configurer vos préférences de cookies dans les paramètres de votre navigateur ou via notre bandeau de cookies.
                  </p>
                </div>
              </div>
            </section>

            <!-- Sécurité -->
            <section id="securite" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-red-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Sécurité des données</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">
                  Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
                </p>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 text-indigo-600" />
                      <h4 class="font-semibold text-gray-900">Chiffrement</h4>
                    </div>
                    <p class="text-sm text-gray-700">Connexions HTTPS/SSL pour toutes les transactions</p>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon name="i-heroicons-server" class="w-5 h-5 text-indigo-600" />
                      <h4 class="font-semibold text-gray-900">Hébergement sécurisé</h4>
                    </div>
                    <p class="text-sm text-gray-700">Serveurs protégés avec pare-feu et sauvegardes régulières</p>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon name="i-heroicons-finger-print" class="w-5 h-5 text-indigo-600" />
                      <h4 class="font-semibold text-gray-900">Accès restreint</h4>
                    </div>
                    <p class="text-sm text-gray-700">Seul le personnel autorisé accède aux données</p>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon name="i-heroicons-eye-slash" class="w-5 h-5 text-indigo-600" />
                      <h4 class="font-semibold text-gray-900">Mots de passe</h4>
                    </div>
                    <p class="text-sm text-gray-700">Hashage sécurisé, aucun stockage en clair</p>
                  </div>
                </div>

                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                  <div class="flex gap-3">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p class="text-sm text-amber-800">
                      Aucune méthode de transmission sur Internet n'est 100% sécurisée. Nous faisons de notre mieux pour protéger vos données, mais nous ne pouvons garantir une sécurité absolue.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Vos droits -->
            <section id="droits" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-hand-raised" class="w-5 h-5 text-yellow-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Vos droits</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">
                  Conformément à la réglementation en vigueur, vous disposez des droits suivants :
                </p>

                <div class="space-y-3">
                  <div class="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <UIcon name="i-heroicons-eye" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="font-semibold text-gray-900">Droit d'accès</p>
                      <p class="text-sm text-gray-700">Obtenir une copie de vos données personnelles</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="font-semibold text-gray-900">Droit de rectification</p>
                      <p class="text-sm text-gray-700">Corriger des données inexactes ou incomplètes</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <UIcon name="i-heroicons-trash" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="font-semibold text-gray-900">Droit à l'effacement</p>
                      <p class="text-sm text-gray-700">Demander la suppression de vos données (sous conditions)</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="font-semibold text-gray-900">Droit à la portabilité</p>
                      <p class="text-sm text-gray-700">Recevoir vos données dans un format structuré</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <UIcon name="i-heroicons-pause-circle" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="font-semibold text-gray-900">Droit d'opposition</p>
                      <p class="text-sm text-gray-700">Vous opposer au traitement de vos données (marketing notamment)</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <UIcon name="i-heroicons-no-symbol" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="font-semibold text-gray-900">Droit de limitation</p>
                      <p class="text-sm text-gray-700">Demander la limitation du traitement de vos données</p>
                    </div>
                  </div>
                </div>

                <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
                  <p class="text-sm text-indigo-800">
                    <strong>Pour exercer vos droits :</strong> Contactez-nous à <a href="mailto:privacy@bj-events.com" class="font-medium underline">privacy@bj-events.com</a> avec une pièce d'identité. Nous répondrons sous 30 jours.
                  </p>
                </div>
              </div>
            </section>

            <!-- Conservation -->
            <section id="conservation" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-teal-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Conservation des données</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed mb-4">
                  Nous conservons vos données uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées :
                </p>

                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <span class="text-indigo-600 font-bold">•</span>
                    <span class="text-gray-700"><strong>Données de compte :</strong> Pendant toute la durée de votre compte + 1 an après suppression</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-indigo-600 font-bold">•</span>
                    <span class="text-gray-700"><strong>Données de transaction :</strong> 10 ans (obligations comptables et fiscales)</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-indigo-600 font-bold">•</span>
                    <span class="text-gray-700"><strong>Données de navigation :</strong> 13 mois maximum</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-indigo-600 font-bold">•</span>
                    <span class="text-gray-700"><strong>Emails marketing :</strong> 3 ans après votre dernier contact</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Mineurs -->
            <section id="mineurs" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-pink-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Protection des mineurs</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  Notre plateforme n'est pas destinée aux personnes de moins de 18 ans. Si nous découvrons qu'un mineur nous a fourni des données personnelles sans le consentement parental, nous supprimerons ces informations de nos serveurs.
                </p>
                <p class="text-gray-700 leading-relaxed mt-4">
                  Si vous êtes parent ou tuteur et pensez que votre enfant nous a fourni des données, contactez-nous immédiatement.
                </p>
              </div>
            </section>

            <!-- Transferts internationaux -->
            <section id="international" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-globe-alt" class="w-5 h-5 text-cyan-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Transferts internationaux</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  Vos données peuvent être transférées et stockées sur des serveurs situés hors du Bénin, notamment pour nos prestataires de services (hébergement, paiement).
                </p>
                <p class="text-gray-700 leading-relaxed mt-4">
                  Dans ce cas, nous veillons à ce que des garanties appropriées soient mises en place pour protéger vos données conformément aux standards internationaux.
                </p>
              </div>
            </section>

            <!-- Modifications -->
            <section id="modifications" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-violet-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Modifications de la politique</h2>
              </div>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Nous vous informerons de tout changement important par email et/ou via une notification sur la plateforme.
                </p>
                <p class="text-gray-700 leading-relaxed mt-4">
                  Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques en matière de protection des données.
                </p>
              </div>
            </section>

            <!-- Contact -->
            <section id="contact" class="scroll-mt-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-indigo-600" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Nous contacter</h2>
              </div>
              <div class="bg-gray-50 rounded-xl p-6">
                <p class="text-gray-700 mb-6">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                </p>
                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Email</p>
                      <a href="mailto:privacy@bj-events.com" class="text-indigo-600 hover:text-indigo-700 font-medium">
                        privacy@bj-events.com
                      </a>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <UIcon name="i-heroicons-building-office" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Responsable de la protection des données</p>
                      <p class="text-gray-700">WeLove Event - Service Protection des Données</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Adresse</p>
                      <p class="text-gray-700">Cotonou, Bénin</p>
                    </div>
                  </div>
                </div>

                <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
                  <p class="text-sm text-indigo-800">
                    <strong>Délai de réponse :</strong> Nous nous engageons à répondre à toutes vos demandes dans un délai maximum de 30 jours.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>

    </div>
  </div>
</template>
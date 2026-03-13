<script setup lang="ts">
import { ref } from 'vue'

const activeSection = ref('introduction')

const sections = [
  { id: 'introduction',  title: 'Introduction',             icon: 'i-heroicons-document-text'           },
  { id: 'collecte',      title: 'Collecte des données',     icon: 'i-heroicons-clipboard-document-list' },
  { id: 'utilisation',   title: 'Utilisation des données',  icon: 'i-heroicons-cog-6-tooth'             },
  { id: 'partage',       title: 'Partage des données',      icon: 'i-heroicons-share'                   },
  { id: 'cookies',       title: 'Cookies',                  icon: 'i-heroicons-computer-desktop'        },
  { id: 'securite',      title: 'Sécurité',                 icon: 'i-heroicons-shield-check'            },
  { id: 'droits',        title: 'Vos droits',               icon: 'i-heroicons-hand-raised'             },
  { id: 'conservation',  title: 'Conservation',             icon: 'i-heroicons-archive-box'             },
  { id: 'mineurs',       title: 'Mineurs',                  icon: 'i-heroicons-user-group'              },
  { id: 'international', title: 'Transferts internationaux',icon: 'i-heroicons-globe-alt'               },
  { id: 'modifications', title: 'Modifications',            icon: 'i-heroicons-arrow-path'              },
  { id: 'contact',       title: 'Contact',                  icon: 'i-heroicons-envelope'                },
]

const scrollToSection = (id: string) => {
  activeSection.value = id
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const formattedLastUpdate = new Date().toLocaleDateString('fr-FR', {
  day: '2-digit', month: 'long', year: 'numeric',
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div class="grid lg:grid-cols-4 gap-6">

        <!-- ══ SIDEBAR ══ -->
        <div class="lg:col-span-1">
          <div class="lg:sticky lg:top-24 space-y-4">

            <!-- Card titre — dégradé indigo→orange (inversé vs terms) -->
            <div class="bg-gradient-to-br from-[#5b47e0] to-[#ea6c1e] rounded-2xl p-5 relative overflow-hidden
                        shadow-[0_4px_20px_rgba(91,71,224,0.2)]">
              <div class="absolute inset-0 opacity-10"
                style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 18px 18px;" />
              <div class="relative">
                <div class="w-10 h-10 rounded-xl bg-white/20 border border-white/30
                            flex items-center justify-center mb-3">
                  <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 text-white" />
                </div>
                <h2 class="text-[15px] font-bold text-white leading-snug mb-1">
                  Politique de confidentialité
                </h2>
                <p class="text-[11px] text-white/65">
                  Mise à jour : {{ formattedLastUpdate }}
                </p>
              </div>
            </div>

            <!-- Sommaire -->
            <nav class="bg-white rounded-2xl border border-[#ede8e0]
                        shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3">
              <p class="text-[10.5px] font-bold text-[#c0b8ad] uppercase tracking-widest mb-2 px-2">
                Sommaire
              </p>
              <div class="space-y-0.5">
                <button
                  v-for="section in sections" :key="section.id"
                  @click="scrollToSection(section.id)"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left
                         text-[12px] font-medium transition-all duration-150"
                  :class="activeSection === section.id
                    ? 'bg-indigo-50 text-[#5b47e0] font-semibold'
                    : 'text-[#8a8078] hover:bg-[#faf8f5] hover:text-[#1a1612]'"
                >
                  <UIcon :name="section.icon" class="w-3.5 h-3.5 flex-shrink-0" />
                  {{ section.title }}
                </button>
              </div>
            </nav>

          </div>
        </div>

        <!-- ══ CONTENU ══ -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-2xl border border-[#ede8e0]
                      shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-7 sm:p-10 space-y-10">

            <!-- ── Introduction ── -->
            <section id="introduction" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-document-text" class="w-4.5 h-4.5 text-[#5b47e0]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Introduction</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed">
                Chez <strong class="text-[#1a1612]">WeLoveEvent</strong>, nous accordons une grande importance à la protection de vos données personnelles. Cette politique explique comment nous collectons, utilisons, partageons et protégeons vos informations.
              </p>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mt-3">
                En utilisant WeLoveEvent, vous acceptez les pratiques décrites dans cette politique. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser nos services.
              </p>
              <div class="flex items-start gap-3 mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon name="i-heroicons-information-circle" class="w-3.5 h-3.5 text-[#5b47e0]" />
                </div>
                <p class="text-[12.5px] text-[#5b47e0]/90 leading-relaxed">
                  Cette politique s'applique à tous les utilisateurs de WeLoveEvent, qu'ils soient visiteurs, inscrits ou organisateurs.
                </p>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Collecte ── -->
            <section id="collecte" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-clipboard-document-list" class="w-4.5 h-4.5 text-[#ea6c1e]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Données collectées</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">Nous collectons différents types de données :</p>

              <h3 class="text-[13px] font-bold text-[#1a1612] mb-3">Données fournies directement</h3>
              <div class="space-y-2 mb-5">
                <div v-for="item in [
                  { label: 'Informations de compte', desc: 'nom, prénom, email, numéro de téléphone, mot de passe' },
                  { label: 'Informations de paiement', desc: 'coordonnées bancaires, Mobile Money' },
                  { label: 'Informations d\'événements', desc: 'pour les organisateurs (description, images, prix, etc.)' },
                  { label: 'Communications', desc: 'messages envoyés via notre support' },
                ]" :key="item.label" class="flex items-start gap-3">
                  <div class="w-5 h-5 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon name="i-heroicons-check" class="w-3 h-3 text-[#ea6c1e]" />
                  </div>
                  <span class="text-[13px] text-[#4a3f32]">
                    <strong class="text-[#1a1612]">{{ item.label }} :</strong> {{ item.desc }}
                  </span>
                </div>
              </div>

              <h3 class="text-[13px] font-bold text-[#1a1612] mb-3">Données collectées automatiquement</h3>
              <div class="space-y-2">
                <div v-for="item in [
                  { label: 'Données de navigation', desc: 'adresse IP, type de navigateur, pages visitées, durée de visite' },
                  { label: 'Données d\'appareil', desc: 'type d\'appareil, système d\'exploitation, identifiants uniques' },
                  { label: 'Cookies et technologies similaires', desc: '(voir section dédiée)' },
                ]" :key="item.label" class="flex items-start gap-3">
                  <div class="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon name="i-heroicons-check" class="w-3 h-3 text-[#5b47e0]" />
                  </div>
                  <span class="text-[13px] text-[#4a3f32]">
                    <strong class="text-[#1a1612]">{{ item.label }} :</strong> {{ item.desc }}
                  </span>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Utilisation ── -->
            <section id="utilisation" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-4.5 h-4.5 text-[#5b47e0]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Utilisation des données</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">Nous utilisons vos données pour :</p>
              <div class="grid sm:grid-cols-2 gap-3">
                <div v-for="item in [
                  { icon: 'i-heroicons-user-circle',       color: 'text-[#ea6c1e]', bg: 'bg-orange-50 border-orange-100',   title: 'Gestion de compte',         desc: 'Créer et gérer votre compte, authentifier votre identité, personnaliser votre expérience' },
                  { icon: 'i-heroicons-ticket',            color: 'text-[#5b47e0]', bg: 'bg-indigo-50 border-indigo-100',   title: 'Traitement des transactions', desc: 'Traiter les achats de billets, émettre des factures, gérer les remboursements' },
                  { icon: 'i-heroicons-bell',              color: 'text-[#ea6c1e]', bg: 'bg-orange-50 border-orange-100',   title: 'Communications',            desc: 'Envoyer des confirmations, notifications d\'événements, mises à jour importantes' },
                  { icon: 'i-heroicons-chart-bar',         color: 'text-[#5b47e0]', bg: 'bg-indigo-50 border-indigo-100',   title: 'Analyses',                  desc: 'Analyser l\'utilisation, améliorer nos services, développer de nouvelles fonctionnalités' },
                  { icon: 'i-heroicons-shield-exclamation',color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-100', title: 'Sécurité',                  desc: 'Prévenir les fraudes, détecter les activités suspectes' },
                  { icon: 'i-heroicons-megaphone',         color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100',     title: 'Marketing (avec consentement)',desc: 'Envoi d\'offres personnalisées, newsletters (désabonnement possible)' },
                ]" :key="item.title"
                  class="bg-[#faf8f5] rounded-xl border border-[#ede8e0] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0"
                      :class="item.bg">
                      <UIcon :name="item.icon" class="w-3.5 h-3.5" :class="item.color" />
                    </div>
                    <p class="text-[12.5px] font-bold text-[#1a1612]">{{ item.title }}</p>
                  </div>
                  <p class="text-[12px] text-[#8a8078] leading-relaxed">{{ item.desc }}</p>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Partage ── -->
            <section id="partage" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-share" class="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Partage des données</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
              </p>
              <div class="space-y-3">
                <div v-for="item in [
                  { title: 'Avec les organisateurs',   text: 'Lorsque vous achetez un billet, l\'organisateur reçoit vos coordonnées nécessaires (nom, email) pour la gestion de l\'événement.' },
                  { title: 'Prestataires de services', text: 'Partenaires de paiement, hébergeurs, services d\'emailing (sous strictes obligations de confidentialité).' },
                  { title: 'Obligations légales',      text: 'En cas de demande légale d\'autorités compétentes ou pour protéger nos droits.' },
                  { title: 'Transfert d\'entreprise',  text: 'En cas de fusion, acquisition ou vente d\'actifs, vos données peuvent être transférées (vous serez informés).' },
                ]" :key="item.title"
                  class="flex gap-3 p-4 bg-[#faf8f5] rounded-xl border border-[#ede8e0]">
                  <div class="w-1 rounded-full bg-black flex-shrink-0" />
                  <div>
                    <p class="text-[12.5px] font-bold text-[#1a1612] mb-1">{{ item.title }}</p>
                    <p class="text-[12.5px] text-[#8a8078] leading-relaxed">{{ item.text }}</p>
                  </div>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Cookies ── -->
            <section id="cookies" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-computer-desktop" class="w-4.5 h-4.5 text-[#ea6c1e]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Cookies et technologies similaires</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                Nous utilisons des cookies pour améliorer votre expérience sur la plateforme.
              </p>
              <div class="space-y-2.5 mb-4">
                <div v-for="item in [
                  { title: 'Cookies essentiels',       desc: 'Nécessaires au fonctionnement de la plateforme (connexion, panier)' },
                  { title: 'Cookies de performance',   desc: 'Analysent l\'utilisation de la plateforme (Google Analytics)' },
                  { title: 'Cookies de fonctionnalité',desc: 'Mémorisent vos préférences (langue, favoris)' },
                  { title: 'Cookies publicitaires',    desc: 'Permettent d\'afficher des publicités pertinentes (avec votre consentement)' },
                ]" :key="item.title" class="flex items-start gap-3">
                  <div class="w-2 h-2 rounded-full bg-[#ea6c1e] flex-shrink-0 mt-1.5" />
                  <div>
                    <p class="text-[12.5px] font-semibold text-[#1a1612]">{{ item.title }}</p>
                    <p class="text-[12px] text-[#8a8078]">{{ item.desc }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon name="i-heroicons-information-circle" class="w-3.5 h-3.5 text-[#5b47e0]" />
                </div>
                <p class="text-[12.5px] text-[#5b47e0]/90 leading-relaxed">
                  <strong>Gestion des cookies :</strong> Vous pouvez configurer vos préférences dans les paramètres de votre navigateur ou via notre bandeau de cookies.
                </p>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Sécurité ── -->
            <section id="securite" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-shield-check" class="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Sécurité des données</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
              </p>
              <div class="grid sm:grid-cols-2 gap-3 mb-4">
                <div v-for="item in [
                  { icon: 'i-heroicons-lock-closed',  title: 'Chiffrement',         desc: 'Connexions HTTPS/SSL pour toutes les transactions' },
                  { icon: 'i-heroicons-server',       title: 'Hébergement sécurisé',desc: 'Serveurs protégés avec pare-feu et sauvegardes régulières' },
                  { icon: 'i-heroicons-finger-print', title: 'Accès restreint',      desc: 'Seul le personnel autorisé accède aux données' },
                  { icon: 'i-heroicons-eye-slash',    title: 'Mots de passe',        desc: 'Hashage sécurisé, aucun stockage en clair' },
                ]" :key="item.title"
                  class="bg-[#faf8f5] rounded-xl border border-[#ede8e0] p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <UIcon :name="item.icon" class="w-3.5 h-3.5 text-[#5b47e0]" />
                    </div>
                    <p class="text-[12.5px] font-bold text-[#1a1612]">{{ item.title }}</p>
                  </div>
                  <p class="text-[12px] text-[#8a8078]">{{ item.desc }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div class="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p class="text-[12.5px] text-amber-800 leading-relaxed">
                  Aucune méthode de transmission sur Internet n'est 100% sécurisée. Nous faisons de notre mieux pour protéger vos données, mais nous ne pouvons garantir une sécurité absolue.
                </p>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Droits ── -->
            <section id="droits" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-hand-raised" class="w-4.5 h-4.5 text-amber-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Vos droits</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                Conformément à la réglementation en vigueur, vous disposez des droits suivants :
              </p>
              <div class="space-y-2.5 mb-4">
                <div v-for="item in [
                  { icon: 'i-heroicons-eye',            title: 'Droit d\'accès',       desc: 'Obtenir une copie de vos données personnelles' },
                  { icon: 'i-heroicons-pencil-square',  title: 'Droit de rectification',desc: 'Corriger des données inexactes ou incomplètes' },
                  { icon: 'i-heroicons-trash',          title: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données (sous conditions)' },
                  { icon: 'i-heroicons-arrow-down-tray',title: 'Droit à la portabilité',desc: 'Recevoir vos données dans un format structuré' },
                  { icon: 'i-heroicons-pause-circle',   title: 'Droit d\'opposition',   desc: 'Vous opposer au traitement de vos données (marketing notamment)' },
                  { icon: 'i-heroicons-no-symbol',      title: 'Droit de limitation',   desc: 'Demander la limitation du traitement de vos données' },
                ]" :key="item.title"
                  class="flex items-start gap-3 p-3.5 bg-[#faf8f5] rounded-xl border border-[#ede8e0]">
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon :name="item.icon" class="w-3.5 h-3.5 text-[#5b47e0]" />
                  </div>
                  <div>
                    <p class="text-[12.5px] font-bold text-[#1a1612]">{{ item.title }}</p>
                    <p class="text-[12px] text-[#8a8078]">{{ item.desc }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon name="i-heroicons-information-circle" class="w-3.5 h-3.5 text-[#5b47e0]" />
                </div>
                <p class="text-[12.5px] text-[#5b47e0]/90 leading-relaxed">
                  <strong>Pour exercer vos droits :</strong> Contactez-nous à
                  <a href="mailto:privacy@bj-events.com" class="font-semibold underline">privacy@bj-events.com</a>
                  avec une pièce d'identité. Nous répondrons sous 30 jours.
                </p>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Conservation ── -->
            <section id="conservation" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-archive-box" class="w-4.5 h-4.5 text-teal-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Conservation des données</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                Nous conservons vos données uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées :
              </p>
              <div class="space-y-2.5">
                <div v-for="item in [
                  { label: 'Données de compte',     value: 'Pendant toute la durée de votre compte + 1 an après suppression' },
                  { label: 'Données de transaction',value: '10 ans (obligations comptables et fiscales)' },
                  { label: 'Données de navigation', value: '13 mois maximum' },
                  { label: 'Emails marketing',      value: '3 ans après votre dernier contact' },
                ]" :key="item.label"
                  class="flex items-center gap-3 p-3.5 bg-[#faf8f5] rounded-xl border border-[#ede8e0]">
                  <div class="w-1.5 h-1.5 rounded-full bg-[#5b47e0] flex-shrink-0" />
                  <span class="text-[13px] text-[#4a3f32]">
                    <strong class="text-[#1a1612]">{{ item.label }} :</strong> {{ item.value }}
                  </span>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Mineurs ── -->
            <section id="mineurs" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-user-group" class="w-4.5 h-4.5 text-pink-500" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Protection des mineurs</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed">
                Notre plateforme n'est pas destinée aux personnes de moins de 18 ans. Si nous découvrons qu'un mineur nous a fourni des données personnelles sans le consentement parental, nous supprimerons ces informations de nos serveurs.
              </p>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mt-3">
                Si vous êtes parent ou tuteur et pensez que votre enfant nous a fourni des données, contactez-nous immédiatement.
              </p>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Transferts internationaux ── -->
            <section id="international" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-globe-alt" class="w-4.5 h-4.5 text-cyan-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Transferts internationaux</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed">
                Vos données peuvent être transférées et stockées sur des serveurs situés hors du Bénin, notamment pour nos prestataires de services (hébergement, paiement).
              </p>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mt-3">
                Dans ce cas, nous veillons à ce que des garanties appropriées soient mises en place pour protéger vos données conformément aux standards internationaux.
              </p>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Modifications ── -->
            <section id="modifications" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-arrow-path" class="w-4.5 h-4.5 text-violet-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Modifications de la politique</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Nous vous informerons de tout changement important par email et/ou via une notification sur la plateforme.
              </p>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mt-3">
                Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques.
              </p>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Contact ── -->
            <section id="contact" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-envelope" class="w-4.5 h-4.5 text-[#5b47e0]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Nous contacter</h2>
              </div>
              <div class="bg-[#faf8f5] rounded-xl border border-[#ede8e0] p-5">
                <p class="text-[13px] text-[#8a8078] mb-4">
                  Pour toute question concernant cette politique ou pour exercer vos droits :
                </p>
                <div class="space-y-3">
                  <a href="mailto:privacy@bj-events.com"
                    class="flex items-center gap-3 group">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 text-[#5b47e0]" />
                    </div>
                    <div>
                      <p class="text-[11px] text-[#c0b8ad] uppercase tracking-wide">Email</p>
                      <span class="text-[13px] font-semibold text-[#5b47e0] group-hover:underline">
                        privacy@bj-events.com
                      </span>
                    </div>
                  </a>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                      <UIcon name="i-heroicons-building-office" class="w-3.5 h-3.5 text-[#ea6c1e]" />
                    </div>
                    <div>
                      <p class="text-[11px] text-[#c0b8ad] uppercase tracking-wide">Responsable DPO</p>
                      <p class="text-[13px] text-[#4a3f32]">WeLoveEvent — Service Protection des Données</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#5b47e0]" />
                    </div>
                    <div>
                      <p class="text-[11px] text-[#c0b8ad] uppercase tracking-wide">Adresse</p>
                      <p class="text-[13px] text-[#4a3f32]">Cotonou, Bénin</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-start gap-3 mt-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div class="w-6 h-6 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon name="i-heroicons-clock" class="w-3 h-3 text-[#5b47e0]" />
                  </div>
                  <p class="text-[12px] text-[#5b47e0]/90 leading-relaxed">
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
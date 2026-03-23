<script setup lang="ts">
import { ref } from 'vue'

const activeSection = ref('introduction')

const sections = [
  { id: 'introduction',  title: 'Introduction',              icon: 'i-heroicons-document-text'      },
  { id: 'definitions',   title: 'Définitions',               icon: 'i-heroicons-book-open'           },
  { id: 'acceptation',   title: 'Acceptation',               icon: 'i-heroicons-check-circle'        },
  { id: 'services',      title: 'Services proposés',         icon: 'i-heroicons-sparkles'            },
  { id: 'compte',        title: 'Compte utilisateur',        icon: 'i-heroicons-user-circle'         },
  { id: 'organisateurs', title: 'Organisateurs',             icon: 'i-heroicons-megaphone'           },
  { id: 'paiements',     title: 'Paiements',                 icon: 'i-heroicons-credit-card'         },
  { id: 'propriete',     title: 'Propriété intellectuelle',  icon: 'i-heroicons-shield-check'        },
  { id: 'responsabilite',title: 'Responsabilité',            icon: 'i-heroicons-exclamation-triangle'},
  { id: 'donnees',       title: 'Données personnelles',      icon: 'i-heroicons-lock-closed'         },
  { id: 'modification',  title: 'Modification',              icon: 'i-heroicons-arrow-path'          },
  { id: 'contact',       title: 'Contact',                   icon: 'i-heroicons-envelope'            },
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

            <!-- Card titre -->
            <div class="bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] rounded-2xl p-5 relative overflow-hidden
                        shadow-[0_4px_20px_rgba(234,108,30,0.2)]">
              <!-- Motif points -->
              <div class="absolute inset-0 opacity-10"
                style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 18px 18px;" />
              <div class="relative">
                <div class="w-10 h-10 rounded-xl bg-white/20 border border-white/30
                            flex items-center justify-center mb-3">
                  <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-white" />
                </div>
                <h2 class="text-[15px] font-bold text-white leading-snug mb-1">
                  Conditions d'utilisation
                </h2>
                <p class="text-[11px] text-white/65">
                  Mise à jour : {{ formattedLastUpdate }}
                </p>
              </div>
            </div>

            <!-- Navigation sommaire -->
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
                    ? 'bg-orange-50 text-[#ea6c1e] font-semibold'
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
                <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-document-text" class="w-4.5 h-4.5 text-[#ea6c1e]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Introduction</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed">
                Bienvenue sur <strong class="text-[#1a1612]">WeLoveEvent</strong>, la plateforme dédiée à la découverte, la création et la gestion d'événements au Bénin. En accédant et en utilisant notre plateforme, vous acceptez de respecter les présentes conditions d'utilisation.
              </p>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mt-3">
                Ces conditions régissent votre utilisation de nos services, que vous soyez un simple visiteur, un utilisateur inscrit ou un organisateur d'événements.
              </p>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Définitions ── -->
            <section id="definitions" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-book-open" class="w-4.5 h-4.5 text-[#5b47e0]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Définitions</h2>
              </div>
              <div class="grid sm:grid-cols-2 gap-3">
                <div v-for="def in [
                  { term: 'Plateforme',    desc: 'Le site web WeLoveEvent et ses services accessibles via bj-events.com' },
                  { term: 'Utilisateur',   desc: 'Toute personne accédant à la plateforme, inscrite ou non' },
                  { term: 'Organisateur',  desc: 'Utilisateur ayant obtenu le statut d\'organisateur et pouvant créer des événements' },
                  { term: 'Événement',     desc: 'Toute activité, manifestation ou rassemblement publié sur la plateforme' },
                ]" :key="def.term"
                  class="bg-[#faf8f5] rounded-xl border border-[#ede8e0] p-4">
                  <p class="text-[12.5px] font-bold text-[#1a1612] mb-1">{{ def.term }}</p>
                  <p class="text-[12px] text-[#8a8078] leading-relaxed">{{ def.desc }}</p>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Acceptation ── -->
            <section id="acceptation" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-check-circle" class="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Acceptation des conditions</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                L'utilisation de la plateforme WeLoveEvent implique l'acceptation pleine et entière des présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser nos services.
              </p>
              <div class="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div class="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon name="i-heroicons-information-circle" class="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p class="text-[12.5px] text-amber-800 leading-relaxed">
                  En créant un compte, vous confirmez avoir lu et accepté ces conditions d'utilisation ainsi que notre politique de confidentialité.
                </p>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Services ── -->
            <section id="services" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-sparkles" class="w-4.5 h-4.5 text-[#5b47e0]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Services proposés</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">WeLoveEvent propose les services suivants :</p>
              <div class="space-y-2.5">
                <div v-for="item in [
                  'Découverte et recherche d\'événements au Bénin',
                  'Achat de billets en ligne de manière sécurisée',
                  'Création et gestion d\'événements pour les organisateurs approuvés',
                  'Gestion des inscriptions et validation des billets',
                  'Statistiques et analyses pour les organisateurs',
                ]" :key="item"
                  class="flex items-center gap-3">
                  <div class="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    <UIcon name="i-heroicons-check" class="w-3 h-3 text-[#5b47e0]" />
                  </div>
                  <span class="text-[13px] text-[#4a3f32]">{{ item }}</span>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Compte utilisateur ── -->
            <section id="compte" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-user-circle" class="w-4.5 h-4.5 text-[#ea6c1e]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Compte utilisateur</h2>
              </div>
              <h3 class="text-[13.5px] font-bold text-[#1a1612] mb-2">Création de compte</h3>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-5">
                Pour accéder à certains services, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants.
              </p>
              <h3 class="text-[13.5px] font-bold text-[#1a1612] mb-3">Obligations</h3>
              <div class="space-y-2">
                <div v-for="item in [
                  'Fournir des informations véridiques et complètes',
                  'Maintenir vos informations à jour',
                  'Ne pas partager vos identifiants avec des tiers',
                  'Nous informer immédiatement de toute utilisation non autorisée',
                ]" :key="item"
                  class="flex items-center gap-3">
                  <div class="w-1.5 h-1.5 rounded-full bg-[#ea6c1e] flex-shrink-0" />
                  <span class="text-[13px] text-[#4a3f32]">{{ item }}</span>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Organisateurs ── -->
            <section id="organisateurs" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-megaphone" class="w-4.5 h-4.5 text-[#ea6c1e]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Conditions pour les organisateurs</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                Les organisateurs doivent respecter des conditions supplémentaires :
              </p>
              <div class="space-y-3">
                <div v-for="item in [
                  { title: 'Approbation',    text: 'Toute demande d\'organisateur est soumise à validation par notre équipe sous 2-3 jours ouvrables.' },
                  { title: 'Responsabilité', text: 'L\'organisateur est seul responsable du contenu de ses événements et de leur bon déroulement.' },
                  { title: 'Commission',     text: 'Une commission de 5% s\'applique sur chaque billet vendu (hors événements gratuits).' },
                ]" :key="item.title"
                  class="flex gap-3 p-4 bg-[#faf8f5] rounded-xl border border-[#ede8e0]">
                  <div class="w-1 rounded-full bg-gradient-to-b from-[#ea6c1e] to-[#5b47e0] flex-shrink-0" />
                  <div>
                    <p class="text-[12.5px] font-bold text-[#1a1612] mb-1">{{ item.title }}</p>
                    <p class="text-[12.5px] text-[#8a8078] leading-relaxed">{{ item.text }}</p>
                  </div>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Paiements ── -->
            <section id="paiements" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-credit-card" class="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Paiements et remboursements</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                Les paiements sont sécurisés et traités par nos partenaires certifiés. Nous acceptons les cartes bancaires et Mobile Money.
              </p>
              <div class="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon name="i-heroicons-information-circle" class="w-3.5 h-3.5 text-[#5b47e0]" />
                </div>
                <div>
                  <p class="text-[12.5px] font-bold text-[#5b47e0] mb-1">Politique de remboursement</p>
                  <p class="text-[12.5px] text-[#5b47e0]/80 leading-relaxed">
                    Les remboursements dépendent de la politique de chaque organisateur. En général, les billets sont remboursables jusqu'à 48h avant l'événement.
                  </p>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Propriété intellectuelle ── -->
            <section id="propriete" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-shield-check" class="w-4.5 h-4.5 text-amber-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Propriété intellectuelle</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed">
                Tous les contenus présents sur la plateforme (textes, images, logos, design) sont la propriété de WeLoveEvent ou de ses partenaires et sont protégés par les lois sur la propriété intellectuelle.
              </p>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mt-3">
                Toute reproduction, modification ou exploitation non autorisée est strictement interdite.
              </p>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Responsabilité ── -->
            <section id="responsabilite" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-4.5 h-4.5 text-red-500" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Limitation de responsabilité</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mb-4">
                WeLoveEvent agit en tant qu'intermédiaire entre les organisateurs et les participants. Nous ne pouvons être tenus responsables :
              </p>
              <div class="space-y-2">
                <div v-for="item in [
                  'De l\'annulation ou du report d\'un événement',
                  'De la qualité ou du contenu des événements',
                  'Des dommages directs ou indirects liés à l\'utilisation de la plateforme',
                ]" :key="item" class="flex items-center gap-3">
                  <div class="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span class="text-[13px] text-[#4a3f32]">{{ item }}</span>
                </div>
              </div>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Données personnelles ── -->
            <section id="donnees" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-lock-closed" class="w-4.5 h-4.5 text-[#5b47e0]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Protection des données personnelles</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed">
                Vos données personnelles sont collectées et traitées conformément à notre
                <NuxtLink to="/helps/privacy" class="text-[#ea6c1e] font-semibold hover:underline">
                  Politique de confidentialité
                </NuxtLink>.
                Nous nous engageons à protéger vos informations et à respecter votre vie privée.
              </p>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Modification ── -->
            <section id="modification" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-arrow-path" class="w-4.5 h-4.5 text-teal-600" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Modification des conditions</h2>
              </div>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants par email et/ou via une notification sur la plateforme.
              </p>
              <p class="text-[13.5px] text-[#4a3f32] leading-relaxed mt-3">
                La poursuite de l'utilisation de nos services après modification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <div class="h-px bg-[#ede8e0]" />

            <!-- ── Contact ── -->
            <section id="contact" class="scroll-mt-28">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-envelope" class="w-4.5 h-4.5 text-[#ea6c1e]" />
                </div>
                <h2 class="text-[18px] font-bold text-[#1a1612]">Nous contacter</h2>
              </div>
              <div class="bg-[#faf8f5] rounded-xl border border-[#ede8e0] p-5">
                <p class="text-[13px] text-[#8a8078] mb-4">
                  Pour toute question concernant ces conditions d'utilisation :
                </p>
                <div class="space-y-3">
                  <a href="mailto:legal@bj-events.com"
                    class="flex items-center gap-3 group">
                    <div class="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100
                                flex items-center justify-center">
                      <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 text-[#ea6c1e]" />
                    </div>
                    <span class="text-[13px] font-semibold text-[#ea6c1e] group-hover:underline">
                      legal@bj-events.com
                    </span>
                  </a>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100
                                flex items-center justify-center">
                      <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#5b47e0]" />
                    </div>
                    <span class="text-[13px] text-[#4a3f32]">Cotonou, Bénin</span>
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = [
  { value: '500+',  label: 'Événements organisés', icon: 'i-heroicons-calendar-days'   },
  { value: '50k+',  label: 'Participants satisfaits', icon: 'i-heroicons-users'           },
  { value: '120+',  label: 'Organisateurs actifs',    icon: 'i-heroicons-megaphone'       },
  { value: '12',    label: 'Villes couvertes',         icon: 'i-heroicons-map-pin'         },
]

const values = [
  {
    icon: 'i-heroicons-heart',
    title: 'Passion locale',
    desc: 'Nous sommes 100% béninois, construits pour et par la communauté. Chaque ligne de code reflète notre amour pour la culture et les événements du Bénin.',
    color: '#ea6c1e',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    icon: 'i-heroicons-shield-check',
    title: 'Confiance & sécurité',
    desc: 'Transactions sécurisées, organisateurs vérifiés, remboursements garantis. Vous pouvez profiter sereinement, nous gérons le reste.',
    color: '#5b47e0',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    icon: 'i-heroicons-bolt',
    title: 'Simplicité avant tout',
    desc: 'Acheter un billet ou créer un événement doit prendre minutes, pas des heures. On s\'obsède sur l\'expérience pour que vous ne pensiez qu\'à l\'essentiel.',
    color: '#059669',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: 'i-heroicons-chart-bar-square',
    title: 'Croissance partagée',
    desc: 'Notre succès est lié au vôtre. Des outils analytics, des commissions réduites, un support dédié : tout est conçu pour faire grandir vos événements.',
    color: '#0891b2',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
]

const team = [
  { name: 'Kofi Mensah',    role: 'CEO & Co-fondateur',      initials: 'KM', gradient: 'from-[#ea6c1e] to-[#f59e0b]' },
  { name: 'Aminata Diallo', role: 'CTO & Co-fondatrice',     initials: 'AD', gradient: 'from-[#5b47e0] to-[#818cf8]' },
  { name: 'Yves Dossou',    role: 'Head of Product',         initials: 'YD', gradient: 'from-[#059669] to-[#34d399]' },
  { name: 'Fatou Traoré',   role: 'Head of Growth',          initials: 'FT', gradient: 'from-[#dc2626] to-[#f87171]' },
  { name: 'Barnabé Koffi',  role: 'Lead Designer',           initials: 'BK', gradient: 'from-[#0891b2] to-[#67e8f9]' },
  { name: 'Ines Agossou',   role: 'Customer Success',        initials: 'IA', gradient: 'from-[#7c3aed] to-[#c4b5fd]' },
]

const milestones = [
  { year: '2021', title: 'Naissance de l\'idée',    desc: 'Frustrés de ne pas trouver les événements locaux facilement, nous décidons de construire la solution.', side: 'left'  },
  { year: '2022', title: 'Lancement en beta',       desc: 'Premiers événements sur la plateforme à Cotonou. 200 utilisateurs les 3 premiers mois.', side: 'right' },
  { year: '2023', title: 'Expansion nationale',     desc: 'Ouverture à 6 nouvelles villes. 100 organisateurs rejoignent la plateforme.', side: 'left'  },
  { year: '2024', title: '50 000 participants',     desc: 'Cap symbolique franchi. Intégration Mobile Money et lancement du scanner de billets.', side: 'right' },
  { year: '2025', title: 'Aujourd\'hui',            desc: 'Plus de 500 événements organisés, 120+ organisateurs actifs, et une ambition : devenir la référence en Afrique de l\'Ouest.', side: 'left'  },
]
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit">

    <!-- ══════════════════════════════════════════
         HERO
    ══════════════════════════════════════════ -->
    <section class="relative pt-28 pb-20 overflow-hidden">

      <!-- Blobs décoratifs -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20
                    bg-gradient-to-br from-[#ea6c1e] to-transparent blur-3xl" />
        <div class="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-15
                    bg-gradient-to-br from-[#5b47e0] to-transparent blur-3xl" />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">

        <!-- Pill badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6
                    bg-white border border-[#ede8e0] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <span class="w-2 h-2 rounded-full bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0]" />
          <span class="text-[11.5px] font-semibold text-[#8a8078] uppercase tracking-widest">
            Notre histoire
          </span>
        </div>

        <!-- Titre hero -->
        <h1 class="text-[38px] sm:text-[58px] font-extrabold text-[#1a1612] tracking-tight leading-[1.05] mb-6">
          On croit aux<br>
          <span class="relative inline-block">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
              événements
            </span>
            <!-- Soulignement décoratif -->
            <svg class="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 300 6" preserveAspectRatio="none">
              <path d="M0,5 Q75,0 150,4 Q225,8 300,3" stroke="url(#uline)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <defs>
                <linearGradient id="uline" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#ea6c1e"/>
                  <stop offset="100%" stop-color="#5b47e0"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <br>qui rassemblent.
        </h1>

        <p class="text-[15.5px] text-[#8a8078] max-w-xl mx-auto leading-relaxed mb-8">
          WeLoveEvent est né d'une conviction simple : au Bénin, les événements sont partout, mais les trouver et les organiser est trop compliqué.
        </p>

        <!-- CTA duo -->
        <div class="flex items-center justify-center gap-3">
          <NuxtLink to="/events"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl
                   bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                   text-white text-[13px] font-bold
                   shadow-[0_4px_20px_rgba(234,108,30,0.25)]
                   hover:shadow-[0_6px_28px_rgba(234,108,30,0.35)] hover:-translate-y-0.5
                   transition-all duration-200">
            <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
            Découvrir les événements
          </NuxtLink>
          <NuxtLink to="/contact"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl
                   bg-white border border-[#ede8e0] text-[#4a3f32] text-[13px] font-semibold
                   hover:border-[#d4cec5] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                   transition-all duration-200">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-[#8a8078]" />
            Nous écrire
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         STATS
    ══════════════════════════════════════════ -->
    <section class="py-12 border-y border-[#ede8e0] bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center
                        bg-gradient-to-br from-[#ea6c1e]/10 to-[#5b47e0]/10 border border-[#ede8e0]">
              <UIcon :name="stat.icon" class="w-5 h-5 text-[#ea6c1e]" />
            </div>
            <p class="text-[28px] font-extrabold text-[#1a1612] tracking-tight leading-none mb-1">
              {{ stat.value }}
            </p>
            <p class="text-[12px] text-[#b0a898]">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         MISSION
    ══════════════════════════════════════════ -->
    <section class="py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="grid lg:grid-cols-2 gap-8 items-center">

          <!-- Texte -->
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5
                        bg-white border border-[#ede8e0] text-[11px] font-bold text-[#8a8078] uppercase tracking-widest">
              <UIcon name="i-heroicons-flag" class="w-3 h-3 text-[#ea6c1e]" />
              Notre mission
            </div>
            <h2 class="text-[28px] sm:text-[34px] font-bold text-[#1a1612] tracking-tight leading-tight mb-5">
              Connecter les gens<br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
                à travers les moments.
              </span>
            </h2>
            <p class="text-[14px] text-[#8a8078] leading-relaxed mb-4">
              Nous construisons le pont entre les organisateurs passionnés et les participants qui cherchent à vivre des expériences uniques — concerts, conférences, festivals, sport, culture...
            </p>
            <p class="text-[14px] text-[#8a8078] leading-relaxed">
              Notre vision : que chaque béninois puisse découvrir, vivre et partager des événements mémorables, sans friction.
            </p>
          </div>

          <!-- Carte décorative -->
          <div class="relative">
            <div class="bg-white rounded-2xl border border-[#ede8e0]
                        shadow-[0_8px_40px_rgba(0,0,0,0.07)] p-6 relative overflow-hidden">

              <!-- Header carte -->
              <div class="bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] -mx-6 -mt-6 px-6 pt-6 pb-8 mb-6 relative">
                <div class="absolute inset-0 opacity-10"
                  style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 18px 18px;" />
                <div class="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 400 20" preserveAspectRatio="none" class="w-full h-5">
                    <path d="M0,20 C100,0 300,0 400,20 L400,20 L0,20 Z" fill="white"/>
                  </svg>
                </div>
                <p class="relative text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1">Notre promesse</p>
                <p class="relative text-[20px] font-extrabold text-white leading-tight">
                  Simple. Sécurisé.<br>Local.
                </p>
              </div>

              <!-- Points clés -->
              <div class="space-y-3">
                <div v-for="item in [
                  { icon: 'i-heroicons-check-circle', text: 'Inscription en moins de 2 minutes',     color: 'text-emerald-500' },
                  { icon: 'i-heroicons-check-circle', text: 'Paiement Mobile Money & carte bancaire', color: 'text-emerald-500' },
                  { icon: 'i-heroicons-check-circle', text: 'Support en français 24/7',               color: 'text-emerald-500' },
                  { icon: 'i-heroicons-check-circle', text: 'Événements vérifiés et fiables',          color: 'text-emerald-500' },
                ]" :key="item.text" class="flex items-center gap-2.5">
                  <UIcon :name="item.icon" class="w-4.5 h-4.5 flex-shrink-0" :class="item.color" />
                  <span class="text-[13px] text-[#4a3f32]">{{ item.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         VALEURS
    ══════════════════════════════════════════ -->
    <section class="py-16 border-t border-[#ede8e0] bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">

        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4
                      bg-[#f5f3ef] border border-[#ede8e0] text-[11px] font-bold text-[#8a8078] uppercase tracking-widest">
            <UIcon name="i-heroicons-sparkles" class="w-3 h-3 text-[#5b47e0]" />
            Nos valeurs
          </div>
          <h2 class="text-[26px] sm:text-[32px] font-bold text-[#1a1612] tracking-tight">
            Ce qui nous guide chaque jour
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 gap-5">
          <div
            v-for="val in values" :key="val.title"
            class="bg-[#faf8f5] rounded-2xl border p-6
                   hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                   transition-all duration-300"
            :class="`${val.border}`"
          >
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              :class="`${val.bg} border ${val.border}`">
              <UIcon :name="val.icon" class="w-5.5 h-5.5" :style="{ color: val.color }" />
            </div>
            <h3 class="text-[15px] font-bold text-[#1a1612] mb-2">{{ val.title }}</h3>
            <p class="text-[13px] text-[#8a8078] leading-relaxed">{{ val.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         TIMELINE
    ══════════════════════════════════════════ -->
    <section class="py-16 border-t border-[#ede8e0]">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">

        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4
                      bg-white border border-[#ede8e0] text-[11px] font-bold text-[#8a8078] uppercase tracking-widest">
            <UIcon name="i-heroicons-clock" class="w-3 h-3 text-[#ea6c1e]" />
            Notre parcours
          </div>
          <h2 class="text-[26px] sm:text-[32px] font-bold text-[#1a1612] tracking-tight">
            De l'idée à la réalité
          </h2>
        </div>

        <!-- Timeline verticale -->
        <div class="relative">
          <!-- Ligne centrale -->
          <div class="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5
                      bg-gradient-to-b from-[#ea6c1e] via-[#5b47e0] to-[#ede8e0]" />

          <div class="space-y-10">
            <div
              v-for="(milestone, i) in milestones" :key="milestone.year"
              class="relative grid grid-cols-2 gap-8 items-center"
            >
              <!-- Dot central -->
              <div class="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl z-10
                          border-2 border-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]
                          flex items-center justify-center text-white text-[11px] font-bold"
                :style="{ background: i % 2 === 0 ? '#ea6c1e' : '#5b47e0' }">
                {{ milestone.year.slice(2) }}
              </div>

              <!-- Côté gauche -->
              <div :class="milestone.side === 'left' ? 'text-right pr-10' : 'col-start-2 pl-10 text-left col-span-1 row-start-1'" >
                <template v-if="milestone.side === 'left'">
                  <div class="bg-white rounded-xl border border-[#ede8e0]
                              shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 inline-block text-left">
                    <p class="text-[10.5px] font-bold text-[#ea6c1e] uppercase tracking-widest mb-1">
                      {{ milestone.year }}
                    </p>
                    <p class="text-[14px] font-bold text-[#1a1612] mb-1">{{ milestone.title }}</p>
                    <p class="text-[12.5px] text-[#8a8078] leading-relaxed">{{ milestone.desc }}</p>
                  </div>
                </template>
              </div>

              <!-- Côté droit -->
              <div :class="milestone.side === 'right' ? 'pl-10' : ''">
                <template v-if="milestone.side === 'right'">
                  <div class="bg-white rounded-xl border border-[#ede8e0]
                              shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4">
                    <p class="text-[10.5px] font-bold text-[#5b47e0] uppercase tracking-widest mb-1">
                      {{ milestone.year }}
                    </p>
                    <p class="text-[14px] font-bold text-[#1a1612] mb-1">{{ milestone.title }}</p>
                    <p class="text-[12.5px] text-[#8a8078] leading-relaxed">{{ milestone.desc }}</p>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         ÉQUIPE
    ══════════════════════════════════════════ -->
    <section class="py-16 border-t border-[#ede8e0] bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">

        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4
                      bg-[#f5f3ef] border border-[#ede8e0] text-[11px] font-bold text-[#8a8078] uppercase tracking-widest">
            <UIcon name="i-heroicons-users" class="w-3 h-3 text-[#ea6c1e]" />
            L'équipe
          </div>
          <h2 class="text-[26px] sm:text-[32px] font-bold text-[#1a1612] tracking-tight mb-3">
            Les visages derrière WeLoveEvent
          </h2>
          <p class="text-[14px] text-[#b0a898] max-w-md mx-auto">
            Une équipe passionnée, 100% locale, déterminée à transformer l'écosystème événementiel béninois.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="member in team" :key="member.name"
            class="bg-[#faf8f5] rounded-2xl border border-[#ede8e0] p-5
                   hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)]
                   transition-all duration-300 flex items-center gap-4"
          >
            <!-- Avatar dégradé -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center
                        text-white text-[14px] font-bold flex-shrink-0
                        shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
              :class="`bg-gradient-to-br ${member.gradient}`">
              {{ member.initials }}
            </div>
            <div>
              <p class="text-[13.5px] font-bold text-[#1a1612]">{{ member.name }}</p>
              <p class="text-[11.5px] text-[#b0a898] mt-0.5">{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         CTA FINAL
    ══════════════════════════════════════════ -->
    <section class="py-16 border-t border-[#ede8e0]">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <div class="bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0] rounded-2xl p-8 sm:p-10
                    text-center relative overflow-hidden
                    shadow-[0_8px_40px_rgba(234,108,30,0.2)]">

          <!-- Motif points -->
          <div class="absolute inset-0 opacity-10"
            style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 22px 22px;" />

          <div class="relative">
            <div class="w-14 h-14 rounded-2xl bg-white/20 border border-white/30
                        flex items-center justify-center mx-auto mb-5">
              <UIcon name="i-heroicons-rocket-launch" class="w-7 h-7 text-white" />
            </div>
            <h2 class="text-[24px] sm:text-[30px] font-extrabold text-white tracking-tight mb-3">
              Prêt à rejoindre l'aventure ?
            </h2>
            <p class="text-[14px] text-white/75 max-w-md mx-auto mb-7 leading-relaxed">
              Que vous soyez participant ou organisateur, votre place est parmi nous.
            </p>
            <div class="flex items-center justify-center gap-3 flex-wrap">
              <NuxtLink to="/auth/signup"
                class="flex items-center gap-2 px-6 py-3 rounded-xl
                       bg-white text-[13.5px] font-bold text-[#1a1612]
                       hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5
                       transition-all duration-200">
                <UIcon name="i-heroicons-user-plus" class="w-4 h-4 text-[#ea6c1e]" />
                Créer un compte
              </NuxtLink>
              <NuxtLink to="/organizerForm"
                class="flex items-center gap-2 px-6 py-3 rounded-xl
                       bg-white/15 border border-white/30 text-white text-[13.5px] font-bold
                       hover:bg-white/25 hover:-translate-y-0.5
                       transition-all duration-200">
                <UIcon name="i-heroicons-megaphone" class="w-4 h-4" />
                Devenir organisateur
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
</style>
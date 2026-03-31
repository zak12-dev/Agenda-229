<script setup>
import PastEvent from './PastEvent.vue'

const advantages = [
  {
    icon: 'i-heroicons-calendar-days',
    title: 'Création simplifiée',
    description: 'Créez et publiez vos événements en quelques clics depuis votre tableau de bord.',
    color: '#ea6c1e',
    bg: '#fff7f2',
    border: 'rgba(234,108,30,0.15)',
  },
  {
    icon: 'i-heroicons-chart-bar',
    title: 'Analytics puissants',
    description: 'Suivez vos statistiques de vues, sources et tendances en temps réel.',
    color: '#5b47e0',
    bg: '#f3f1ff',
    border: 'rgba(91,71,224,0.15)',
  },
  {
    icon: 'i-heroicons-users',
    title: 'Gestion complète',
    description: 'Gérez vos participants, inscriptions et communications facilement.',
    color: '#059669',
    bg: '#f0fdf8',
    border: 'rgba(5,150,105,0.15)',
  },
  {
    icon: 'i-heroicons-megaphone',
    title: 'Visibilité optimale',
    description: "Touchez des milliers de personnes au Bénin grâce à notre audience.",
    color: '#0891b2',
    bg: '#f0faff',
    border: 'rgba(8,145,178,0.15)',
  },
]
</script>

<template>
  <div class="w-full bg-[#f5f3ef] font-outfit">

    <!-- ══ ÉVÉNEMENTS PASSÉS ══ -->
    <PastEvent />

    <!-- ══ SECTION ORGANISATEURS ══ -->
    <section class="py-16 sm:py-20 border-t border-[#ede8e0]">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">

        <!-- Header -->
        <div class="text-center mb-12">

          <!-- Pill diviseur -->
          <div class="flex items-center gap-4 mb-8">
            <div class="flex-1 h-px bg-[#ede8e0]" />
            <span class="flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white border border-[#ede8e0]
                         shadow-[0_1px_8px_rgba(0,0,0,0.04)]
                         text-[11.5px] font-semibold text-[#5b47e0]">
              Pour les organisateurs
            </span>
            <div class="flex-1 h-px bg-[#ede8e0]" />
          </div>

          <h2 class="text-[30px] sm:text-[40px] lg:text-[48px] font-bold text-[#1a1612]
                     leading-tight tracking-tight mb-4">
            Devenez
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
              Organisateur
            </span>
          </h2>
          <p class="text-[14px] sm:text-[15px] text-[#8a8078] max-w-lg mx-auto leading-relaxed">
            Rejoignez notre communauté de
            <strong class="text-[#4a3f32] font-semibold">+100 organisateurs</strong>
            et donnez de la visibilité à vos événements au Bénin.
          </p>
        </div>

        <!-- Grid avantages -->
        <div class="grid sm:grid-cols-2 gap-4 mb-12">
          <div
            v-for="(adv, i) in advantages" :key="i"
            class="group flex items-start gap-4 p-5 rounded-2xl bg-white
                   border border-[#ede8e0]
                   shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                   hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]
                   hover:-translate-y-0.5
                   transition-all duration-200"
          >
            <!-- Icône colorée -->
            <div
              class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                     border transition-all duration-200"
              :style="{
                background: adv.bg,
                borderColor: adv.border,
              }"
            >
              <UIcon :name="adv.icon" class="w-5.5 h-5.5" :style="{ color: adv.color }" />
            </div>

            <div class="min-w-0">
              <h3 class="text-[14px] font-bold text-[#1a1612] mb-1.5
                         group-hover:text-[#ea6c1e] transition-colors">
                {{ adv.title }}
              </h3>
              <p class="text-[12.5px] text-[#8a8078] leading-relaxed">
                {{ adv.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center">
          <NuxtLink
            to="/organizerForm"
            class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl
                   bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                   text-white text-[14px] font-bold
                   shadow-[0_4px_20px_rgba(234,108,30,0.3)]
                   hover:shadow-[0_6px_28px_rgba(234,108,30,0.4)]
                   hover:-translate-y-0.5
                   transition-all duration-200"
          >
            Devenir organisateur
            <div class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
            </div>
          </NuxtLink>

          <p class="text-[12.5px] text-[#b0a898] mt-5">
            Des questions ? Contactez-nous :
            <a href="mailto:contact@weloveevent.com"
               class="text-[#ea6c1e] font-semibold hover:underline transition-all">
              contact@weloveevent.com
            </a>
          </p>
        </div>

      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
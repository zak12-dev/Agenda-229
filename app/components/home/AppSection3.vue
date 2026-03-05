<template>
  <div
    class="w-full bg-gradient-to-br from-orange-200 via-white to-indigo-200 py-12 sm:py-16 lg:py-10"
  >
    <!-- Résultats des événements -->
    <PastEvent />
             
    <section class="py-20 text-white mt-5">
      <div class="max-w-5xl mx-auto px-6">
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="flex items-center justify-center mb-6">
            <div
              class="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            ></div>

            <span
              class="mx-6 px-4 py-2 bg-white rounded-full text-sm font-semibold text-indigo-600 border border-gray-300"
            >
              Pour les organisateurs
            </span>

            <div
              class="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            ></div>
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-3">
            Devenez
            <span
              class="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600"
              >Organisateur
            </span>
          </h2>
          <p class="text-sm sm:text-base text-gray-600">
            Rejoignez notre communauté de <strong>+100 organisateurs</strong> et donnez de la
            visibilité à vos événements
          </p>
        </div>

        <!-- Grid -->
        <div class="grid md:grid-cols-2 gap-8 mb-16">
          <div
            v-for="(advantage, index) in advantages"
            :key="index"
            class="flex items-start gap-4 p-6 bg-gradient-to-r from-orange-600 to-indigo-600 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-gray-300"
          >
            <div
              class="flex-shrink-0 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-gray-300"
            >
              <UIcon :name="advantage.icon" class="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">{{ advantage.title }}</h3>

              <p class="text-white">{{ advantage.description }}</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center">
          <NuxtLink
            to="/organizerForm"

            class="inline-block -20 px-8 py-4 bg-indigo-600 border border-gray-300 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl hover:shadow-2xl"
          >
            <span class="flex items-center gap-2 leading-none">
              <span>Devenir organisateur</span>
              <ArrowRight class="w-5 h-5 shrink-0" />
            </span>
          </NuxtLink>
          <p class="text-gray-600 text-sm mt-6">
            Des questions ? Contactez-nous :
            <a href="mailto:contact@bj-events.com" class="underline font-semibold"
              >contact@weloveevent.com</a
            >
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import PastEvent from './PastEvent.vue';

const advantages = [
  {
    icon: 'i-heroicons-calendar-days',
    title: 'Création simplifiée',
    description: 'Créez et publiez vos événements en quelques clics',
  },
  {
    icon: 'i-heroicons-chart-bar',
    title: 'Analytics puissants',
    description: 'Suivez vos statistiques en temps réel',
  },
  {
    icon: 'i-heroicons-users',
    title: 'Gestion complète',
    description: 'Gérez participants et inscriptions facilement',
  },
  {
    icon: 'i-heroicons-megaphone',
    title: 'Visibilité optimale',
    description: 'Touchez des milliers de personnes au Bénin',
  },
]
</script>

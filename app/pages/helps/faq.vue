<script setup lang="ts">
import { ref } from 'vue'

const openItems = ref<Set<string>>(new Set())

const toggleItem = (key: string) => {
  if (openItems.value.has(key)) {
    openItems.value.delete(key)
  } else {
    openItems.value.add(key)
  }
}

const faqData = [
  {
    category: 'Pour les utilisateurs',
    icon: 'i-heroicons-user',
    color: '#ea6c1e',
    bg: 'bg-orange-50',
    questions: [
      {
        q: 'Comment créer un compte ?',
        a: "Cliquez sur \"S'inscrire\" en haut de la page, remplissez le formulaire avec vos informations (nom, email, mot de passe), puis validez.",
      },
      {
        q: 'Comment acheter un billet ?',
        a: "Parcourez les événements disponibles, sélectionnez celui qui vous intéresse, cliquez sur \"Acheter un billet\", et procédez au paiement.",
      },
      {
        q: 'Où trouver mes billets après achat ?',
        a: "Vos billets sont disponibles dans votre espace personnel sous \"Mes billets\". Vous recevrez également un email de confirmation.",
      },
      {
        q: 'Quels moyens de paiement sont acceptés ?',
        a: 'Cartes bancaires (Visa, Mastercard), Mobile Money (MTN, Moov), et virements bancaires.',
      },
      {
        q: 'Puis-je me faire rembourser ?',
        a: "Les billets sont remboursables jusqu'à 48h avant l'événement selon la politique de l'organisateur.",
      },
    ],
  },
  {
    category: 'Pour les organisateurs',
    icon: 'i-heroicons-megaphone',
    color: '#5b47e0',
    bg: 'bg-indigo-50',
    questions: [
      {
        q: 'Comment devenir organisateur ?',
        a: 'Créez un compte, puis cliquez sur "Devenir organisateur" dans votre profil et remplissez le formulaire de demande.',
      },
      {
        q: "Ma demande est approuvée mais je n'ai pas accès. Pourquoi ?",
        a: 'Déconnectez-vous puis reconnectez-vous. Si le problème persiste, videz le cache de votre navigateur.',
      },
      {
        q: 'Comment créer un événement ?',
        a: "Accédez à votre espace organisateur, cliquez sur \"Créer un événement\" et renseignez tous les détails.",
      },
      {
        q: "Comment ajouter des membres à mon équipe ?",
        a: "Dans \"Gérer l'équipe\", cliquez sur \"Inviter un membre\" et définissez ses permissions.",
      },
      {
        q: "Comment scanner les billets le jour de l'événement ?",
        a: "Utilisez l'application mobile WeLoveEvent Scanner ou l'outil web pour scanner les QR codes.",
      },
    ],
  },
  {
    category: 'Paiements et commissions',
    icon: 'i-heroicons-banknotes',
    color: '#059669',
    bg: 'bg-emerald-50',
    questions: [
      {
        q: 'Quelle commission prend WeLoveEvent ?',
        a: 'Commission de 5% sur chaque billet + frais de transaction (2%). Événements gratuits : 0%.',
      },
      {
        q: 'Quand recevrai-je mes revenus ?',
        a: "Les revenus sont versés 5 jours ouvrables après la fin de l'événement.",
      },
      {
        q: 'Les événements gratuits sont-ils vraiment gratuits ?',
        a: 'Oui ! Aucune commission ni frais sur les événements gratuits.',
      },
    ],
  },
]
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-outfit">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

      <!-- ══ HERO ══ -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4
                    bg-white border border-[#ede8e0] shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                    text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest">
          <UIcon name="i-heroicons-question-mark-circle" class="w-3 h-3 text-[#5b47e0]" />
          Questions fréquentes
        </div>
        <h1 class="text-[32px] sm:text-[42px] font-bold text-[#1a1612] tracking-tight mb-3">
          Toutes vos
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]">
            réponses
          </span>
        </h1>
        <p class="text-[14px] text-[#8a8078] max-w-lg mx-auto leading-relaxed">
          Trouvez des réponses à vos questions. Si vous ne trouvez pas ce que vous cherchez,
          <NuxtLink to="/contact" class="text-[#ea6c1e] font-semibold hover:underline">contactez-nous</NuxtLink>.
        </p>
      </div>

      <!-- ══ SECTIONS FAQ ══ -->
      <div class="space-y-8">
        <div v-for="(section, sectionIndex) in faqData" :key="sectionIndex">

          <!-- Titre de section -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="section.bg">
              <UIcon :name="section.icon" class="w-4 h-4" :style="{ color: section.color }" />
            </div>
            <h2 class="text-[15px] font-bold text-[#1a1612]">{{ section.category }}</h2>
            <div class="flex-1 h-px bg-[#ede8e0]" />
            <span class="text-[11px] font-semibold text-[#c0b8ad]">
              {{ section.questions.length }} questions
            </span>
          </div>

          <!-- Items accordéon -->
          <div class="space-y-2">
            <div
              v-for="(item, itemIndex) in section.questions"
              :key="`${sectionIndex}-${itemIndex}`"
              class="bg-white rounded-xl border overflow-hidden
                     transition-all duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              :class="openItems.has(`${sectionIndex}-${itemIndex}`)
                ? 'border-[#ede8e0] shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                : 'border-[#ede8e0]'"
            >
              <!-- Question -->
              <button
                @click="toggleItem(`${sectionIndex}-${itemIndex}`)"
                class="w-full px-5 py-4 flex items-center justify-between text-left group"
              >
                <!-- Numéro + texte -->
                <div class="flex items-center gap-3 pr-4">
                  <span
                    class="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
                           text-[10px] font-bold transition-all duration-200"
                    :style="openItems.has(`${sectionIndex}-${itemIndex}`)
                      ? `background: ${section.color}20; color: ${section.color}`
                      : 'background: #f5f0e8; color: #b0a898'"
                  >
                    {{ itemIndex + 1 }}
                  </span>
                  <span class="text-[13.5px] font-semibold text-[#1a1612] group-hover:text-[#ea6c1e] transition-colors">
                    {{ item.q }}
                  </span>
                </div>

                <!-- Icône +/- -->
                <div
                  class="flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center
                         transition-all duration-200"
                  :style="openItems.has(`${sectionIndex}-${itemIndex}`)
                    ? `background: ${section.color}15; border-color: ${section.color}30; color: ${section.color}`
                    : 'background: #faf8f5; border-color: #ede8e0; color: #c0b8ad'"
                >
                  <UIcon
                    name="i-heroicons-plus"
                    class="w-3.5 h-3.5 transition-transform duration-300"
                    :class="openItems.has(`${sectionIndex}-${itemIndex}`) ? 'rotate-45' : ''"
                  />
                </div>
              </button>

              <!-- Réponse -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <div
                  v-if="openItems.has(`${sectionIndex}-${itemIndex}`)"
                  class="px-5 pb-4"
                >
                  <!-- Ligne de séparation colorée -->
                  <div class="h-px mb-3 rounded-full"
                    :style="`background: linear-gradient(to right, ${section.color}30, transparent)`" />
                  <p class="text-[13px] text-[#4a3f32] leading-relaxed pl-9">
                    {{ item.a }}
                  </p>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ CTA CONTACT ══ -->
      <div class="mt-10 bg-white rounded-2xl border border-[#ede8e0]
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0]
                        flex items-center justify-center flex-shrink-0
                        shadow-[0_4px_14px_rgba(234,108,30,0.25)]">
              <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <p class="text-[14px] font-bold text-[#1a1612]">Besoin d'aide supplémentaire ?</p>
              <p class="text-[12.5px] text-[#b0a898] mt-0.5">
                contact@bj-events.com · Réponse sous 24-48h
              </p>
            </div>
          </div>
          <NuxtLink
            to="/contact"
            class="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl
                   bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0]
                   text-white text-[13px] font-bold
                   shadow-[0_4px_14px_rgba(234,108,30,0.2)]
                   hover:shadow-[0_6px_20px_rgba(234,108,30,0.3)] hover:-translate-y-0.5
                   transition-all duration-200"
          >
            <UIcon name="i-heroicons-paper-airplane" class="w-3.5 h-3.5" />
            Nous contacter
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
</style>
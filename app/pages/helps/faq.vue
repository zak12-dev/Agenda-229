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
    questions: [
      { q: 'Comment créer un compte ?', a: 'Cliquez sur "S\'inscrire" en haut de la page, remplissez le formulaire avec vos informations (nom, email, mot de passe), puis validez.' },
      { q: 'Comment acheter un billet ?', a: 'Parcourez les événements disponibles, sélectionnez celui qui vous intéresse, cliquez sur "Acheter un billet", et procédez au paiement.' },
      { q: 'Où trouver mes billets après achat ?', a: 'Vos billets sont disponibles dans votre espace personnel sous "Mes billets". Vous recevrez également un email de confirmation.' },
      { q: 'Quels moyens de paiement sont acceptés ?', a: 'Cartes bancaires (Visa, Mastercard), Mobile Money (MTN, Moov), et virements bancaires.' },
      { q: 'Puis-je me faire rembourser ?', a: 'Les billets sont remboursables jusqu\'à 48h avant l\'événement selon la politique de l\'organisateur.' }
    ]
  },
  {
    category: 'Pour les organisateurs',
    questions: [
      { q: 'Comment devenir organisateur ?', a: 'Créez un compte, puis cliquez sur "Devenir organisateur" dans votre profil et remplissez le formulaire de demande.' },
      { q: 'Ma demande est approuvée mais je n\'ai pas accès. Pourquoi ?', a: 'Déconnectez-vous puis reconnectez-vous. Si le problème persiste, videz le cache de votre navigateur.' },
      { q: 'Comment créer un événement ?', a: 'Accédez à votre espace organisateur, cliquez sur "Créer un événement" et renseignez tous les détails.' },
      { q: 'Comment ajouter des membres à mon équipe ?', a: 'Dans "Gérer l\'équipe", cliquez sur "Inviter un membre" et définissez ses permissions.' },
      { q: 'Comment scanner les billets le jour de l\'événement ?', a: 'Utilisez l\'application mobile BJ Events Scanner ou l\'outil web pour scanner les QR codes.' }
    ]
  },
  {
    category: 'Paiements et commissions',
    questions: [
      { q: 'Quelle commission prend BJ Events ?', a: 'Commission de 5% sur chaque billet + frais de transaction (2%). Événements gratuits : 0%.' },
      { q: 'Quand recevrai-je mes revenus ?', a: 'Les revenus sont versés 5 jours ouvrables après la fin de l\'événement.' },
      { q: 'Les événements gratuits sont-ils vraiment gratuits ?', a: 'Oui ! Aucune commission ni frais sur les événements gratuits.' }
    ]
  }
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-200 via-white to-indigo-200 py-16 px-6 mt-10">
    <div class="max-w-4xl mx-auto space-y-12">
      
      <!-- Header -->
      <div class="text-center border-b border-gray-200 pb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">FAQ</h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Trouvez des réponses à vos questions. Si vous ne trouvez pas ce que vous cherchez, contactez-nous.
        </p>
      </div>

      <!-- FAQ Sections -->
      <div class="space-y-12">
        <div v-for="(section, sectionIndex) in faqData" :key="sectionIndex">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ section.category }}</h2>
          
          <div class="space-y-4">
            <div
              v-for="(item, itemIndex) in section.questions"
              :key="`${sectionIndex}-${itemIndex}`"
              class="border-l-4 border-gray-200 hover:border-orange-600 transition-all"
            >
              <button
                @click="toggleItem(`${sectionIndex}-${itemIndex}`)"
                class="w-full px-6 py-4 flex items-start justify-between text-left hover:bg-gray-50"
              >
                <span class="font-semibold text-gray-900 pr-4">{{ item.q }}</span>
                <UIcon 
                  name="i-heroicons-plus" 
                  :class="[
                    'w-5 h-5 flex-shrink-0 transition-transform duration-300',
                    openItems.has(`${sectionIndex}-${itemIndex}`) ? 'rotate-45 text-orange-600' : 'text-gray-400'
                  ]"
                />
              </button>

              <Transition
                enter-active-class="transition-all duration-300"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-96 opacity-100"
                leave-active-class="transition-all duration-200"
                leave-from-class="max-h-96 opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-if="openItems.has(`${sectionIndex}-${itemIndex}`)" class="px-6 pb-4">
                  <p class="text-gray-700">{{ item.a }}</p>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="text-center pt-12 border-t border-gray-200">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Besoin d'aide supplémentaire ?</h3>
        <p class="text-gray-600 mb-6">contact@bj-events.com • Réponse sous 24-48h</p>
        <NuxtLink to="/contact" class="inline-block px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all">
          Nous contacter
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
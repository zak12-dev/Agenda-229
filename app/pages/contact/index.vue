<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const loading = ref(false)

const submitForm = async () => {
  if (!form.name || !form.email || !form.message) {
    alert('Veuillez remplir tous les champs')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    Object.assign(form, { name: '', email: '', message: '' })
    alert('Message envoyé ✅')
  } catch (err) {
    alert('Erreur')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppHeader />
    
    <div class="max-w-4xl mx-auto px-6 py-20">
      
      <!-- Header -->
   <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Une question ? Une suggestion ? N'hésitez pas à nous contacter. Notre équipe vous répondra
          dans les plus brefs délais.
        </p>
      </div>

      <!-- Contact Info Grid -->
      <div class="grid sm:grid-cols-2 gap-6 mb-12">
       

        <div class="text-center p-6 border-b-4 border-blue-600">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-phone" class="w-8 h-8 text-blue-600" />
          </div>
          <h3 class="font-bold text-gray-900 mb-2">Téléphone</h3>
          <a href="tel:+22999999999" class="text-gray-600 hover:text-blue-600">
            +229 99 99 99 99
          </a>
        </div>

        <div class="text-center p-6 border-b-4 border-green-600">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-map-pin" class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="font-bold text-gray-900 mb-2">Adresse</h3>
          <p class="text-gray-600">Cotonou, Bénin</p>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-gray-50 rounded-2xl border border-gray-200 p-8 md:p-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Envoyez-nous un message</h2>

        <form @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Nom complet</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Message</label>
            <textarea
              v-model="form.message"
              rows="6"
              required
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {{ loading ? 'Envoi...' : 'Envoyer le message' }}
          </button>
        </form>
      </div>

      <!-- Social Links -->
      <div class="text-center mt-12">
        <p class="text-gray-600 mb-4">Suivez-nous sur les réseaux sociaux</p>
        <div class="flex justify-center gap-4">
          <a href="#" class="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center text-blue-600 transition-all">
            <UIcon name="i-simple-icons-facebook" class="w-5 h-5" />
          </a>
          <a href="#" class="w-12 h-12 bg-sky-100 hover:bg-sky-200 rounded-full flex items-center justify-center text-sky-600 transition-all">
            <UIcon name="i-simple-icons-twitter" class="w-5 h-5" />
          </a>
          <a href="#" class="w-12 h-12 bg-pink-100 hover:bg-pink-200 rounded-full flex items-center justify-center text-pink-600 transition-all">
            <UIcon name="i-simple-icons-instagram" class="w-5 h-5" />
          </a>
        </div>
      </div>

    </div>
  </div>
</template>
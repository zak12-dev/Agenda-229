<script setup lang="ts">
useHead({
  meta: [
    {
      name: 'description',
      content: 'Découvrez et participez aux meilleurs événements du Bénin  concerts, festivals, sport, business et plus encore sur WeLoveEvent.'
    },
    { property: 'og:title', content: 'WeLoveEvent' },
    { property: 'og:description', content: 'Découvrez les meilleurs événements du Bénin concerts, festivals, sport et business.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://weloveevent.vercel.app' },
    { property: 'og:image', content: 'https://weloveevent.vercel.app/og-image.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'WeLoveEvent' },
    { name: 'twitter:description', content: 'Les meilleurs événements du Bénin.' },
  ]
})

import { useAuth } from '../composables/useAuth'

const { fetchSession } = useAuth()

onMounted(async () => {
  await fetchSession()
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
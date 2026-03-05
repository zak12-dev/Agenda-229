<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
  name:'admin-historique',
  layout: 'dashboard' as const,
  middleware: [admin]
})
import AppHistorique from '~/components/admin/AppHistoriques.vue'
</script>
<template>
  <AppHistorique />
</template>

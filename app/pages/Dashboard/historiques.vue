<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
  name:'admin-categories',
  layout: 'dashboard' as const,
  middleware: [admin]
})
import AppHistorique from '~/components/admin/AppHistoriques.vue'
</script>
<template>
  <AppHistorique />
  <CreateCategoriesModal />
</template>

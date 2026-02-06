<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
  name:'admin-categories',
  layout: 'dashboard' as const,
  middleware: [admin]
})
import CategorieTable from '~/components/admin/CategorieTable.vue'
import CreateCategoriesModal from '../../../app/components/admin/CreateCategorieModal.vue'
</script>
<template>
  <CategorieTable />
  <CreateCategoriesModal />
</template>

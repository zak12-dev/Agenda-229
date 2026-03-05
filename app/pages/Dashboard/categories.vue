
<script setup lang="ts">
import admin from '../../../middleware/admin'
import CategorieTable from '~/components/admin/CategorieTable.vue'
import CreateCategoriesModal from '~/components/admin/CreateCategorieModal.vue'
definePageMeta({
    name: 'admin-categories', 
  layout: 'dashboard',
  middleware: [admin]
})
</script>

<template>
  <CategorieTable />
  <CreateCategoriesModal />
</template>

name: 'admin-categories', 
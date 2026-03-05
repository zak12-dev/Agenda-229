<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
  name:'admin-demande',
  layout: 'dashboard',
  middleware: [admin]
})
</script>

<template>
  <AppOrganizers />
</template>

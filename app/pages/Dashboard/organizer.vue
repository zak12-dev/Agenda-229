<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
  name:'admin-organizer',
  layout: 'dashboard',
  middleware: [admin]
})
</script>

<template>
  <AppListOrganizers />
</template>

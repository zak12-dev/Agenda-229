<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
  name:'list-organizer',
  layout: 'dashboard',
  middleware: [admin]
})
</script>

<template>
  <AppListOrganizers />
</template>

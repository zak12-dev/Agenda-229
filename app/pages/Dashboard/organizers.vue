<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
  layout: 'dashboard',
  middleware: [admin]
})
</script>

<template>
  <AppOrganizers />
</template>

<script setup lang="ts">
import moderator from '../../../middleware/moderator'

definePageMeta({
  name: 'admin-analytics',
  layout: 'dashboard',
middleware: [moderator] 

})
</script>

<template>
  <AppAnalytic />
</template>

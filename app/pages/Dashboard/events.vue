<script setup lang="ts">
import moderator from '../../../middleware/moderator'

definePageMeta({
  layout: 'dashboard',
middleware: [moderator] 

})
</script>

<template>
  <EventTable />
  <CreateEventModal />
</template>

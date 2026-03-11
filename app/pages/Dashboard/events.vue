<script setup lang="ts">
import moderator from '../../../middleware/moderator'
import { useAuth } from '../../../composables/useAuth'

definePageMeta({
  name: 'admin-event',
  layout: 'dashboard',
  middleware: [moderator]
})

const { session } = useAuth()

const isAdmin = computed(() => session.value?.user.roleId === 1)
</script>


<template>
  <EventTable />
</template>

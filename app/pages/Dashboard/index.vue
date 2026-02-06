<script setup lang="ts">
import moderator from '../../../middleware/moderator'
import AdminDash from '~/components/admin/AdminDash.vue'
import { useAuth } from '../../../composables/useAuth'

definePageMeta({
  layout: 'dashboard',
  
  middleware: [moderator],
})
const { session, fetchSession } = useAuth()

const user = await fetchSession();

console.log('Dashboard session:', session.value);
console.log('Dashboard user:', user?.user);

</script>

<template>
  <div class="p-6">hello world</div>
  {{ session }}
  {{ user }}
</template>

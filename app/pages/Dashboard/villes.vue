<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
    name: 'admin-villes', 
  layout: 'dashboard',
  middleware: [admin]
})

</script>
<template>
    <AppVilles />
</template>
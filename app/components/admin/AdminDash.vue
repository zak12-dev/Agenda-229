
<script setup lang="ts">
import { ref } from 'vue'
import EventTable from './EventTable.vue'
import CreateEventModal from './CreateEventModal.vue'

const isModalOpen = ref(false)
const editingEvent = ref(null)
function openModal(event: any = null) {
  editingEvent.value = event
  isModalOpen.value = true
}

function closeModal() {
  editingEvent.value = null
  isModalOpen.value = false
}
</script>

<template>
 hello world

</template>

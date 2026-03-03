<script setup lang="ts">
import admin from '../../../middleware/admin'
definePageMeta({
    name: 'admin-villes', 
  layout: 'dashboard',
  middleware: [admin]
})

</script>
<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Gestion des Villes</h1>
        <!-- Contenu de la page de gestion des villes -->
        <p>Cette section vous permet de gérer les villes disponibles pour les événements.</p>
        <!-- Vous pouvez ajouter ici une liste des villes, un formulaire pour ajouter une nouvelle ville, etc. -->
    </div>
</template>
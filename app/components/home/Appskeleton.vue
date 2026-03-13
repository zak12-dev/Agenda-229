<!--
  AppSkeleton.vue — Composant skeleton réutilisable
  Usage :
    <AppSkeleton variant="event-card" />           → card événement (grille)
    <AppSkeleton variant="event-row" />            → ligne événement (favoris)
    <AppSkeleton variant="event-detail" />         → fiche événement complète
    <AppSkeleton variant="dashboard-stat" />       → stat card dashboard
    <AppSkeleton variant="dashboard-event-row" />  → ligne événement dashboard
    <AppSkeleton variant="dashboard-chart" />      → placeholder graphique
    <AppSkeleton variant="text" :lines="3" />      → bloc de texte générique
-->
<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 
    | 'event-card'
    | 'event-row'
    | 'event-detail'
    | 'dashboard-stat'
    | 'dashboard-event-row'
    | 'dashboard-chart'
    | 'text'
  lines?: number
}>(), {
  variant: 'text',
  lines: 3,
})
</script>

<template>

  <!-- ══ EVENT CARD (grille liste événements) ══ -->
  <div v-if="variant === 'event-card'"
    class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden sk-pulse">
    <!-- Image -->
    <div class="h-52 bg-[#ede8e0] relative overflow-hidden">
      <!-- Bandeau catégorie -->
      <div class="absolute top-3 left-3 h-6 w-20 bg-[#e0dbd3] rounded-lg" />
      <!-- Badge prix -->
      <div class="absolute bottom-3 right-3 h-8 w-16 bg-[#e0dbd3] rounded-xl" />
    </div>
    <div class="p-5 space-y-3">
      <!-- Titre -->
      <div class="h-4 bg-[#ede8e0] rounded-lg w-4/5" />
      <!-- Sous-titre -->
      <div class="h-3 bg-[#f0ede8] rounded-lg w-3/5" />
      <!-- Meta row -->
      <div class="flex items-center gap-2 pt-1">
        <div class="h-3 bg-[#f0ede8] rounded-lg w-1/4" />
        <div class="w-1 h-1 rounded-full bg-[#ede8e0]" />
        <div class="h-3 bg-[#f0ede8] rounded-lg w-1/3" />
      </div>
      <!-- Footer -->
      <div class="flex items-center justify-between pt-2 border-t border-[#f0ede8]">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-[#ede8e0]" />
          <div class="h-3 bg-[#f0ede8] rounded-lg w-20" />
        </div>
        <div class="h-7 w-20 bg-[#ede8e0] rounded-xl" />
      </div>
    </div>
  </div>

  <!-- ══ EVENT ROW (favoris, listes horizontales) ══ -->
  <div v-else-if="variant === 'event-row'"
    class="bg-white rounded-2xl border border-[#ede8e0] overflow-hidden sk-pulse">
    <div class="flex items-stretch">
      <!-- Vignette -->
      <div class="w-28 sm:w-36 flex-shrink-0 bg-[#ede8e0] relative">
        <div class="absolute top-2 left-2 h-5 w-14 bg-[#e0dbd3] rounded-lg" />
      </div>
      <!-- Contenu -->
      <div class="flex-1 p-4 space-y-2.5">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-[#ede8e0] rounded-lg w-3/4" />
            <div class="h-3 bg-[#f0ede8] rounded-lg w-1/2" />
          </div>
          <div class="w-8 h-8 rounded-xl bg-[#f0ede8] flex-shrink-0" />
        </div>
        <div class="flex items-center gap-3 pt-1">
          <div class="h-3 bg-[#f0ede8] rounded-lg w-1/4" />
          <div class="h-3 bg-[#f0ede8] rounded-lg w-1/3" />
        </div>
        <div class="flex items-center justify-between pt-2">
          <div class="h-6 w-16 bg-[#ede8e0] rounded-lg" />
          <div class="h-8 w-24 bg-[#ede8e0] rounded-xl" />
        </div>
      </div>
    </div>
  </div>

  <!-- ══ EVENT DETAIL (fiche complète) ══ -->
  <div v-else-if="variant === 'event-detail'" class="sk-pulse space-y-6">
    <!-- Hero image -->
    <div class="h-64 sm:h-96 bg-[#ede8e0] rounded-2xl relative overflow-hidden">
      <div class="absolute top-4 left-4 h-7 w-24 bg-[#e0dbd3] rounded-xl" />
      <div class="absolute bottom-4 left-4 right-4 space-y-2">
        <div class="h-5 bg-[#e0dbd3] rounded-lg w-2/3" />
        <div class="h-4 bg-[#e0dbd3]/70 rounded-lg w-1/2" />
      </div>
    </div>
    <!-- Grid detail -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-5">
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-6 space-y-3">
          <div class="h-5 bg-[#ede8e0] rounded-lg w-1/3" />
          <div class="space-y-2">
            <div class="h-3 bg-[#f0ede8] rounded-lg w-full" />
            <div class="h-3 bg-[#f0ede8] rounded-lg w-5/6" />
            <div class="h-3 bg-[#f0ede8] rounded-lg w-4/6" />
            <div class="h-3 bg-[#f0ede8] rounded-lg w-full" />
          </div>
        </div>
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-6 space-y-3">
          <div class="h-5 bg-[#ede8e0] rounded-lg w-1/4" />
          <div class="grid grid-cols-2 gap-3">
            <div class="h-16 bg-[#f0ede8] rounded-xl" />
            <div class="h-16 bg-[#f0ede8] rounded-xl" />
            <div class="h-16 bg-[#f0ede8] rounded-xl" />
            <div class="h-16 bg-[#f0ede8] rounded-xl" />
          </div>
        </div>
      </div>
      <!-- Sidebar -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-5 space-y-4">
          <div class="h-10 bg-[#ede8e0] rounded-xl w-full" />
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#f0ede8]" />
              <div class="space-y-1.5 flex-1">
                <div class="h-3 bg-[#ede8e0] rounded w-1/3" />
                <div class="h-3 bg-[#f0ede8] rounded w-2/3" />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#f0ede8]" />
              <div class="space-y-1.5 flex-1">
                <div class="h-3 bg-[#ede8e0] rounded w-1/4" />
                <div class="h-3 bg-[#f0ede8] rounded w-1/2" />
              </div>
            </div>
          </div>
          <div class="h-11 bg-[#ede8e0] rounded-xl w-full" />
        </div>
        <!-- Organisateur -->
        <div class="bg-white rounded-2xl border border-[#ede8e0] p-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-[#ede8e0]" />
            <div class="space-y-2 flex-1">
              <div class="h-3.5 bg-[#ede8e0] rounded-lg w-2/3" />
              <div class="h-3 bg-[#f0ede8] rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ DASHBOARD STAT CARD ══ -->
  <div v-else-if="variant === 'dashboard-stat'"
    class="bg-white rounded-2xl border border-[#ede8e0] p-5 sk-pulse">
    <div class="flex items-start justify-between mb-4">
      <div class="space-y-2">
        <div class="h-3 bg-[#f0ede8] rounded w-24" />
        <div class="h-7 bg-[#ede8e0] rounded-lg w-20" />
      </div>
      <div class="w-10 h-10 rounded-xl bg-[#f0ede8]" />
    </div>
    <div class="flex items-center gap-2">
      <div class="h-5 w-14 bg-[#f0ede8] rounded-lg" />
      <div class="h-3 bg-[#f0ede8] rounded w-20" />
    </div>
  </div>

  <!-- ══ DASHBOARD EVENT ROW ══ -->
  <div v-else-if="variant === 'dashboard-event-row'"
    class="flex items-center gap-4 p-3.5 bg-[#faf8f5] rounded-xl border border-[#ede8e0] sk-pulse">
    <!-- Vignette -->
    <div class="w-12 h-12 rounded-xl bg-[#ede8e0] flex-shrink-0" />
    <!-- Info -->
    <div class="flex-1 space-y-2 min-w-0">
      <div class="h-3.5 bg-[#ede8e0] rounded-lg w-3/4" />
      <div class="h-3 bg-[#f0ede8] rounded-lg w-1/2" />
    </div>
    <!-- Badge statut -->
    <div class="h-6 w-16 bg-[#f0ede8] rounded-lg flex-shrink-0" />
    <!-- Actions -->
    <div class="flex gap-2 flex-shrink-0">
      <div class="w-8 h-8 rounded-xl bg-[#f0ede8]" />
      <div class="w-8 h-8 rounded-xl bg-[#f0ede8]" />
    </div>
  </div>

  <!-- ══ DASHBOARD CHART ══ -->
  <div v-else-if="variant === 'dashboard-chart'"
    class="bg-white rounded-2xl border border-[#ede8e0] p-5 sk-pulse">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="space-y-2">
        <div class="h-4 bg-[#ede8e0] rounded-lg w-32" />
        <div class="h-3 bg-[#f0ede8] rounded w-20" />
      </div>
      <div class="h-8 w-28 bg-[#f0ede8] rounded-xl" />
    </div>
    <!-- Barres de graphique -->
    <div class="flex items-end gap-2 h-40">
      <div v-for="(h, i) in [65, 40, 80, 55, 90, 45, 70, 35, 85, 60, 75, 50]" :key="i"
        class="flex-1 bg-[#ede8e0] rounded-t-lg"
        :style="`height: ${h}%`" />
    </div>
    <!-- Labels axe X -->
    <div class="flex justify-between mt-3">
      <div v-for="i in 6" :key="i" class="h-2.5 bg-[#f0ede8] rounded w-8" />
    </div>
  </div>

  <!-- ══ TEXTE GÉNÉRIQUE ══ -->
  <div v-else class="space-y-2.5 sk-pulse">
    <div v-for="i in lines" :key="i"
      class="h-3 bg-[#ede8e0] rounded-lg"
      :style="`width: ${i === lines ? '60%' : i % 2 === 0 ? '85%' : '100%'}`" />
  </div>

</template>

<style scoped>
@keyframes sk-pulse {
  0%, 100% { opacity: 1;    }
  50%       { opacity: 0.45; }
}
.sk-pulse {
  animation: sk-pulse 1.8s ease-in-out infinite;
}
</style>
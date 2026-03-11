<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useAuth } from '../../../composables/useAuth'
import { ref, computed } from 'vue'
import { useRoute } from '#app'

const route = useRoute()
const { session, role: userRole } = useAuth()

const userName = computed(
  () => session.value?.user.name || session.value?.user.email || 'Utilisateur'
)
const userAvatar = computed(() => session.value?.user.image || null)
const userInitial = computed(() => (userName.value?.[0] ?? 'U').toUpperCase())

// ─── Mobile bottom nav (max 5 items) ───
const mobileNavItems = computed(() => {
  const items: Array<{ label: string; icon: string; to: string }> = [
    { label: 'Événements', icon: 'i-heroicons-calendar-days', to: '/dashboard/events' },
  ]

  if (userRole.value === 'admin') {
    items.push(
      { label: 'Catégories', icon: 'i-heroicons-tag', to: '/dashboard/categories' },
      { label: 'Demandes',   icon: 'i-heroicons-user-group', to: '/dashboard/demandes' },
      { label: 'Historique', icon: 'i-heroicons-clock',      to: '/dashboard/historiques' }
    )
  } else {
    items.push({ label: 'Analytics', icon: 'i-heroicons-chart-bar', to: '/dashboard/analytic' })
  }

  items.push({ label: 'Profil', icon: 'i-heroicons-user-circle', to: '/dashboard/profileDash' })
  return items.slice(0, 5)
})

// ─── Desktop nav ───
const mainNavItems = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
    { label: 'Événements',   icon: 'i-heroicons-calendar-days', to: '/dashboard/events' },
  ]

  if (userRole.value !== 'admin') {
    items.push({ label: 'Analytiques', icon: 'i-heroicons-chart-bar', to: '/dashboard/analytic' })
  }

  if (userRole.value === 'admin') {
    items.push(
      { label: 'Catégories',    icon: 'i-heroicons-tag',        to: '/dashboard/categories' },
      { label: 'Villes',        icon: 'i-heroicons-map-pin',    to: '/dashboard/villes' },
      { label: 'Organisateurs', icon: 'i-heroicons-chart-bar',  to: '/dashboard/organizer' },
      { label: 'Demandes',      icon: 'i-heroicons-user-group', to: '/dashboard/demandes' },
      { label: 'Historique',    icon: 'i-heroicons-clock',      to: '/dashboard/historiques' }
    )
  }

  return items
})

const isActive = (path: string) => route.path === path
</script>

<template>
  <!-- ═══════════════════════════════════════
       DESKTOP — Sidebar Cream Minimal
  ════════════════════════════════════════ -->
  <aside
    class="hidden lg:flex flex-col w-[248px] h-screen sticky top-0
           bg-[#faf8f5] border-r border-[#ede8e0]
           shadow-[4px_0_24px_rgba(0,0,0,0.05)]"
  >
    <!-- Header logo -->
    <div class="px-6 pt-4 pb-3 border-b border-[#ede8e0]">
      <NuxtLink to="/" class="block group">
        <h2 class="font-outfit font-bold text-[17px] tracking-tight text-[#1a1612] leading-none">
          WeLove
          <span class="bg-gradient-to-r from-[#ea6c1e] to-[#5b47e0] bg-clip-text text-transparent">
            Event
          </span>
        </h2>
        <p class="mt-1 text-[10px] uppercase tracking-[0.05em] text-[#b0a898] font-medium">
          Dashboard Admin
        </p>
      </NuxtLink>
    </div>

    <!-- User card -->
    <div class="px-4 pt-4 pb-2">
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-[#ede8e0]">
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="userName"
            class="w-8 h-8 rounded-full object-cover ring-2 ring-[#ea6c1e]/20"
          />
          <div
            v-else
            class="w-8 h-8 rounded-full bg-gradient-to-br from-[#ea6c1e] to-[#5b47e0]
                   flex items-center justify-center text-white font-bold text-xs"
          >
            {{ userInitial }}
          </div>
          <!-- Online dot -->
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#faf8f5]" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="font-outfit font-semibold text-[12px] text-[#1a1612] truncate leading-tight">
            {{ userName }}
          </p>
          <p class="text-[10px] text-[#b0a898] capitalize">{{ userRole ?? 'utilisateur' }}</p>
        </div>

        <!-- Settings icon -->
        <NuxtLink to="/dashboard/profileDash" class="flex-shrink-0 text-[#c0b8ad] hover:text-[#ea6c1e] transition-colors">
          <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- Nav principale -->
    <nav class="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin">
      <!-- Section label -->
      <p class="font-outfit font-semibold text-[9.5px] uppercase tracking-[0.1em] text-[#c0b8ad] px-3 pt-3 pb-1">
        Navigation
      </p>

      <NuxtLink
        v-for="item in mainNavItems"
        :key="item.to as string"
        :to="item.to as string"
        class="nav-item group"
        :class="{ 'nav-item--active': isActive(item.to as string) }"
      >
        <!-- Active indicator dot -->
        <span class="nav-dot" />

        <!-- Icon -->
        <span class="nav-icon-wrap">
          <UIcon :name="item.icon as string" class="w-4 h-4" />
        </span>

        <!-- Label -->
        <span class="nav-label font-outfit">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Footer — Support épinglé en bas -->
    <div class="px-3 pb-4 pt-2 border-t border-[#ede8e0]">
      <NuxtLink
        to="/contact"
        class="support-link group"
      >
        <UIcon name="i-heroicons-lifebuoy" class="w-4 h-4 text-[#c0b8ad] group-hover:text-[#ea6c1e] transition-colors flex-shrink-0" />
        <span class="font-outfit text-[13px] font-medium text-[#b0a898] group-hover:text-[#ea6c1e] transition-colors">
          Support
        </span>
      </NuxtLink>
    </div>
  </aside>

  <!-- ═══════════════════════════════════════
       MOBILE — Bottom Navigation Bar
  ════════════════════════════════════════ -->
  <nav
    class=" lg:hidden fixed bottom-0 inset-x-0 z-50
           bg-[#faf8f5] border-t border-[#ede8e0]
           shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
  >
    <div class=" flex items-center justify-around px-2 py-2" style="padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));">
      <NuxtLink
        v-for="item in mobileNavItems"
        :key="item.to"
        :to="item.to"
        class="mob-item group"
        :class="{ 'mob-item--active': isActive(item.to) }"
      >
        <div class="mob-icon-wrap" :class="isActive(item.to) ? 'mob-icon-wrap--active' : ''">
          <UIcon :name="item.icon" class="w-4 h-4" />
        </div>
        <span class="mob-label">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>

  <!-- Spacer mobile -->
  <div class="lg:hidden h-15" />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

/* ── Scrollbar fine ── */
.scrollbar-thin::-webkit-scrollbar { width: 3px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: #e4ddd5; border-radius: 10px; }

/* ── Nav item base ── */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(234, 108, 30, 0.05);
}

/* ── Active state ── */
.nav-item--active {
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07), 0 0 0 1px #ede8e0;
}

/* ── Dot indicator ── */
.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4cec5;
  flex-shrink: 0;
  transition: background 0.2s, box-shadow 0.2s;
}

.nav-item--active .nav-dot {
  background: #ea6c1e;
  box-shadow: 0 0 0 3px rgba(234, 108, 30, 0.15);
}

.nav-item:hover:not(.nav-item--active) .nav-dot {
  background: #c0b8ad;
}

/* ── Icon wrapper ── */
.nav-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
  transition: opacity 0.15s;
  color: #4a3f32;
}

.nav-item:hover .nav-icon-wrap,
.nav-item--active .nav-icon-wrap {
  opacity: 1;
  color: #ea6c1e;
}

/* ── Label ── */
.nav-label {
  font-size: 13.5px;
  font-weight: 500;
  color: #8a8078;
  transition: color 0.15s;
}

.nav-item:hover .nav-label {
  color: #4a3f32;
}

.nav-item--active .nav-label {
  color: #1a1612;
  font-weight: 600;
}

/* ── Support link ── */
.support-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px dashed #ddd6cc;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s, border-style 0.2s;
}

.support-link:hover {
  background: #ffffff;
  border-color: #ea6c1e;
  border-style: solid;
  box-shadow: 0 2px 10px rgba(234, 108, 30, 0.1);
}

/* ── Mobile items ── */
.mob-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 6px 4px;
  text-decoration: none;
  min-width: 0;
}

.mob-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8078;
  transition: background 0.2s, color 0.2s;
}

.mob-item:hover .mob-icon-wrap {
  background: rgba(234, 108, 30, 0.06);
  color: #ea6c1e;
}

.mob-icon-wrap--active {
  background: linear-gradient(135deg, #ea6c1e, #5b47e0) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(234, 108, 30, 0.3);
}

.mob-label {
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 500;
  margin-top: 3px;
  color: #8a8078;
  truncate: true;
  transition: color 0.2s;
}

.mob-item--active .mob-label {
  color: #ea6c1e;
  font-weight: 600;
}

.mob-item:hover:not(.mob-item--active) .mob-label {
  color: #4a3f32;
}
</style>
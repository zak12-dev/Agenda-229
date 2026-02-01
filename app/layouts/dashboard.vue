
<template>
  <UDashboardGroup>
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Panel -->
    <UDashboardPanel>
      <AppDashHeader />
      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>

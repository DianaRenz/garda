<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('dashboard.title') }}</h1>

    <VRow>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="outlined" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold text-primary">—</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.upcomingVisits') }}</div>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="outlined" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold text-warning">—</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.pendingConfirm') }}</div>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="outlined" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold">—</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.visitsThisYear') }}</div>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="outlined" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold">—</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.totalGuests') }}</div>
        </VCard>
      </VCol>
    </VRow>

    <h2 class="text-h6 font-weight-bold mt-8 mb-4">{{ $t('dashboard.upcomingBookings') }}</h2>
    <VCard variant="outlined" class="pa-6 text-center text-medium-emphasis">
      {{ $t('dashboard.noUpcoming') }}
    </VCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
</script>

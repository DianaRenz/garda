<template>
  <VContainer class="py-8">
    <h1 class="text-h4 font-weight-bold mb-2">{{ $t('calendar.title') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ $t('calendar.subtitle') }}</p>

    <div class="d-flex ga-4 flex-wrap mb-6">
      <div v-for="item in legend" :key="item.key" class="d-flex align-center ga-2">
        <div class="rounded" :style="{ background: item.color, width: '14px', height: '14px', border: '1px solid rgba(0,0,0,0.08)' }" />
        <span class="text-body-2">{{ $t(`calendar.legend.${item.key}`) }}</span>
      </div>
    </div>

    <AppCalendar :bookings="bookings" />

    <div class="mt-8 text-center">
      <VBtn class="gradient primary" to="/request">{{ $t('calendar.requestBtn') }}</VBtn>
    </div>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const { bookings, subscribe } = useBookings();

onMounted(() => {
  const unsub = subscribe();
  onUnmounted(unsub);
});

const legend = [
  { key: "available",  color: "rgba(0,0,0,0.04)" },
  { key: "pending",    color: "rgba(255,193,7,0.45)" },
  { key: "confirmed",  color: "rgba(33,150,243,0.35)" },
  { key: "blocked",    color: "rgba(244,67,54,0.35)" },
];
</script>

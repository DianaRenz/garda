<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('dashboard.title') }}</h1>

    <VRow>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="outlined" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold text-primary">{{ stats.upcoming }}</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.upcomingVisits') }}</div>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="outlined" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold text-warning">{{ stats.pending }}</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.pendingConfirm') }}</div>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="outlined" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold">{{ stats.thisYear }}</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.visitsThisYear') }}</div>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="outlined" class="pa-4 text-center">
          <div class="text-h4 font-weight-bold">{{ guests.length }}</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.totalGuests') }}</div>
        </VCard>
      </VCol>
    </VRow>

    <h2 class="text-h6 font-weight-bold mt-8 mb-4">{{ $t('dashboard.upcomingBookings') }}</h2>

    <VCard variant="outlined">
      <VList v-if="upcomingBookings.length" lines="two">
        <VListItem
          v-for="b in upcomingBookings"
          :key="b.id"
          :subtitle="`${formatDate(b.startDate)} — ${formatDate(b.endDate)}`"
        >
          <template #title>
            <span class="font-weight-medium">{{ b.guestName }}</span>
          </template>
          <template #append>
            <VChip :color="statusColor[b.status]" size="small" variant="tonal">
              {{ $t(`bookings.statuses.${b.status}`) }}
            </VChip>
          </template>
        </VListItem>
      </VList>
      <div v-else class="pa-6 text-center text-medium-emphasis">
        {{ $t('dashboard.noUpcoming') }}
      </div>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { Timestamp } from "firebase/firestore";

definePageMeta({ layout: "admin", middleware: "auth" });

const { bookings, subscribe, formatDate, statusColor } = useBookings();
const { guests, subscribe: subscribeGuests } = useGuests();

const now = new Date();
const yearStart = new Date(now.getFullYear(), 0, 1);

const stats = computed(() => {
  const confirmed = bookings.value.filter((b) => b.status === "confirmed");
  return {
    upcoming: confirmed.filter((b) => b.startDate?.toDate() >= now).length,
    pending: bookings.value.filter((b) => b.status === "pending").length,
    thisYear: confirmed.filter((b) => {
      const d = b.startDate?.toDate();
      return d >= yearStart && d <= now;
    }).length,
  };
});

const upcomingBookings = computed(() =>
  bookings.value
    .filter((b) => b.status !== "blocked" && b.startDate?.toDate() >= now)
    .slice(0, 5)
);

onMounted(() => {
  const u1 = subscribe();
  const u2 = subscribeGuests();
  onUnmounted(() => { u1(); u2(); });
});
</script>

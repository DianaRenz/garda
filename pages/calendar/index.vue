<template>
  <VContainer class="py-8">
    <h1 class="text-h4 font-weight-bold mb-2">{{ $t('calendar.title') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ $t('calendar.subtitle') }}</p>

    <div class="d-flex ga-4 flex-wrap mb-6">
      <div v-for="item in legend" :key="item.key" class="d-flex align-center ga-2">
        <div
          class="rounded"
          :style="{
            background: item.color,
            width: '14px',
            height: '14px',
            border: item.border ?? '1px solid rgba(0,0,0,0.08)',
            boxSizing: 'border-box',
          }"
        />
        <span class="text-body-2">{{ $t(`calendar.legend.${item.key}`) }}</span>
      </div>
    </div>

    <AppCalendar :bookings="calendarBookings" :highlight-ids="ownBookingIds" />

    <div class="mt-8 text-center">
      <VBtn class="gradient primary" to="/request">{{ $t('calendar.requestBtn') }}</VBtn>
    </div>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const { user } = useAuth();
const { bookings, publicBookings, subscribeByUser, subscribePublic } = useBookings();

type LegendItem = { key: string; color: string; border?: string };

let unsubOwn: (() => void) | null = null;

onMounted(() => {
  const unsubPublic = subscribePublic();
  if (user.value) {
    unsubOwn = subscribeByUser(user.value.uid);
  }
  onUnmounted(() => {
    unsubPublic();
    unsubOwn?.();
  });
});

watch(user, (u) => {
  unsubOwn?.();
  unsubOwn = u ? subscribeByUser(u.uid) : null;
}, { flush: "post" });

const calendarBookings = computed(() => {
  const ownIds = new Set(ownBookingIds.value);
  const ownBookings = user.value
    ? bookings.value.filter((b) => b.status !== "rejected")
    : [];
  const publicOnly = publicBookings.value.filter((b) => !ownIds.has(b.id));
  return [...publicOnly, ...ownBookings];
});

const ownBookingIds = computed(() =>
  user.value
    ? bookings.value.filter(b => b.userId === user.value!.uid).map(b => b.id)
    : []
);

const legend = computed(() => {
  const base: LegendItem[] = [
    { key: "available", color: "rgba(0,0,0,0.04)" },
    { key: "pending",   color: "rgba(255,193,7,0.45)" },
    { key: "confirmed", color: "rgba(33,150,243,0.35)" },
    { key: "blocked",   color: "rgba(244,67,54,0.35)" },
  ];
  if (user.value) {
    base.push({ key: "mine", color: "rgba(33,150,243,0.2)", border: "2px solid rgb(99,102,241)" });
  }
  return base;
});
</script>

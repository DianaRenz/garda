<template>
  <VContainer class="py-8">
    <div v-if="loading" class="text-center py-16">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <template v-else>
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
        <VBtn class="gradient primary" @click="showRequestSheet = true">
          {{ $t('calendar.requestBtn') }}
        </VBtn>
      </div>
    </template>

    <RequestSheet
      v-model="showRequestSheet"
      :calendar-bookings="calendarBookings"
      :user-data="userData"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { CalendarBooking } from '~/composables/useBookings';

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const { subscribeCalendar } = useBookings();

const loading = ref(true);
const calendarBookings = ref<CalendarBooking[]>([]);
const currentUserId = ref<string | null>(null);
const userData = ref<{ name?: string; email?: string; phone?: string }>({});
const showRequestSheet = ref(false);

const legend = [
  { key: "available", color: "rgba(0,0,0,0.04)" },
  { key: "pending",   color: "rgba(255,193,7,0.45)" },
  { key: "confirmed", color: "rgba(33,150,243,0.35)" },
  { key: "blocked",   color: "rgba(244,67,54,0.35)" },
  { key: "mine",      color: "rgba(33,150,243,0.2)", border: "2px solid rgb(99,102,241)" },
];

const ownBookingIds = computed(() =>
  calendarBookings.value
    .filter(b => currentUserId.value && b.userId === currentUserId.value)
    .map(b => b.id)
);

let unsubCalendar: (() => void) | null = null;

onMounted(async () => {
  if (import.meta.server) return;

  const user = await new Promise<any>((resolve) => {
    const unsub = onAuthStateChanged($auth, (u) => { unsub(); resolve(u); });
  });

  if (!user) {
    await navigateTo("/login");
    return;
  }

  currentUserId.value = user.uid;

  getDoc(doc($db, "users", user.uid)).then(snap => {
    if (snap.exists()) userData.value = snap.data() as { name?: string; email?: string; phone?: string };
    else if (user.email) userData.value = { email: user.email };
  }).catch(() => {
    if (user.email) userData.value = { email: user.email };
  });

  const calResult = subscribeCalendar();
  unsubCalendar = calResult.unsub;
  watch(calResult.calendarBookings, (v) => { calendarBookings.value = v; }, { immediate: true });

  loading.value = false;
});

onUnmounted(() => {
  unsubCalendar?.();
});
</script>

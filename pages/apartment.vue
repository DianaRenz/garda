<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="10" md="8">

        <div v-if="loading" class="text-center py-16">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else>

          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-h5 font-weight-bold">{{ userData?.name || userData?.email }}</h1>
            <p class="text-body-2 text-medium-emphasis">{{ userData?.email }}</p>
          </div>

          <!-- Stats -->
          <VRow class="mb-6" dense>
            <VCol cols="6">
              <VCard variant="outlined" rounded="lg" class="pa-4" height="100%">
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="text-caption text-medium-emphasis">{{ $t('account.nextVisit') }}</span>
                  <VIcon icon="fluent:calendar-arrow-right-24-regular" size="16" color="primary" />
                </div>
                <div class="text-body-1 font-weight-bold">{{ nextVisitDate }}</div>
              </VCard>
            </VCol>
            <VCol cols="6">
              <VCard variant="outlined" rounded="lg" class="pa-4" height="100%">
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="text-caption text-medium-emphasis">{{ $t('account.totalVisits') }}</span>
                  <VIcon icon="fluent:checkmark-circle-24-regular" size="16" />
                </div>
                <div class="text-h4 font-weight-bold">{{ totalConfirmed }}</div>
              </VCard>
            </VCol>
          </VRow>

          <!-- Calendar -->
          <h2 class="text-body-2 font-weight-medium text-medium-emphasis mb-3">
            {{ $t('calendar.title') }}
          </h2>

          <!-- Legend -->
          <div class="d-flex ga-3 flex-wrap mb-4">
            <div v-for="item in legend" :key="item.key" class="d-flex align-center ga-2">
              <div
                class="rounded"
                :style="{
                  background: item.color,
                  width: '12px',
                  height: '12px',
                  border: item.border ?? '1px solid rgba(0,0,0,0.1)',
                  boxSizing: 'border-box',
                }"
              />
              <span class="text-caption">{{ $t(`calendar.legend.${item.key}`) }}</span>
            </div>
          </div>

          <VCard variant="outlined" rounded="lg" class="pa-4 mb-6">
            <AppCalendar :bookings="calendarBookings" :highlight-ids="ownBookingIds" />
          </VCard>

          <!-- Request CTA -->
          <VBtn
            class="gradient primary mb-8"
            block
            min-height="44"
            prepend-icon="fluent:calendar-add-24-regular"
            @click="showRequestSheet = true"
          >
            {{ $t('account.requestDates') }}
          </VBtn>

          <!-- Upcoming trips -->
          <h2 class="text-body-2 font-weight-medium text-medium-emphasis mb-3">
            {{ $t('account.upcoming') }}
          </h2>

          <VCard variant="outlined" rounded="lg" class="mb-8">
            <template v-if="upcoming.length">
              <div v-for="(b, i) in upcoming" :key="b.id">
                <VDivider v-if="i > 0" />
                <div class="px-4 py-3">
                  <div class="d-flex align-center justify-space-between ga-2 flex-wrap">
                    <div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">{{ bookingDuration(b) }}</div>
                      <div v-if="b.notes" class="text-caption text-medium-emphasis mt-1">{{ b.notes }}</div>
                    </div>
                    <div class="d-flex align-center ga-2 flex-shrink-0">
                      <VBtn
                        v-if="b.status === 'pending'"
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="askCancel(b.id)"
                      >
                        {{ $t('account.cancelRequest') }}
                      </VBtn>
                      <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                        {{ bookingStatusLabel(b) }}
                      </VChip>
                    </div>
                  </div>
                  <div
                    v-if="b.status === 'rejected' && b.rejectionNote"
                    class="text-caption text-medium-emphasis mt-2 pa-2 rounded"
                    style="background: rgba(0,0,0,0.04)"
                  >
                    {{ $t('account.rejectedNote') }} {{ b.rejectionNote }}
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="py-10 text-center text-medium-emphasis text-caption">
              <VIcon icon="fluent:calendar-empty-24-regular" size="24" class="mb-2 d-block mx-auto" style="opacity: 0.4" />
              {{ $t('account.noUpcoming') }}
            </div>
          </VCard>

          <!-- Past trips -->
          <h2 class="text-body-2 font-weight-medium text-medium-emphasis mb-3">
            {{ $t('account.past') }}
          </h2>

          <VCard variant="outlined" rounded="lg" class="mb-8">
            <template v-if="past.length">
              <div v-for="(b, i) in past" :key="b.id">
                <VDivider v-if="i > 0" />
                <div class="px-4 py-3" style="opacity: 0.65">
                  <div class="d-flex align-center justify-space-between ga-2 flex-wrap">
                    <div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">{{ bookingDuration(b) }}</div>
                    </div>
                    <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                      {{ bookingStatusLabel(b) }}
                    </VChip>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="py-8 text-center text-medium-emphasis text-caption">
              {{ $t('account.noPast') }}
            </div>
          </VCard>

          <!-- Apartment info -->
          <template v-if="apartment && (apartment.address || apartment.directions || apartment.rules)">
            <h2 class="text-body-2 font-weight-medium text-medium-emphasis mb-3">
              {{ $t('apartment.title') }}
            </h2>
            <VCard rounded="lg" variant="outlined" class="mb-8">
              <VCardText class="pa-4">
                <div v-if="apartment.address" class="d-flex ga-3" :class="{ 'mb-4': apartment.directions || apartment.rules }">
                  <VIcon icon="fluent:location-24-regular" color="primary" size="20" style="flex-shrink:0;margin-top:2px" />
                  <div>
                    <div class="font-weight-medium text-body-2 mb-1">{{ $t('settings.address') }}</div>
                    <div class="text-body-2 text-medium-emphasis" style="white-space:pre-line;">{{ apartment.address }}</div>
                  </div>
                </div>
                <VDivider v-if="apartment.address && apartment.directions" class="mb-4" />
                <div v-if="apartment.directions" class="d-flex ga-3" :class="{ 'mb-4': apartment.rules }">
                  <VIcon icon="fluent:vehicle-car-24-regular" color="primary" size="20" style="flex-shrink:0;margin-top:2px" />
                  <div>
                    <div class="font-weight-medium text-body-2 mb-1">{{ $t('settings.directions') }}</div>
                    <div class="text-body-2 text-medium-emphasis" style="white-space:pre-line;">{{ apartment.directions }}</div>
                  </div>
                </div>
                <VDivider v-if="apartment.rules" class="mb-4" />
                <div v-if="apartment.rules" class="d-flex ga-3">
                  <VIcon icon="fluent:document-24-regular" color="primary" size="20" style="flex-shrink:0;margin-top:2px" />
                  <div>
                    <div class="font-weight-medium text-body-2 mb-1">{{ $t('settings.rules') }}</div>
                    <div class="text-body-2 text-medium-emphasis" style="white-space:pre-line;">{{ apartment.rules }}</div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </template>

        </template>
      </VCol>
    </VRow>

    <!-- Request sheet -->
    <RequestSheet
      v-model="showRequestSheet"
      :calendar-bookings="calendarBookings"
      :user-data="userData ?? {}"
    />

    <!-- Cancel dialog -->
    <VDialog v-model="cancelDialog" max-width="360">
      <VCard rounded="lg">
        <VCardText class="pa-5">
          <p class="text-body-1 font-weight-medium">{{ $t('account.cancelConfirm') }}</p>
        </VCardText>
        <VCardActions class="px-5 pb-5 pt-0">
          <VBtn variant="text" @click="cancelDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VSpacer />
          <VBtn color="error" variant="tonal" :loading="cancelling" @click="doCancel">
            {{ $t('account.cancelRequest') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

  </VContainer>
</template>

<script setup lang="ts">
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import type { Booking, CalendarBooking } from '~/composables/useBookings';

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const { apartment, fetchApartment } = useApartment();
const { subscribeCalendar, deleteBooking, formatDate, statusColor } = useBookings();
const { t } = useI18n();

const loading = ref(true);
const userData = ref<{ name?: string; email?: string; phone?: string } | null>(null);
const myBookings = ref<Booking[]>([]);
const calendarBookings = ref<CalendarBooking[]>([]);
const showRequestSheet = ref(false);
const currentUserId = ref<string | null>(null);
const cancelDialog = ref(false);
const cancelling = ref(false);
const cancelId = ref<string | null>(null);

const today = new Date();
today.setHours(0, 0, 0, 0);

const upcoming = computed(() =>
  myBookings.value
    .filter(b => b.endDate && b.endDate.toDate() >= today)
    .sort((a, b) => a.startDate.seconds - b.startDate.seconds)
);

const past = computed(() =>
  myBookings.value
    .filter(b => b.endDate && b.endDate.toDate() < today)
    .sort((a, b) => b.startDate.seconds - a.startDate.seconds)
);

const nextVisitDate = computed(() => {
  const next = upcoming.value.find(b => b.status === 'confirmed' || b.status === 'pending');
  return next ? formatDate(next.startDate) : '—';
});

const totalConfirmed = computed(() =>
  myBookings.value.filter(b => b.status === 'confirmed').length
);

const ownBookingIds = computed(() =>
  calendarBookings.value
    .filter(b => currentUserId.value && b.userId === currentUserId.value)
    .map(b => b.id)
);

const legend = [
  { key: "available", color: "rgba(0,0,0,0.04)" },
  { key: "pending",   color: "rgba(255,193,7,0.45)" },
  { key: "confirmed", color: "rgba(33,150,243,0.35)" },
  { key: "blocked",   color: "rgba(244,67,54,0.35)" },
  { key: "mine",      color: "rgba(33,150,243,0.2)", border: "2px solid rgb(99,102,241)" },
];

const bookingStatusLabel = (b: Booking): string => {
  if (b.status === 'pending') return t('account.pendingStatus');
  if (b.status === 'confirmed') return t('account.confirmedStatus');
  return t(`bookings.statuses.${b.status}`);
};

const bookingDuration = (b: Booking): string => {
  if (!b.startDate || !b.endDate) return '';
  const nights = Math.max(1, Math.round(
    (b.endDate.toDate().getTime() - b.startDate.toDate().getTime()) / 86400000
  ));
  return t('bookings.nights', { count: nights });
};

let unsubCalendar: (() => void) | null = null;
let unsubOwn: (() => void) | null = null;

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

  await Promise.all([
    getDoc(doc($db, "users", user.uid)).then(snap => {
      if (snap.exists()) userData.value = snap.data() as { name?: string; email?: string; phone?: string };
    }).catch(() => {}),
    fetchApartment().catch(() => {}),
  ]);

  const calResult = subscribeCalendar();
  unsubCalendar = calResult.unsub;
  watch(calResult.calendarBookings, (v) => { calendarBookings.value = v; }, { immediate: true });

  const q = query(
    collection($db, "bookings"),
    where("userId", "==", user.uid),
    orderBy("startDate", "asc")
  );
  unsubOwn = onSnapshot(q, (snap) => {
    myBookings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
  });

  loading.value = false;
});

onUnmounted(() => {
  unsubCalendar?.();
  unsubOwn?.();
});

const askCancel = (id: string) => {
  cancelId.value = id;
  cancelDialog.value = true;
};

const doCancel = async () => {
  if (!cancelId.value) return;
  cancelling.value = true;
  try {
    await deleteBooking(cancelId.value);
    cancelDialog.value = false;
  } finally {
    cancelling.value = false;
  }
};
</script>

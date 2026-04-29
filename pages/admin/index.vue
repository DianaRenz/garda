<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('dashboard.title') }}</h1>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{ error }}</VAlert>

    <VRow>
      <VCol v-for="stat in statCards" :key="stat.key" cols="6" md="3">
        <VCard variant="outlined" rounded="lg" class="pa-4" height="100%">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-caption text-medium-emphasis">{{ stat.label }}</span>
            <VIcon :icon="stat.icon" :color="stat.color || undefined" size="16" />
          </div>
          <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Current stays -->
    <template v-if="currentStays.length">
      <h2 class="text-body-2 font-weight-medium text-medium-emphasis mt-8 mb-3">
        {{ $t('dashboard.currentStays') }}
      </h2>
      <VCard variant="outlined" rounded="lg" class="mb-2">
        <div v-for="(b, i) in currentStays" :key="b.id">
          <VDivider v-if="i > 0" />
          <div
            class="d-flex align-center justify-space-between px-4 py-3 ga-3 cursor-pointer"
            :style="{ borderLeft: `3px solid rgb(var(--v-theme-primary))` }"
            @click="goToBookings(b.id)"
          >
            <div class="flex-grow-1 min-width-0">
              <div class="text-body-2 font-weight-medium">{{ b.guestName || $t('bookings.unassigned') }}</div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
              </div>
            </div>
            <VChip color="primary" size="small" variant="tonal">
              {{ $t('bookings.statuses.confirmed') }}
            </VChip>
          </div>
        </div>
      </VCard>
    </template>

    <!-- Upcoming bookings -->
    <h2 class="text-body-2 font-weight-medium text-medium-emphasis mt-8 mb-3">
      {{ $t('dashboard.upcomingBookings') }}
    </h2>

    <div class="d-flex ga-2 mb-3">
      <VChip
        :variant="filterStatus === 'all' ? 'flat' : 'tonal'"
        color="default"
        size="small"
        @click="filterStatus = 'all'"
      >
        {{ $t('dashboard.filterAll') }}
      </VChip>
      <VChip
        :variant="filterStatus === 'pending' ? 'flat' : 'tonal'"
        :color="statusColor['pending']"
        size="small"
        @click="filterStatus = 'pending'"
      >
        {{ $t('bookings.statuses.pending') }}
      </VChip>
      <VChip
        :variant="filterStatus === 'confirmed' ? 'flat' : 'tonal'"
        :color="statusColor['confirmed']"
        size="small"
        @click="filterStatus = 'confirmed'"
      >
        {{ $t('bookings.statuses.confirmed') }}
      </VChip>
    </div>

    <VCard variant="outlined" rounded="lg">
      <template v-if="upcomingBookings.length">
        <div v-for="(b, i) in upcomingBookings" :key="b.id">
          <VDivider v-if="i > 0" />
          <div
            class="d-flex align-center justify-space-between px-4 py-3 ga-3 cursor-pointer"
            :style="{ borderLeft: `3px solid rgb(var(--v-theme-${statusColor[b.status]}))` }"
            @click="goToBookings(b.id)"
          >
            <div class="flex-grow-1 min-width-0">
              <div class="text-body-2 font-weight-medium">{{ b.guestName || $t('bookings.unassigned') }}</div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
              </div>
            </div>
            <div class="d-flex align-center ga-2 flex-shrink-0" @click.stop>
              <VBtn
                v-if="b.status === 'pending'"
                size="x-small"
                variant="tonal"
                color="primary"
                :loading="confirming === b.id"
                @click="confirm(b.id)"
              >
                {{ $t('bookings.actions.confirm') }}
              </VBtn>
              <VBtn
                v-if="b.status === 'pending'"
                size="x-small"
                variant="tonal"
                color="error"
                @click="openReject(b.id)"
              >
                {{ $t('bookings.actions.reject') }}
              </VBtn>
              <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                {{ $t(`bookings.statuses.${b.status}`) }}
              </VChip>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="py-10 text-center text-medium-emphasis text-caption">
        <VIcon icon="fluent:calendar-empty-24-regular" size="24" class="mb-2 d-block mx-auto" style="opacity: 0.4" />
        {{ $t('dashboard.noUpcoming') }}
      </div>
    </VCard>
    <VBtn v-if="totalUpcoming > 10" variant="text" size="small" to="/admin/bookings" class="mt-2">
      {{ $t('dashboard.viewAll') }}
    </VBtn>
    <!-- Reject dialog -->
    <VDialog v-model="rejectDialog" max-width="480">
      <VCard rounded="lg">
        <VCardTitle class="pa-6 pb-2">{{ $t('bookings.rejectDialog.title') }}</VCardTitle>
        <VCardText>
          <label class="label text-grey-darken-2">{{ $t('bookings.rejectDialog.note') }}</label>
          <VTextarea
            v-model="rejectNote"
            :placeholder="$t('bookings.rejectDialog.notePlaceholder')"
            rows="3"
          />
        </VCardText>
        <VCardActions class="pa-6 pt-0 ga-2">
          <VSpacer />
          <VBtn variant="text" @click="rejectDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="error" variant="tonal" :loading="rejecting" @click="doReject">
            {{ $t('bookings.rejectDialog.confirm') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const { bookings, subscribe, updateBooking, formatDate, statusColor } = useBookings();
const { guests, subscribe: subscribeGuests } = useGuests();
const { notifyGuestStatusUpdate } = useNotifications();
const { t } = useI18n();

const filterStatus = ref<'all' | 'pending' | 'confirmed'>('all');
const confirming = ref<string | null>(null);
const rejectDialog = ref(false);
const rejecting = ref(false);
const rejectNote = ref('');
const rejectId = ref<string | null>(null);
const error = ref('');

const toIso = (ts: any) => ts?.toDate?.().toISOString().slice(0, 10) ?? '';

const confirm = async (id: string) => {
  confirming.value = id;
  try {
    const booking = bookings.value.find(b => b.id === id);
    await updateBooking(id, { status: "confirmed" });
    if (booking?.guestEmail) {
      notifyGuestStatusUpdate({ guestName: booking.guestName, guestEmail: booking.guestEmail,
        status: 'confirmed', startDate: toIso(booking.startDate), endDate: toIso(booking.endDate) }).catch(() => {});
    }
  } catch {
    error.value = t('common.error');
  } finally {
    confirming.value = null;
  }
};

const openReject = (id: string) => {
  rejectId.value = id;
  rejectNote.value = '';
  rejectDialog.value = true;
};

const doReject = async () => {
  if (!rejectId.value) return;
  rejecting.value = true;
  try {
    const booking = bookings.value.find(b => b.id === rejectId.value);
    await updateBooking(rejectId.value, { status: 'rejected', rejectionNote: rejectNote.value || null });
    if (booking?.guestEmail) {
      notifyGuestStatusUpdate({ guestName: booking.guestName, guestEmail: booking.guestEmail,
        status: 'rejected', startDate: toIso(booking.startDate), endDate: toIso(booking.endDate),
        rejectionNote: rejectNote.value || undefined }).catch(() => {});
    }
    rejectDialog.value = false;
  } catch {
    error.value = t('common.error');
  } finally {
    rejecting.value = false;
  }
};

const goToBookings = (bookingId?: string) => {
  navigateTo({
    path: '/admin/bookings',
    query: bookingId ? { booking: bookingId } : undefined,
  });
};

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const yearStart = new Date(now.getFullYear(), 0, 1);

const stats = computed(() => {
  const confirmed = bookings.value.filter((b) => b.status === "confirmed");
  return {
    upcoming: confirmed.filter((b) => b.startDate?.toDate() >= today).length,
    pending: bookings.value.filter((b) => b.status === "pending").length,
    thisYear: confirmed.filter((b) => {
      const d = b.startDate?.toDate();
      return d >= yearStart && d <= now;
    }).length,
  };
});

const statCards = computed(() => [
  {
    key: "upcoming",
    value: stats.value.upcoming,
    label: t("dashboard.upcomingVisits"),
    icon: "fluent:calendar-arrow-right-24-regular",
    color: "primary",
  },
  {
    key: "pending",
    value: stats.value.pending,
    label: t("dashboard.pendingConfirm"),
    icon: "fluent:clock-24-regular",
    color: "warning",
  },
  {
    key: "thisYear",
    value: stats.value.thisYear,
    label: t("dashboard.visitsThisYear"),
    icon: "fluent:calendar-checkmark-24-regular",
    color: null,
  },
  {
    key: "guests",
    value: guests.value.length,
    label: t("dashboard.totalGuests"),
    icon: "fluent:people-24-regular",
    color: null,
  },
]);

const currentStays = computed(() =>
  bookings.value.filter((b) =>
    b.status === "confirmed" &&
    b.startDate?.toDate() <= today &&
    b.endDate?.toDate() >= today
  )
);

const allUpcoming = computed(() => {
  const stayIds = new Set(currentStays.value.map(b => b.id));
  return bookings.value
    .filter((b) =>
      b.status !== "blocked" &&
      b.status !== "rejected" &&
      b.status !== "cancelled" &&
      b.startDate?.toDate() >= today &&
      !stayIds.has(b.id)
    )
    .sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return (a.startDate?.toDate()?.getTime() ?? 0) - (b.startDate?.toDate()?.getTime() ?? 0);
    });
});

const totalUpcoming = computed(() => {
  if (filterStatus.value === 'all') return allUpcoming.value.length;
  return allUpcoming.value.filter(b => b.status === filterStatus.value).length;
});

const upcomingBookings = computed(() => {
  const list = filterStatus.value === 'all'
    ? allUpcoming.value
    : allUpcoming.value.filter(b => b.status === filterStatus.value);
  return list.slice(0, 10);
});

onMounted(() => {
  const u1 = subscribe();
  const u2 = subscribeGuests();
  onUnmounted(() => { u1(); u2(); });
});
</script>

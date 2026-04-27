<template>
  <VBottomSheet v-model="model" :max-width="600">
    <VCard rounded="t-xl">
      <VCardTitle class="pa-5 pb-3 d-flex align-center justify-space-between">
        <span>{{ $t('request.title') }}</span>
        <VBtn icon="fluent:dismiss-24-regular" variant="text" size="small" aria-label="Close" @click="model = false" />
      </VCardTitle>

      <VCardText class="pa-5 pt-0">
        <template v-if="!success">
          <!-- Profile card -->
          <VCard variant="tonal" rounded="lg" class="mb-5 pa-4 d-flex align-center ga-3">
            <VIcon icon="fluent:person-circle-24-regular" color="primary" size="36" />
            <div>
              <div class="font-weight-medium">{{ userData.name || userData.email }}</div>
              <div v-if="userData.name && userData.email" class="text-body-2 text-medium-emphasis">{{ userData.email }}</div>
              <div v-if="userData.phone" class="text-body-2 text-medium-emphasis">{{ userData.phone }}</div>
            </div>
          </VCard>

          <VForm ref="formRef" @submit.prevent="submit">
            <!-- Date range picker -->
            <label class="label text-grey-darken-2">{{ $t('request.selectDates') }}</label>
            <div class="d-flex justify-center mb-1">
              <VDatePicker
                v-model="dateRange"
                multiple="range"
                :min="todayDate"
                :first-day-of-week="1"
                color="primary"
                show-adjacent-months
                hide-header
                :events="Object.keys(bookingEvents)"
                :event-color="(date: string) => bookingEvents[date] ?? ''"
                class="request-date-picker"
              />
            </div>

            <!-- Legend for booking dots -->
            <div class="d-flex justify-center ga-4 mb-3">
              <div class="d-flex align-center ga-1 text-caption">
                <span class="event-dot bg-error" />
                {{ $t('calendar.legend.confirmed') }}
              </div>
              <div class="d-flex align-center ga-1 text-caption">
                <span class="event-dot bg-warning" />
                {{ $t('calendar.legend.pending') }}
              </div>
            </div>

            <!-- Selected range display -->
            <div v-if="dateRangeReady" class="text-body-2 font-weight-medium text-center mb-2">
              {{ formatDateShort(formStartDate) }} — {{ formatDateShort(formEndDate) }}
              <span class="text-medium-emphasis ml-1">({{ nightsLabel }})</span>
            </div>

            <!-- Validation error -->
            <div v-if="showDateError" class="text-caption text-error text-center mb-2">
              {{ $t('request.datesRequired') }}
            </div>

            <VAlert v-if="blockingConflicts.length" type="error" variant="tonal" density="comfortable" class="mt-2 mb-3">
              {{ $t('request.conflictBlocked') }}
              <div v-for="b in blockingConflicts" :key="b.id" class="text-body-2 mt-1">
                {{ formatBookingDate(b.startDate) }} — {{ formatBookingDate(b.endDate) }}
              </div>
            </VAlert>
            <VAlert v-else-if="pendingConflicts.length" type="warning" variant="tonal" density="comfortable" class="mt-2 mb-3">
              {{ $t('request.conflictPending') }}
              <div v-for="b in pendingConflicts" :key="b.id" class="text-body-2 mt-1">
                {{ formatBookingDate(b.startDate) }} — {{ formatBookingDate(b.endDate) }}
              </div>
            </VAlert>

            <!-- Notes -->
            <div class="mt-2">
              <label class="label text-grey-darken-2">{{ $t('request.notes') }}</label>
              <VTextarea v-model="form.notes" rows="3" auto-grow />
            </div>

            <VAlert v-if="submitError" type="error" variant="tonal" class="mt-4">
              {{ submitError }}
            </VAlert>

            <VBtn
              type="submit"
              block
              min-height="44"
              class="gradient primary mt-4"
              :loading="loading"
              :disabled="blockingConflicts.length > 0"
            >
              {{ $t('request.submit') }}
            </VBtn>
          </VForm>
        </template>

        <template v-else>
          <VAlert type="success" variant="tonal" class="mb-5">
            {{ $t('request.success') }}
          </VAlert>
          <VBtn block variant="outlined" @click="model = false">
            {{ $t('common.close') }}
          </VBtn>
        </template>
      </VCardText>
    </VCard>
  </VBottomSheet>
</template>

<script setup lang="ts">
import { onAuthStateChanged } from "firebase/auth";
import type { CalendarBooking } from '~/composables/useBookings';

const props = defineProps<{
  modelValue: boolean;
  calendarBookings: CalendarBooking[];
  userData: { name?: string; email?: string; phone?: string };
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const { $auth } = useNuxtApp();
const { createBooking, formatDate: formatBookingDate } = useBookings();
const { notifyAdminNewRequest } = useNotifications();
const { t, locale } = useI18n();

const intlLocale = computed(() =>
  ({ ru: 'ru-RU', en: 'en-US', de: 'de-DE' }[locale.value] ?? locale.value)
);

const formRef = ref();
const loading = ref(false);
const success = ref(false);
const submitError = ref("");
const showDateError = ref(false);
const currentUserId = ref<string | null>(null);

const dateRange = ref<Date[]>([]);
const form = reactive({
  notes: "",
});

const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Map booked dates → color for VDatePicker events
const bookingEvents = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const b of props.calendarBookings) {
    if (!b.startDate || !b.endDate) continue;
    const color = b.status === 'pending' ? 'warning' : 'error';
    const start = b.startDate.toDate();
    const end = b.endDate.toDate();
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = toIso(cursor);
      // error takes priority over warning
      if (!map[key] || color === 'error') map[key] = color;
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return map;
});

// Derive start/end from the range picker
const sortedRange = computed<{ start: Date; end: Date } | null>(() => {
  if (dateRange.value.length < 2) return null;
  const sorted = [...dateRange.value].sort((a, b) => a.getTime() - b.getTime());
  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  if (!start || !end) return null;
  return { start, end };
});

const formStartDate = computed(() => sortedRange.value ? toIso(sortedRange.value.start) : "");
const formEndDate = computed(() => sortedRange.value ? toIso(sortedRange.value.end) : "");
const dateRangeReady = computed(() => !!sortedRange.value && formStartDate.value < formEndDate.value);

const nights = computed(() => {
  if (!sortedRange.value) return 0;
  const { start, end } = sortedRange.value;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
});

const nightsLabel = computed(() => t('bookings.nights', { count: nights.value }));

const formatDateShort = (isoDate: string) => {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(intlLocale.value, {
    day: "numeric",
    month: "short",
  });
};

// Clear date error when user picks dates
watch(dateRange, () => {
  showDateError.value = false;
});

const overlapsSelectedRange = (booking: CalendarBooking) => {
  if (!dateRangeReady.value || !booking.startDate || !booking.endDate) return false;
  const start = toIso(booking.startDate.toDate());
  const end = toIso(booking.endDate.toDate());
  return formStartDate.value < end && formEndDate.value > start;
};

const rangeConflicts = computed(() =>
  props.calendarBookings.filter(overlapsSelectedRange)
);

const blockingConflicts = computed(() =>
  rangeConflicts.value.filter((b) => b.status === "confirmed" || b.status === "blocked")
);

const pendingConflicts = computed(() =>
  rangeConflicts.value.filter((b) => b.status === "pending")
);

onMounted(() => {
  const unsub = onAuthStateChanged($auth, (u) => {
    currentUserId.value = u?.uid ?? null;
    unsub();
  });
});

// Reset form when sheet opens
watch(() => props.modelValue, (open) => {
  if (open) {
    dateRange.value = [];
    form.notes = "";
    submitError.value = "";
    showDateError.value = false;
    success.value = false;
  }
});

const submit = async () => {
  if (!dateRangeReady.value) {
    showDateError.value = true;
    return;
  }
  const { valid } = await formRef.value.validate();
  if (!valid || blockingConflicts.value.length) return;
  loading.value = true;
  submitError.value = "";
  try {
    await createBooking({
      guestName: props.userData.name || props.userData.email || "",
      guestPhone: props.userData.phone || "",
      guestEmail: props.userData.email || "",
      startDate: formStartDate.value,
      endDate: formEndDate.value,
      notes: form.notes,
      status: "pending",
      source: "request",
      guestId: null,
      userId: currentUserId.value,
    });
    notifyAdminNewRequest({
      guestName: props.userData.name || props.userData.email || "",
      guestEmail: props.userData.email || "",
      guestPhone: props.userData.phone || "",
      startDate: formStartDate.value,
      endDate: formEndDate.value,
      notes: form.notes,
    }).catch(() => {});
    success.value = true;
  } catch (e) {
    if (import.meta.dev) console.error('[RequestSheet] submit failed:', e);
    submitError.value = t('request.submitError');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.request-date-picker {
  border: none !important;
  box-shadow: none !important;
}
.request-date-picker :deep(.v-picker__body) {
  max-width: 100%;
}
.event-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>

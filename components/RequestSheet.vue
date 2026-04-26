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
            <!-- Dates -->
            <VRow dense>
              <VCol cols="12" sm="6">
                <label class="label text-grey-darken-2">{{ $t('request.startDate') }}</label>
                <VTextField v-model="form.startDate" :rules="startDateRules" :min="todayIso" type="date" />
              </VCol>
              <VCol cols="12" sm="6">
                <label class="label text-grey-darken-2">{{ $t('request.endDate') }}</label>
                <VTextField v-model="form.endDate" :rules="endDateRules" :min="minEndDate" type="date" />
              </VCol>
            </VRow>

            <VAlert v-if="blockingConflicts.length" type="error" variant="tonal" density="comfortable" class="mt-2 mb-3">
              {{ $t('request.conflictBlocked') }}
              <div v-for="b in blockingConflicts" :key="b.id" class="text-body-2 mt-1">
                {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
              </div>
            </VAlert>
            <VAlert v-else-if="pendingConflicts.length" type="warning" variant="tonal" density="comfortable" class="mt-2 mb-3">
              {{ $t('request.conflictPending') }}
              <div v-for="b in pendingConflicts" :key="b.id" class="text-body-2 mt-1">
                {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
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
const { ruleRequired } = useFormRules();
const { createBooking, formatDate } = useBookings();
const { notifyAdminNewRequest } = useNotifications();
const { t } = useI18n();

const formRef = ref();
const loading = ref(false);
const success = ref(false);
const submitError = ref("");
const currentUserId = ref<string | null>(null);

const form = reactive({
  startDate: "",
  endDate: "",
  notes: "",
});

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIso(date);
};

const todayIso = toIso(new Date());
const minEndDate = computed(() => form.startDate ? addDays(form.startDate, 1) : todayIso);
const dateRangeReady = computed(() => !!form.startDate && !!form.endDate && form.endDate > form.startDate);

const startDateRules = computed(() => [
  ruleRequired,
  (v: string) => !v || v >= todayIso || t('request.startDateError'),
]);

const endDateRules = computed(() => [
  ruleRequired,
  (v: string) => !form.startDate || !v || v > form.startDate || t('request.endDateError'),
]);

const overlapsSelectedRange = (booking: CalendarBooking) => {
  if (!dateRangeReady.value || !booking.startDate || !booking.endDate) return false;
  const start = toIso(booking.startDate.toDate());
  const end = toIso(booking.endDate.toDate());
  return form.startDate < end && form.endDate > start;
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
    form.startDate = "";
    form.endDate = "";
    form.notes = "";
    submitError.value = "";
    success.value = false;
  }
});

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid || blockingConflicts.value.length) return;
  loading.value = true;
  submitError.value = "";
  try {
    await createBooking({
      guestName: props.userData.name || props.userData.email || "",
      guestPhone: props.userData.phone || "",
      guestEmail: props.userData.email || "",
      startDate: form.startDate,
      endDate: form.endDate,
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
      startDate: form.startDate,
      endDate: form.endDate,
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

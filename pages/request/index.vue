<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="8" md="6">
        <NuxtLink :to="backTo" class="text-body-2 text-medium-emphasis d-flex align-center ga-1 mb-6">
          {{ $t(backLabel) }}
        </NuxtLink>

        <div class="mb-8">
          <h1 class="text-h4 font-weight-bold mb-2">{{ $t('request.title') }}</h1>
          <p class="text-medium-emphasis">{{ $t('request.subtitle') }}</p>
        </div>

        <VForm v-if="!success" ref="formRef" @submit.prevent="submit">
          <section class="request-section">
            <div class="section-heading">
              <VIcon icon="fluent:person-24-regular" color="primary" />
              <h2>{{ $t('request.sections.guest') }}</h2>
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('request.name') }}</label>
              <VTextField v-model="form.name" :rules="[ruleRequired]" prepend-inner-icon="fluent:person-24-regular" autocomplete="name" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('request.email') }}</label>
              <VTextField v-model="form.email" :rules="[ruleRequired, ruleEmail]" prepend-inner-icon="fluent:mail-24-regular" type="email" autocomplete="email" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('request.phone') }}</label>
              <VTextField v-model="form.phone" prepend-inner-icon="fluent:call-24-regular" type="tel" autocomplete="tel" :hint="$t('request.phoneHint')" persistent-hint />
            </div>
          </section>

          <section class="request-section">
            <div class="section-heading">
              <VIcon icon="fluent:calendar-ltr-24-regular" color="primary" />
              <h2>{{ $t('request.sections.dates') }}</h2>
            </div>
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

            <VAlert v-if="bookingLoadError" type="warning" variant="tonal" density="comfortable" class="mt-2">
              {{ $t('request.availabilityUnknown') }}
            </VAlert>
            <VAlert v-else-if="blockingConflicts.length" type="error" variant="tonal" density="comfortable" class="mt-2">
              {{ $t('request.conflictBlocked') }}
              <div v-for="b in blockingConflicts" :key="b.id" class="text-body-2 mt-1">
                {{ bookingDateText(b) }}
              </div>
            </VAlert>
            <VAlert v-else-if="pendingConflicts.length" type="warning" variant="tonal" density="comfortable" class="mt-2">
              {{ $t('request.conflictPending') }}
              <div v-for="b in pendingConflicts" :key="b.id" class="text-body-2 mt-1">
                {{ bookingDateText(b) }}
              </div>
            </VAlert>
            <VAlert v-else-if="dateRangeReady" type="success" variant="tonal" density="comfortable" class="mt-2">
              {{ $t('request.datesAvailable') }}
            </VAlert>
          </section>

          <section class="request-section">
            <div class="section-heading">
              <VIcon icon="fluent:note-24-regular" color="primary" />
              <h2>{{ $t('request.sections.details') }}</h2>
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('request.notes') }}</label>
              <VTextarea v-model="form.notes" rows="3" auto-grow />
            </div>
          </section>

          <VAlert v-if="submitError" type="error" variant="tonal" class="mt-4">
            {{ submitError }}
          </VAlert>

          <div class="mt-6">
            <VBtn type="submit" block min-height="44" class="gradient primary" :loading="loading" :disabled="blockingConflicts.length > 0">
              {{ $t('request.submit') }}
            </VBtn>
          </div>
        </VForm>

        <template v-else>
          <VAlert type="success" variant="tonal" class="mb-6">
            {{ $t('request.success') }}
          </VAlert>
          <div class="d-flex ga-3 flex-wrap">
            <VBtn to="/calendar" variant="outlined" prepend-icon="fluent:calendar-ltr-24-regular">
              {{ $t('request.viewCalendar') }}
            </VBtn>
            <VBtn v-if="user" to="/account" class="gradient primary" prepend-icon="fluent:person-24-regular">
              {{ $t('request.viewAccount') }}
            </VBtn>
          </div>
        </template>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { doc, getDoc } from "firebase/firestore";
import type { PublicBooking } from '~/composables/useBookings';

definePageMeta({ layout: "default" });

const { $db } = useNuxtApp();
const { user } = useAuth();
const { ruleRequired, ruleEmail } = useFormRules();
const { publicBookings, subscribePublic, createBooking, formatDate } = useBookings();
const { t } = useI18n();

const loading = ref(false);
const success = ref(false);
const submitError = ref("");
const bookingLoadError = ref(false);
const formRef = ref();
const currentUserId = ref<string | null>(null);

let unsubscribeBookings: (() => void) | null = null;

const backTo = computed(() => user.value ? "/account" : "/calendar");
const backLabel = computed(() => user.value ? "request.backToAccount" : "request.back");

const form = reactive({
  name: "",
  phone: "",
  email: "",
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

const overlapsSelectedRange = (booking: PublicBooking) => {
  if (!dateRangeReady.value || !booking.startDate || !booking.endDate) return false;
  const start = toIso(booking.startDate.toDate());
  const end = toIso(booking.endDate.toDate());
  return form.startDate < end && form.endDate > start;
};

const rangeConflicts = computed(() =>
  publicBookings.value.filter((booking) => overlapsSelectedRange(booking))
);

const blockingConflicts = computed(() =>
  rangeConflicts.value.filter((booking) => ["confirmed", "blocked"].includes(booking.status))
);

const pendingConflicts = computed(() =>
  rangeConflicts.value.filter((booking) => booking.status === "pending")
);

const bookingDateText = (booking: PublicBooking) =>
  `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`;

onMounted(() => {
  try {
    unsubscribeBookings = subscribePublic();
  } catch {
    bookingLoadError.value = true;
  }
});

onUnmounted(() => {
  unsubscribeBookings?.();
});

// Pre-fill from user profile when available
watch(user, async (u) => {
  if (!u || currentUserId.value) return;
  currentUserId.value = u.uid;
  try {
    const snap = await getDoc(doc($db, "users", u.uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.name) form.name = data.name;
      if (data.phone) form.phone = data.phone;
      if (data.email) form.email = data.email;
    }
    // fallback: use auth email if not in profile
    if (!form.email && u.email) form.email = u.email;
  } catch {
    // pre-fill is best-effort
  }
}, { immediate: true });

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  if (blockingConflicts.value.length) {
    submitError.value = t('request.conflictSubmitError');
    return;
  }
  loading.value = true;
  submitError.value = "";
  try {
    await createBooking({
      guestName: form.name,
      guestPhone: form.phone,
      guestEmail: form.email,
      startDate: form.startDate,
      endDate: form.endDate,
      notes: form.notes,
      status: "pending",
      source: "request",
      guestId: null,
      userId: currentUserId.value,
    });
    success.value = true;
  } catch {
    submitError.value = t('request.submitError');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.request-section {
  padding: 18px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.request-section:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.section-heading h2 {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
}
</style>

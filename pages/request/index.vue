<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="8" md="6">
        <NuxtLink :to="backTo" class="text-body-2 text-medium-emphasis d-flex align-center ga-1 mb-6">
          {{ $t(backLabel) }}
        </NuxtLink>

        <h1 class="text-h4 font-weight-bold mb-2">{{ $t('request.title') }}</h1>
        <p class="text-medium-emphasis mb-8">{{ $t('request.subtitle') }}</p>

        <VForm v-if="!success" ref="formRef" @submit.prevent="submit">
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.name') }}</label>
            <VTextField v-model="form.name" :rules="[ruleRequired]" prepend-inner-icon="fluent:person-24-regular" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.phone') }}</label>
            <VTextField v-model="form.phone" :rules="[ruleRequired]" prepend-inner-icon="fluent:call-24-regular" type="tel" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.email') }}</label>
            <VTextField v-model="form.email" :rules="[ruleRequired, ruleEmail]" prepend-inner-icon="fluent:mail-24-regular" type="email" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.startDate') }}</label>
            <VTextField v-model="form.startDate" :rules="[ruleRequired]" type="date" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.endDate') }}</label>
            <VTextField v-model="form.endDate" :rules="endDateRules" type="date" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.notes') }}</label>
            <VTextarea v-model="form.notes" rows="3" />
          </div>

          <VAlert v-if="submitError" type="error" variant="tonal" class="mt-4">
            {{ $t('common.error') }}
          </VAlert>

          <div class="mt-6">
            <VBtn type="submit" block min-height="44" class="gradient primary" :loading="loading">
              {{ $t('request.submit') }}
            </VBtn>
          </div>
        </VForm>

        <template v-else>
          <VAlert type="success" variant="tonal" class="mb-6">
            {{ $t('request.success') }}
          </VAlert>
          <VBtn :to="backTo" variant="outlined">
            {{ $t(backLabel) }}
          </VBtn>
        </template>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { doc, getDoc } from "firebase/firestore";

definePageMeta({ layout: "default" });

const { $db } = useNuxtApp();
const { user } = useAuth();
const { ruleRequired, ruleEmail } = useFormRules();
const { createBooking } = useBookings();
const { t } = useI18n();

const loading = ref(false);
const success = ref(false);
const submitError = ref(false);
const formRef = ref();
const currentUserId = ref<string | null>(null);

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

const endDateRules = computed(() => [
  ruleRequired,
  (v: string) => !form.startDate || !v || v > form.startDate || t('request.endDateError'),
]);

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
  loading.value = true;
  submitError.value = false;
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
    submitError.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

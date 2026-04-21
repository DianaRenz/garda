<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="8" md="6">
        <NuxtLink to="/calendar" class="text-body-2 text-medium-emphasis d-flex align-center ga-1 mb-6">
          {{ $t('request.back') }}
        </NuxtLink>

        <h1 class="text-h4 font-weight-bold mb-2">{{ $t('request.title') }}</h1>
        <p class="text-medium-emphasis mb-8">{{ $t('request.subtitle') }}</p>

        <VForm v-if="!success" ref="formRef" @submit.prevent="submit">
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.name') }}</label>
            <VTextField v-model="form.name" :rules="[ruleRequired]" prepend-inner-icon="fluent:person-24-regular" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.contact') }}</label>
            <VTextField v-model="form.contact" :rules="[ruleRequired]" prepend-inner-icon="fluent:mail-24-regular" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.startDate') }}</label>
            <VTextField v-model="form.startDate" :rules="[ruleRequired]" type="date" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.endDate') }}</label>
            <VTextField v-model="form.endDate" :rules="[ruleRequired]" type="date" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.notes') }}</label>
            <VTextarea v-model="form.notes" rows="3" />
          </div>

          <VAlert v-if="error" type="error" variant="tonal" class="mt-4">
            {{ $t('common.error') }}
          </VAlert>

          <div class="mt-6">
            <VBtn type="submit" block min-height="44" class="gradient primary" :loading="loading">
              {{ $t('request.submit') }}
            </VBtn>
          </div>
        </VForm>

        <VAlert v-else type="success" class="mt-4">
          {{ $t('request.success') }}
        </VAlert>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const { ruleRequired } = useFormRules();
const { createBooking } = useBookings();

const loading = ref(false);
const success = ref(false);
const error = ref(false);
const formRef = ref();
const currentUserId = ref<string | null>(null);

const form = reactive({
  name: "",
  contact: "",
  startDate: "",
  endDate: "",
  notes: "",
});

onMounted(async () => {
  if (import.meta.server) return;
  const user = await new Promise<any>((resolve) => {
    const unsub = onAuthStateChanged($auth, (u) => { unsub(); resolve(u); });
  });
  if (!user) return;
  currentUserId.value = user.uid;
  try {
    const snap = await getDoc(doc($db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.name) form.name = data.name;
      if (data.phone) form.contact = data.phone;
      else if (data.email) form.contact = data.email;
    }
  } catch {
    // ignore — pre-fill is best-effort
  }
});

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  error.value = false;
  try {
    await createBooking({
      guestName: form.name,
      guestContact: form.contact,
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
    error.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('settings.title') }}</h1>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{ error }}</VAlert>

    <VForm ref="formRef" @submit.prevent="save">
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.name') }}</label>
        <VTextField v-model="form.title" :rules="[ruleRequired]" />
      </div>
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.description') }}</label>
        <VTextarea v-model="form.description" rows="4" />
      </div>
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.address') }}</label>
        <VTextField v-model="form.address" prepend-inner-icon="fluent:location-24-regular" />
      </div>
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.directions') }}</label>
        <VTextarea v-model="form.directions" rows="3" />
      </div>
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.rules') }}</label>
        <VTextarea v-model="form.rules" rows="4" />
      </div>
      <div class="mt-6">
        <VBtn type="submit" class="gradient primary" :loading="loading">{{ $t('settings.save') }}</VBtn>
      </div>
    </VForm>

    <VAlert v-if="success" type="success" class="mt-6" closable @click:close="success = false">
      {{ $t('settings.saved') }}
    </VAlert>

    <VDivider class="my-8" />

    <h2 class="text-h6 font-weight-bold mb-4">{{ $t('invite.title') }}</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">{{ $t('invite.expires') }}</p>

    <!-- Admin invite -->
    <div class="d-flex align-center gap-3 mb-2">
      <VBtn
        class="gradient primary"
        :loading="adminInviteLoading"
        prepend-icon="fluent:shield-person-24-regular"
        @click="createAdminInvite"
      >
        {{ $t('invite.generateAdmin') }}
      </VBtn>
      <VBtn
        v-if="adminInviteLink"
        variant="outlined"
        prepend-icon="fluent:copy-24-regular"
        @click="copyLink(adminInviteLink, 'admin')"
      >
        {{ copiedAdmin ? $t('invite.copied') : $t('invite.copy') }}
      </VBtn>
    </div>
    <VTextField
      v-if="adminInviteLink"
      :model-value="adminInviteLink"
      readonly
      class="mt-2 mb-6"
      density="compact"
    />

    <!-- Guest invite -->
    <div class="d-flex align-center gap-3 mb-2">
      <VBtn
        variant="tonal"
        :loading="guestInviteLoading"
        prepend-icon="fluent:person-add-24-regular"
        @click="createGuestInvite"
      >
        {{ $t('invite.generateGuest') }}
      </VBtn>
      <VBtn
        v-if="guestInviteLink"
        variant="outlined"
        prepend-icon="fluent:copy-24-regular"
        @click="copyLink(guestInviteLink, 'guest')"
      >
        {{ copiedGuest ? $t('invite.copied') : $t('invite.copy') }}
      </VBtn>
    </div>
    <VTextField
      v-if="guestInviteLink"
      :model-value="guestInviteLink"
      readonly
      class="mt-2"
      density="compact"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const { ruleRequired } = useFormRules();
const { apartment, fetchApartment, saveApartment } = useApartment();

const loading = ref(false);
const success = ref(false);
const error = ref('');
const formRef = ref();

const form = reactive({
  title: "",
  description: "",
  address: "",
  directions: "",
  rules: "",
});

watch(apartment, (val) => {
  if (val) Object.assign(form, val);
}, { immediate: true });

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  try {
    await saveApartment({ ...form });
    success.value = true;
  } catch {
    error.value = 'Error';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchApartment);

const { generateInvite } = useInvite();

const adminInviteLoading = ref(false);
const adminInviteLink = ref("");
const copiedAdmin = ref(false);

const guestInviteLoading = ref(false);
const guestInviteLink = ref("");
const copiedGuest = ref(false);

const createAdminInvite = async () => {
  adminInviteLoading.value = true;
  try {
    const token = await generateInvite("admin");
    adminInviteLink.value = `${window.location.origin}/register/${token}`;
    copiedAdmin.value = false;
  } catch {
    error.value = 'Error';
  } finally {
    adminInviteLoading.value = false;
  }
};

const createGuestInvite = async () => {
  guestInviteLoading.value = true;
  try {
    const token = await generateInvite("guest");
    guestInviteLink.value = `${window.location.origin}/register/${token}`;
    copiedGuest.value = false;
  } catch {
    error.value = 'Error';
  } finally {
    guestInviteLoading.value = false;
  }
};

const copyLink = async (link: string, type: "admin" | "guest") => {
  await navigator.clipboard.writeText(link);
  if (type === "admin") {
    copiedAdmin.value = true;
    setTimeout(() => (copiedAdmin.value = false), 2000);
  } else {
    copiedGuest.value = true;
    setTimeout(() => (copiedGuest.value = false), 2000);
  }
};
</script>

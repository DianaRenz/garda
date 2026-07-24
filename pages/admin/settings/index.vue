<template>
  <div style="overflow: hidden">
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('settings.title') }}</h1>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{ error }}</VAlert>

    <!-- Apartment info -->
    <h2 class="text-h6 font-weight-bold mb-4">{{ $t('settings.title') }}</h2>
    <div class="mt-1">
      <label class="label text-grey-darken-2">{{ $t('settings.description') }}</label>
      <VTextarea v-model="apartmentForm.description" rows="3" auto-grow />
    </div>
    <div class="mt-1">
      <label class="label text-grey-darken-2">{{ $t('settings.address') }}</label>
      <VTextField v-model="apartmentForm.address" prepend-inner-icon="fluent:location-24-regular" />
    </div>
    <div class="mt-1">
      <label class="label text-grey-darken-2">{{ $t('settings.directions') }}</label>
      <VTextarea v-model="apartmentForm.directions" rows="3" auto-grow />
    </div>
    <div class="mt-1">
      <label class="label text-grey-darken-2">{{ $t('settings.rules') }}</label>
      <VTextarea v-model="apartmentForm.rules" rows="4" auto-grow />
    </div>
    <div class="mt-4 mb-8">
      <VBtn
        class="gradient primary"
        :loading="apartmentSaving"
        :disabled="!apartmentDirty"
        prepend-icon="fluent:save-24-regular"
        @click="saveApartmentInfo"
      >
        {{ apartmentSaved ? $t('settings.saved') : $t('settings.save') }}
      </VBtn>
    </div>

    <VDivider class="my-8" />

    <h2 class="text-h6 font-weight-bold mb-4">{{ $t('invite.title') }}</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">{{ $t('invite.expires') }}</p>

    <!-- Admin invite -->
    <div class="d-flex align-center ga-3 mb-2">
      <VBtn
        class="gradient primary"
        :loading="adminInviteLoading"
        prepend-icon="fluent:shield-24-regular"
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
    <div class="d-flex align-center ga-3 mb-2">
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

    <!-- Cost reimbursement (PayPal) -->
    <VDivider class="my-8" />
    <h2 class="text-h6 font-weight-bold mb-4">{{ $t('settings.contributions.title') }}</h2>
    <VTextField
      v-model="paypalLink"
      :label="$t('settings.contributions.paypalLabel')"
      :placeholder="$t('settings.contributions.paypalPlaceholder')"
      :hint="$t('settings.contributions.paypalHint')"
      persistent-hint
      density="compact"
      class="mb-3"
    />
    <VBtn
      class="gradient primary"
      :loading="paypalSaving"
      :disabled="!paypalDirty"
      prepend-icon="fluent:save-24-regular"
      @click="savePaypal"
    >
      {{ paypalSaved ? $t('settings.saved') : $t('settings.save') }}
    </VBtn>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const { t } = useI18n();
const error = ref('');

const { generateInvite } = useInvite();
const { apartment, fetchApartment, saveApartment } = useApartment();

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
    error.value = t('common.error');
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
    error.value = t('common.error');
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

// PayPal link
const paypalLink = ref<string>("");
const initialPaypalLink = ref<string>("");
const paypalSaving = ref(false);
const paypalSaved = ref(false);

const paypalDirty = computed(() => paypalLink.value !== initialPaypalLink.value);

// Apartment info (description/address/directions/rules)
const apartmentForm = reactive({ description: "", address: "", directions: "", rules: "" });
const initialApartmentForm = ref({ ...apartmentForm });
const apartmentSaving = ref(false);
const apartmentSaved = ref(false);

const apartmentDirty = computed(
  () => JSON.stringify(apartmentForm) !== JSON.stringify(initialApartmentForm.value)
);

onMounted(async () => {
  await fetchApartment().catch(() => {});
  const current = apartment.value?.paypalLink ?? "";
  paypalLink.value = current;
  initialPaypalLink.value = current;

  apartmentForm.description = apartment.value?.description ?? "";
  apartmentForm.address = apartment.value?.address ?? "";
  apartmentForm.directions = apartment.value?.directions ?? "";
  apartmentForm.rules = apartment.value?.rules ?? "";
  initialApartmentForm.value = { ...apartmentForm };
});

const savePaypal = async () => {
  paypalSaving.value = true;
  paypalSaved.value = false;
  try {
    const trimmed = paypalLink.value.trim();
    await saveApartment({ paypalLink: trimmed || null });
    initialPaypalLink.value = trimmed;
    paypalLink.value = trimmed;
    paypalSaved.value = true;
    setTimeout(() => (paypalSaved.value = false), 2000);
  } catch {
    error.value = t('common.error');
  } finally {
    paypalSaving.value = false;
  }
};

const saveApartmentInfo = async () => {
  apartmentSaving.value = true;
  apartmentSaved.value = false;
  try {
    await saveApartment({
      description: apartmentForm.description.trim(),
      address: apartmentForm.address.trim(),
      directions: apartmentForm.directions.trim(),
      rules: apartmentForm.rules.trim(),
    });
    initialApartmentForm.value = { ...apartmentForm };
    apartmentSaved.value = true;
    setTimeout(() => (apartmentSaved.value = false), 2000);
  } catch {
    error.value = t('common.error');
  } finally {
    apartmentSaving.value = false;
  }
};
</script>

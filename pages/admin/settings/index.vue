<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('settings.title') }}</h1>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{ error }}</VAlert>

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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const { t } = useI18n();
const error = ref('');

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
</script>

<template>
  <VContainer class="py-12">
    <VRow justify="center">
      <VCol cols="12" md="8" lg="7">

        <div v-if="loading" class="text-center py-16">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else>
        <div class="mb-8">
          <h1 class="text-h4 font-weight-bold mb-3">
            {{ apartment?.title || $t('apartment.title') }}
          </h1>
          <p v-if="apartment?.description" class="text-body-1 text-medium-emphasis">
            {{ apartment.description }}
          </p>
        </div>

        <VCard v-if="apartment" rounded="xl" variant="outlined" class="mb-8">
          <VCardText class="pa-6">

            <div v-if="apartment.address" class="d-flex ga-3" :class="{ 'mb-6': apartment.directions || apartment.rules }">
              <Icon icon="fluent:location-24-regular" class="text-primary mt-1" style="font-size:20px;flex-shrink:0;" />
              <div>
                <div class="font-weight-medium mb-1">{{ $t('settings.address') }}</div>
                <div class="text-body-2 text-medium-emphasis" style="white-space:pre-line;">{{ apartment.address }}</div>
              </div>
            </div>

            <VDivider v-if="apartment.address && apartment.directions" class="mb-6" />

            <div v-if="apartment.directions" class="d-flex ga-3" :class="{ 'mb-6': apartment.rules }">
              <Icon icon="fluent:vehicle-car-24-regular" class="text-primary mt-1" style="font-size:20px;flex-shrink:0;" />
              <div>
                <div class="font-weight-medium mb-1">{{ $t('settings.directions') }}</div>
                <div class="text-body-2 text-medium-emphasis" style="white-space:pre-line;">{{ apartment.directions }}</div>
              </div>
            </div>

            <VDivider v-if="apartment.rules" class="mb-6" />

            <div v-if="apartment.rules" class="d-flex ga-3">
              <Icon icon="fluent:document-24-regular" class="text-primary mt-1" style="font-size:20px;flex-shrink:0;" />
              <div>
                <div class="font-weight-medium mb-1">{{ $t('settings.rules') }}</div>
                <div class="text-body-2 text-medium-emphasis" style="white-space:pre-line;">{{ apartment.rules }}</div>
              </div>
            </div>

          </VCardText>
        </VCard>

        <div class="d-flex flex-wrap ga-3">
          <VBtn size="large" class="gradient primary" to="/request">
            {{ $t('apartment.requestBtn') }}
          </VBtn>
          <VBtn size="large" variant="outlined" to="/account">
            {{ $t('apartment.bookingsBtn') }}
          </VBtn>
        </div>

        </template>

      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onAuthStateChanged } from "firebase/auth";

definePageMeta({ layout: "default" });

const { $auth } = useNuxtApp();
const { apartment, fetchApartment } = useApartment();

const loading = ref(true);

onMounted(async () => {
  const user = await new Promise<any>((resolve) => {
    const unsub = onAuthStateChanged($auth, (u) => { unsub(); resolve(u); });
  });

  if (!user) {
    await navigateTo("/login");
    return;
  }

  await fetchApartment();
  loading.value = false;
});
</script>

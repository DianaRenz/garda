<template>
  <VContainer class="py-12">
    <VRow justify="center">
      <VCol cols="12" md="8" lg="6">

        <div class="text-center mb-10">
          <h1 class="text-h3 font-weight-bold mb-4">
            {{ apartment?.title || 'Garda' }}
          </h1>
          <p class="text-medium-emphasis text-body-1 mb-8">
            {{ apartment?.description || $t('home.subtitle') }}
          </p>
          <VBtn size="large" class="gradient primary" to="/calendar">
            {{ $t('home.cta') }}
          </VBtn>
        </div>

        <template v-if="apartment">
          <VDivider class="mb-8" />

          <VRow>
            <VCol v-if="apartment.address" cols="12" sm="6">
              <div class="d-flex ga-3">
                <Icon icon="fluent:location-24-regular" class="text-primary mt-1" style="font-size:20px;flex-shrink:0;" />
                <div>
                  <div class="font-weight-medium mb-1">{{ $t('settings.address') }}</div>
                  <div class="text-medium-emphasis text-body-2" style="white-space:pre-line;">{{ apartment.address }}</div>
                </div>
              </div>
            </VCol>
            <VCol v-if="apartment.directions" cols="12" sm="6">
              <div class="d-flex ga-3">
                <Icon icon="fluent:vehicle-car-24-regular" class="text-primary mt-1" style="font-size:20px;flex-shrink:0;" />
                <div>
                  <div class="font-weight-medium mb-1">{{ $t('settings.directions') }}</div>
                  <div class="text-medium-emphasis text-body-2" style="white-space:pre-line;">{{ apartment.directions }}</div>
                </div>
              </div>
            </VCol>
          </VRow>

          <template v-if="apartment.rules">
            <VDivider class="my-8" />
            <div class="d-flex ga-3">
              <Icon icon="fluent:document-24-regular" class="text-primary mt-1" style="font-size:20px;flex-shrink:0;" />
              <div>
                <div class="font-weight-medium mb-1">{{ $t('settings.rules') }}</div>
                <div class="text-medium-emphasis text-body-2" style="white-space:pre-line;">{{ apartment.rules }}</div>
              </div>
            </div>
          </template>
        </template>

      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

definePageMeta({ layout: "default" });

const { apartment, fetchApartment } = useApartment();

onMounted(fetchApartment);
</script>

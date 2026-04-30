<template>
  <VCard variant="outlined" rounded="lg" class="mb-8">
    <VCardText class="pa-4">
      <div class="d-flex ga-3 mb-3">
        <VIcon icon="fluent:cup-coffee-24-regular" color="primary" size="20" style="flex-shrink:0;margin-top:2px" />
        <div>
          <div class="font-weight-medium text-body-2 mb-2">{{ $t('apartment.contributions.title') }}</div>
          <p class="text-body-2 text-medium-emphasis mb-3" style="white-space:pre-line;">
            {{ $t('apartment.contributions.body') }}
          </p>
          <p class="text-caption text-medium-emphasis mb-4" style="white-space:pre-line;">
            {{ $t('apartment.contributions.hint') }}
          </p>
          <VBtn
            :href="paypalLink"
            target="_blank"
            rel="noopener noreferrer"
            variant="tonal"
            prepend-icon="fluent:open-24-regular"
          >
            {{ $t('apartment.contributions.cta') }}
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
defineProps<{
  paypalLink: string;
}>();
</script>

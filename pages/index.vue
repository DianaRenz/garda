<template>
  <VContainer class="py-12">
    <VRow justify="center">
      <VCol cols="12" md="8" lg="6" class="text-center">
        <h1 class="text-h3 font-weight-bold mb-4">Garda</h1>
        <p class="text-medium-emphasis text-body-1 mb-8">{{ $t('home.subtitle') }}</p>
        <VBtn size="large" class="gradient primary" to="/calendar">
          {{ $t('home.cta') }}
        </VBtn>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });
</script>

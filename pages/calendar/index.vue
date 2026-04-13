<template>
  <VContainer class="py-8">
    <h1 class="text-h4 font-weight-bold mb-2">{{ $t('calendar.title') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ $t('calendar.subtitle') }}</p>

    <div class="d-flex ga-4 flex-wrap mb-8">
      <div v-for="item in legend" :key="item.key" class="d-flex align-center ga-2">
        <div :style="{ background: item.color }" class="rounded" style="width:16px;height:16px;" />
        <span class="text-body-2">{{ $t(`calendar.legend.${item.key}`) }}</span>
      </div>
    </div>

    <VCard variant="outlined" class="pa-8 text-center text-medium-emphasis">
      Календарь — в разработке
    </VCard>

    <div class="mt-8 text-center">
      <VBtn class="gradient primary" to="/request">{{ $t('calendar.requestBtn') }}</VBtn>
    </div>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const legend = [
  { key: "available", color: "#e8f5e9" },
  { key: "pending",   color: "#fff9c4" },
  { key: "confirmed", color: "#e3f2fd" },
  { key: "blocked",   color: "#ffebee" },
];
</script>

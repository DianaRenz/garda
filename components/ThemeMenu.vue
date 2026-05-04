<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        icon
        variant="text"
        size="small"
        :aria-label="$t('theme.toggle')"
      >
        <VIcon :icon="activeIcon" />
      </VBtn>
    </template>
    <VList density="compact" min-width="160">
      <VListItem
        v-for="opt in options"
        :key="opt.value"
        :prepend-icon="opt.icon"
        :title="$t(opt.labelKey)"
        :active="mode === opt.value"
        active-color="primary"
        rounded="lg"
        @click="setMode(opt.value)"
      />
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import type { ThemeMode } from "~/composables/useThemeMode";

const { mode, effective, setMode } = useThemeMode();

const options: { value: ThemeMode; icon: string; labelKey: string }[] = [
  { value: "light", icon: "fluent:weather-sunny-24-regular",         labelKey: "theme.light" },
  { value: "dark",  icon: "fluent:weather-moon-24-regular",          labelKey: "theme.dark"  },
  { value: "auto",  icon: "fluent:dark-theme-24-regular",            labelKey: "theme.auto"  },
];

// Reflect the *effective* theme on the trigger button so it's clear
// what's currently active even when the user is in 'auto' mode.
const activeIcon = computed(() => {
  if (mode.value === "auto") return "fluent:dark-theme-24-regular";
  return effective.value === "dark"
    ? "fluent:weather-moon-24-regular"
    : "fluent:weather-sunny-24-regular";
});
</script>

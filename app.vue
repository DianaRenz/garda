<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CookieNotice />
</template>

<script setup lang="ts">
const { init } = useAuth();
const { init: initTheme } = useThemeMode();
onMounted(() => {
  init();
  initTheme();
});
</script>

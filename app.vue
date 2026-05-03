<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CookieNotice />
</template>

<script setup lang="ts">
const { init } = useAuth();
onMounted(init);
</script>

<template>
  <Transition name="cookie-notice">
    <div v-if="visible" class="cookie-notice">
      <VCard class="cookie-notice__card pa-4" rounded="lg" elevation="6">
        <div class="d-flex align-start ga-3 flex-wrap">
          <VIcon icon="fluent:cookies-24-regular" color="primary" size="20" class="mt-1 flex-shrink-0" />
          <div class="flex-grow-1" style="min-width: 220px">
            <p class="text-body-2 mb-0">
              {{ $t('cookies.notice') }}
              <NuxtLink to="/datenschutz" class="text-primary">
                {{ $t('cookies.learnMore') }}
              </NuxtLink>
            </p>
          </div>
          <VBtn
            variant="tonal"
            size="small"
            class="flex-shrink-0"
            @click="acknowledge"
          >
            {{ $t('cookies.ack') }}
          </VBtn>
        </div>
      </VCard>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const STORAGE_KEY = "garda.cookieNoticeAcked";

const visible = ref(false);

onMounted(() => {
  if (import.meta.server) return;
  try {
    visible.value = localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    visible.value = true;
  }
});

const acknowledge = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // localStorage unavailable (private mode etc.) — banner just won't persist
  }
  visible.value = false;
};
</script>

<style scoped>
.cookie-notice {
  position: fixed;
  /* Sit above the VFooter (~60px tall with py-3) so the OK button
     doesn't overlap the Impressum / Datenschutz footer links. */
  bottom: 76px;
  left: 16px;
  right: 16px;
  z-index: 2000;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.cookie-notice__card {
  pointer-events: auto;
  width: 100%;
  max-width: 720px;
  background: rgb(var(--v-theme-surface));
}

.cookie-notice-enter-active,
.cookie-notice-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.cookie-notice-enter-from,
.cookie-notice-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

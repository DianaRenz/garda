<template>
  <VApp>
    <VAppBar flat border="b">
      <VAppBarTitle>
        <NuxtLink to="/" class="text-decoration-none text-high-emphasis font-weight-bold">Garda</NuxtLink>
      </VAppBarTitle>
      <template #append>
        <!-- Language dropdown -->
        <VMenu>
          <template #activator="{ props }">
            <VBtn v-bind="props" variant="text" size="small" append-icon="fluent:chevron-down-20-regular">
              {{ locale.toUpperCase() }}
            </VBtn>
          </template>
          <VList density="compact" min-width="100">
            <VListItem
              v-for="loc in locales"
              :key="loc.code"
              :title="loc.name"
              :active="locale === loc.code"
              active-color="primary"
              rounded="lg"
              @click="setLocale(loc.code)"
            />
          </VList>
        </VMenu>

        <!-- Account / login icon -->
        <VBtn
          icon
          variant="text"
          size="small"
          class="mr-1"
          :to="accountLink"
        >
          <VIcon :icon="user ? 'fluent:person-circle-24-regular' : 'fluent:person-24-regular'" />
        </VBtn>
      </template>
    </VAppBar>
    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
const { user, userRole } = useAuth();

const accountLink = computed(() => {
  if (!user.value) return "/login";
  return userRole.value === "guest" ? "/account" : "/admin";
});
</script>

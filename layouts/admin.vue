<template>
  <VApp>
    <VNavigationDrawer v-model="drawer" :rail="rail" permanent>
      <VListItem title="Garda" nav class="py-4">
        <template #append>
          <VBtn
            :icon="rail ? 'fluent:panel-right-expand-24-regular' : 'fluent:panel-right-contract-24-regular'"
            variant="text"
            @click="rail = !rail"
          />
        </template>
      </VListItem>

      <VDivider />

      <VList density="compact" nav class="mt-2">
        <VListItem
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="$t(item.titleKey)"
          rounded="lg"
        />
      </VList>

      <template #append>
        <VDivider />
        <div v-if="!rail" class="d-flex justify-center ga-1 py-2">
          <VBtn
            v-for="loc in locales"
            :key="loc.code"
            variant="text"
            size="small"
            :color="locale === loc.code ? 'primary' : 'default'"
            @click="setLocale(loc.code)"
          >
            {{ loc.code.toUpperCase() }}
          </VBtn>
        </div>
        <VDivider />
        <VList density="compact" nav class="my-2">
          <VListItem
            prepend-icon="fluent:arrow-exit-20-regular"
            :title="$t('nav.logout')"
            rounded="lg"
            @click="logout"
          />
        </VList>
      </template>
    </VNavigationDrawer>

    <VMain>
      <VContainer class="py-8">
        <slot />
      </VContainer>
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const drawer = ref(true);
const rail = ref(false);

const { logout } = useAuth();
const { locale, locales, setLocale } = useI18n();

const navItems = [
  { to: "/admin",           icon: "fluent:home-24-regular",              titleKey: "nav.dashboard" },
  { to: "/admin/calendar",  icon: "fluent:calendar-24-regular",          titleKey: "nav.calendar" },
  { to: "/admin/bookings",  icon: "fluent:calendar-checkmark-24-regular", titleKey: "nav.bookings" },
  { to: "/admin/guests",    icon: "fluent:people-24-regular",            titleKey: "nav.guests" },
  { to: "/admin/settings",  icon: "fluent:settings-24-regular",          titleKey: "nav.settings" },
];
</script>

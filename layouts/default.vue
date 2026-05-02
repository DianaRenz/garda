<template>
  <VApp>
    <VAppBar flat border="b">
      <VAppBarTitle>
        <NuxtLink to="/" class="text-decoration-none text-high-emphasis font-weight-bold">Garda</NuxtLink>
      </VAppBarTitle>
      <!-- Guest nav tabs (also shown to admin so they can preview guest pages) -->
      <template v-if="user">
        <VBtn
          v-for="item in guestNav"
          :key="item.to"
          :to="item.to"
          variant="text"
          size="small"
          :active="route.path === item.to"
          :aria-label="$t(item.label)"
        >
          <VIcon :icon="item.icon" :start="!mobile" />
          <span v-if="!mobile">{{ $t(item.label) }}</span>
        </VBtn>
      </template>

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

        <!-- Logged in: account + logout dropdown -->
        <VMenu v-if="user">
          <template #activator="{ props }">
            <VBtn v-bind="props" icon variant="text" size="small" class="mr-1" :aria-label="$t('nav.profile')">
              <VIcon icon="fluent:person-circle-24-regular" />
            </VBtn>
          </template>
          <VList density="compact" min-width="160">
            <VListItem
              :to="userRole === 'admin' ? '/admin' : '/account'"
              :prepend-icon="userRole === 'admin' ? 'fluent:grid-24-regular' : 'fluent:person-24-regular'"
              :title="userRole === 'admin' ? $t('nav.dashboard') : $t('nav.profile')"
              rounded="lg"
            />
            <VDivider class="my-1" />
            <VListItem
              prepend-icon="fluent:sign-out-24-regular"
              :title="$t('nav.logout')"
              rounded="lg"
              @click="logout"
            />
          </VList>
        </VMenu>

        <!-- Not logged in: link to login -->
        <VBtn
          v-else
          icon
          variant="text"
          size="small"
          class="mr-1"
          to="/login"
          :aria-label="$t('nav.login')"
        >
          <VIcon icon="fluent:person-24-regular" />
        </VBtn>
      </template>
    </VAppBar>
    <VMain>
      <slot />
    </VMain>
    <VFooter app class="d-flex justify-center text-caption py-3" border="t">
      <NuxtLink to="/impressum" class="text-medium-emphasis text-decoration-none mx-2">
        {{ $t('footer.impressum') }}
      </NuxtLink>
      <span class="text-medium-emphasis">·</span>
      <NuxtLink to="/datenschutz" class="text-medium-emphasis text-decoration-none mx-2">
        {{ $t('footer.datenschutz') }}
      </NuxtLink>
    </VFooter>
  </VApp>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const route = useRoute();
const { locale, locales, setLocale } = useI18n();
const { user, userRole, logout } = useAuth();

const guestNav = [
  { to: "/apartment", icon: "fluent:home-24-regular", label: "apartment.title" },
  { to: "/calendar", icon: "fluent:calendar-24-regular", label: "nav.calendar" },
  { to: "/guide", icon: "fluent:book-24-regular", label: "nav.guide" },
  { to: "/photos", icon: "fluent:image-multiple-24-regular", label: "photos.title" },
];

const accountLink = computed(() => {
  if (!user.value) return "/login";
  if (userRole.value === "admin") return "/admin";
  return "/apartment";
});
</script>

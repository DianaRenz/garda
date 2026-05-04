<template>
  <VApp>
    <!-- Mobile top bar -->
    <VAppBar v-if="mobile" flat border="b">
      <template #prepend>
        <VBtn icon variant="text" :aria-label="$t('nav.menu')" @click="drawer = !drawer">
          <VIcon icon="fluent:navigation-24-regular" />
        </VBtn>
      </template>
      <VAppBarTitle class="font-weight-bold">Garda</VAppBarTitle>
    </VAppBar>

    <VNavigationDrawer
      v-model="drawer"
      :rail="!mobile && rail"
      :temporary="mobile"
    >
      <VList density="compact" nav class="mt-2">
        <VListItem
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="$t(item.titleKey)"
          rounded="lg"
          @click="mobile && (drawer = false)"
        />

        <VDivider class="my-2" />
        <VListSubheader v-if="!rail || mobile">{{ $t('nav.guestView') }}</VListSubheader>

        <VListItem
          v-for="item in guestViewItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="$t(item.titleKey)"
          rounded="lg"
          @click="mobile && (drawer = false)"
        />
      </VList>

      <template #append>
        <VDivider />
        <div v-if="!rail || mobile" class="d-flex justify-center align-center ga-1 py-2">
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
          <ThemeMenu />
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
      <VContainer class="py-6 py-md-8">
        <slot />
      </VContainer>
    </VMain>
    <VFooter app class="d-flex justify-center text-caption py-3" border="t">
      <NuxtLink to="/impressum" class="text-medium-emphasis text-decoration-none mx-2">
        {{ $t('footer.impressum') }}
      </NuxtLink>
      <span class="text-medium-emphasis" aria-hidden="true">·</span>
      <NuxtLink to="/datenschutz" class="text-medium-emphasis text-decoration-none mx-2">
        {{ $t('footer.datenschutz') }}
      </NuxtLink>
    </VFooter>
  </VApp>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const drawer = ref(true)
const rail = ref(false)

watch(mobile, (isMobile) => {
  drawer.value = !isMobile
  if (!isMobile) rail.value = false
}, { immediate: false })

const { logout } = useAuth()
const { locale, locales, setLocale } = useI18n()

const navItems = [
  { to: "/admin",           icon: "fluent:home-24-regular",               titleKey: "nav.dashboard" },
  { to: "/admin/calendar",  icon: "fluent:calendar-24-regular",           titleKey: "nav.calendar" },
  { to: "/admin/bookings",  icon: "fluent:calendar-checkmark-24-regular", titleKey: "nav.bookings" },
  { to: "/admin/guests",    icon: "fluent:people-24-regular",             titleKey: "nav.guests" },
  { to: "/admin/guide",     icon: "fluent:book-24-regular",               titleKey: "nav.guide" },
  { to: "/admin/settings",  icon: "fluent:settings-24-regular",           titleKey: "nav.settings" },
]

const guestViewItems = [
  { to: "/apartment", icon: "fluent:home-24-regular",            titleKey: "apartment.title" },
  { to: "/calendar",  icon: "fluent:calendar-24-regular",        titleKey: "nav.calendar" },
  { to: "/guide",     icon: "fluent:book-24-regular",            titleKey: "nav.guide" },
  { to: "/photos",    icon: "fluent:image-multiple-24-regular",  titleKey: "photos.title" },
]
</script>

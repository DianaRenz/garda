<template>
  <VApp>
    <VAppBar flat border="b">
      <VAppBarTitle>
        <NuxtLink to="/" class="text-decoration-none text-high-emphasis font-weight-bold">Garda</NuxtLink>
      </VAppBarTitle>
      <template #append>
        <div class="d-flex align-center ga-1 mr-2">
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
      </template>
    </VAppBar>
    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
</script>

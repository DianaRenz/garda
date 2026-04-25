<template>
  <!-- Hero -->
  <section class="landing-hero">
    <VContainer>
      <VRow>
        <VCol cols="12" md="8" lg="7">
          <p class="text-overline text-medium-emphasis mb-2">
            Prada · Monte Baldo · Lago di Garda
          </p>
          <h1 class="landing-title mb-4">{{ $t('home.hero.title') }}</h1>
          <p class="text-body-1 text-medium-emphasis mb-3" style="max-width:600px;">
            {{ $t('home.hero.subtitle') }}
          </p>
          <p class="text-body-2 text-medium-emphasis mb-8" style="max-width:600px;">
            {{ $t('home.hero.body') }}
          </p>
          <div class="d-flex flex-wrap ga-3">
            <VBtn size="large" class="gradient primary" to="/calendar">
              {{ $t('home.hero.ctaGuide') }}
            </VBtn>
            <VBtn size="large" variant="outlined" to="/request">
              {{ $t('home.hero.ctaDates') }}
            </VBtn>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </section>

  <!-- Feature cards -->
  <section class="landing-features py-16">
    <VContainer>
      <h2 class="text-h5 font-weight-bold mb-8">{{ $t('home.features.title') }}</h2>
      <VRow>
        <VCol
          v-for="f in features"
          :key="f.key"
          cols="12"
          sm="6"
          md="4"
        >
          <VCard
            class="landing-card h-100"
            rounded="xl"
            variant="outlined"
            height="100%"
          >
            <VCardText class="pa-6">
              <Icon :icon="f.icon" class="text-primary mb-3" style="font-size:28px;" />
              <div class="font-weight-semibold mb-2">{{ $t(`home.features.${f.key}.title`) }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ $t(`home.features.${f.key}.desc`) }}</div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </section>

  <!-- Honest notes -->
  <section class="landing-honest py-16">
    <VContainer>
      <VRow justify="center">
        <VCol cols="12" md="7">
          <h2 class="text-h4 font-weight-bold mb-6">{{ $t('home.honest.title') }}</h2>
          <div
            v-for="(item, i) in $tm('home.honest.items')"
            :key="i"
            class="d-flex ga-3 mb-4"
          >
            <Icon
              icon="fluent:warning-24-regular"
              class="text-warning flex-shrink-0 mt-1"
              style="font-size:20px;"
            />
            <p class="text-body-2 text-medium-emphasis ma-0">{{ $rt(item) }}</p>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </section>

  <!-- Private CTA (logged-in users only) -->
  <section v-if="user" class="py-16">
    <VContainer>
      <VRow justify="center">
        <VCol cols="12" md="7">
          <VCard rounded="xl" color="primary" variant="tonal" class="pa-8">
            <div class="d-flex ga-3 align-start">
              <Icon icon="fluent:key-24-regular" style="font-size:28px;flex-shrink:0;" class="mt-1" />
              <div>
                <div class="text-h6 font-weight-bold mb-2">{{ $t('home.private.title') }}</div>
                <p class="text-body-2 mb-4">{{ $t('home.private.desc') }}</p>
                <VBtn :to="userRole === 'admin' ? '/admin' : '/apartment'" variant="flat">
                  {{ $t('home.private.cta') }}
                </VBtn>
              </div>
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </section>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

definePageMeta({ layout: "default" });

const { user, userRole } = useAuth();

const features = [
  { key: 'hiking',      icon: 'fluent:map-24-regular' },
  { key: 'food',        icon: 'fluent:food-24-regular' },
  { key: 'experiences', icon: 'fluent:ticket-24-regular' },
  { key: 'wellness',    icon: 'fluent:heart-24-regular' },
  { key: 'practical',   icon: 'fluent:vehicle-car-24-regular' },
  { key: 'family',      icon: 'fluent:people-24-regular' },
];
</script>

<style scoped>
.landing-hero {
  padding-top: 80px;
  padding-bottom: 80px;
}

@media (min-width: 960px) {
  .landing-hero {
    padding-top: 120px;
    padding-bottom: 120px;
  }
}

.landing-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.landing-features {
  background: rgba(var(--v-theme-surface-variant), 1);
}

.landing-card {
  transition: border-color 0.2s;
}

.landing-card:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
}

.landing-honest {
  background: rgba(0, 0, 0, 0.025);
}
</style>

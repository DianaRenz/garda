<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="10" md="8">

        <div v-if="loading" class="text-center py-16">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else>

          <!-- Hero -->
          <div class="mb-8">
            <h1 class="text-h5 font-weight-bold">{{ $t('guide.title') }}</h1>
            <p v-if="apartment?.description" class="text-body-2 text-medium-emphasis mt-1">
              {{ apartment.description }}
            </p>
          </div>

          <!-- Photo gallery -->
          <template v-if="hasGallery">
            <h2 class="text-body-2 font-weight-medium text-medium-emphasis mb-3">
              {{ $t('guide.galleryTitle') }}
            </h2>
            <VCard variant="outlined" rounded="lg" class="pa-4 mb-8">
              <PhotoGallery
                :categories="guide.gallery"
                :category-labels="galleryCategoryLabels"
              />
            </VCard>
          </template>

          <!-- Guide sections -->
          <template v-for="key in GUIDE_SECTION_KEYS" :key="key">
            <template v-if="getSectionText(key, locale) || guide.sections[key]?.photos?.length">
              <VCard
                rounded="lg"
                class="mb-4"
                :variant="key === 'emergency' ? 'tonal' : 'outlined'"
                :color="key === 'emergency' ? 'error' : undefined"
              >
                <VCardText class="pa-4">
                  <div class="d-flex align-center ga-3 mb-3">
                    <VIcon
                      :icon="GUIDE_SECTION_ICONS[key]"
                      size="22"
                      :color="key === 'emergency' ? 'error' : 'primary'"
                    />
                    <span class="text-body-1 font-weight-bold">
                      {{ $t(`guide.sections.${key}`) }}
                    </span>
                  </div>
                  <div
                    v-if="getSectionText(key, locale)"
                    class="text-body-2 text-medium-emphasis"
                    style="white-space:pre-line"
                  >
                    {{ getSectionText(key, locale) }}
                  </div>
                  <VRow
                    v-if="guide.sections[key]?.photos?.length"
                    dense
                    class="mt-3"
                  >
                    <VCol
                      v-for="photo in guide.sections[key].photos"
                      :key="photo"
                      cols="6"
                      sm="4"
                    >
                      <div
                        class="rounded-lg"
                        style="aspect-ratio:4/3;overflow:hidden;cursor:pointer"
                        @click="openPhoto(photo)"
                      >
                        <img :src="photo" :alt="$t(`guide.sections.${key}`)" style="width:100%;height:100%;object-fit:cover" />
                      </div>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </template>
          </template>

          <!-- Hikes section -->
          <div class="mb-4 mt-8">
            <VCard variant="outlined" rounded="lg">
              <VCardText class="pa-4">
                <div class="d-flex align-center ga-3 mb-3">
                  <VIcon
                    icon="fluent:compass-northwest-24-regular"
                    size="22"
                    color="primary"
                  />
                  <span class="text-body-1 font-weight-bold">
                    {{ $t('guide.hikes.title') }}
                  </span>
                </div>
                <div
                  class="text-body-2 text-medium-emphasis mb-4"
                  style="white-space:pre-line"
                >
                  {{ $t('guide.hikes.text') }}
                </div>
                <div class="d-flex flex-wrap ga-2">
                  <VBtn
                    variant="tonal"
                    color="primary"
                    prepend-icon="fluent:map-24-regular"
                    href="https://www.komoot.com/de-de/discover/Ausgew%C3%A4hlter_Ort_auf_der_Karte/@45.6702538,10.7870385/tours?sport=hike&map=true&max_distance=4820&pageNumber=1"
                    target="_blank"
                    rel="noopener"
                  >
                    {{ $t('guide.hikes.komootBtn') }}
                  </VBtn>
                  <VBtn
                    variant="tonal"
                    prepend-icon="fluent:location-24-regular"
                    href="https://maps.app.goo.gl/YpRRWu4uknC9cADu9"
                    target="_blank"
                    rel="noopener"
                  >
                    {{ $t('guide.hikes.mapBtn') }}
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </div>

          <!-- Checkout checklist -->
          <template v-if="currentCheckoutItems.length">
            <h2 class="text-body-2 font-weight-medium text-medium-emphasis mb-3 mt-8">
              {{ $t('guide.checkout.title') }}
            </h2>
            <VCard variant="outlined" rounded="lg" class="mb-8">
              <VCardText class="pa-4">
                <p class="text-body-2 text-medium-emphasis mb-3">
                  {{ $t('guide.checkout.description') }}
                </p>
                <VList density="compact">
                  <VListItem
                    v-for="(item, i) in currentCheckoutItems"
                    :key="i"
                  >
                    <template #prepend>
                      <VIcon
                        :icon="checked[i] ? 'fluent:checkbox-checked-24-regular' : 'fluent:checkbox-unchecked-24-regular'"
                        size="20"
                        :color="checked[i] ? 'success' : undefined"
                        class="mr-2"
                        style="cursor:pointer"
                        @click="checked[i] = !checked[i]"
                      />
                    </template>
                    <VListItemTitle
                      class="text-body-2"
                      :style="checked[i] ? 'text-decoration:line-through;opacity:0.5' : ''"
                    >
                      {{ item }}
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </template>

          <!-- Empty state -->
          <div
            v-if="isEmpty"
            class="text-center py-16 text-medium-emphasis"
          >
            <VIcon icon="fluent:book-24-regular" size="32" class="mb-2 d-block mx-auto" style="opacity:0.4" />
            <p class="text-body-2">{{ $t('guide.empty') }}</p>
          </div>

        </template>
      </VCol>
    </VRow>

    <!-- Fullscreen photo dialog -->
    <VDialog v-model="photoDialog" max-width="900">
      <VCard rounded="lg" class="pa-0" style="background:#000">
        <VBtn
          icon
          size="small"
          variant="text"
          aria-label="Close"
          style="position:absolute;top:8px;right:8px;z-index:1;color:#fff"
          @click="photoDialog = false"
        >
          <VIcon icon="fluent:dismiss-24-regular" />
        </VBtn>
        <img
          v-if="selectedPhoto"
          :src="selectedPhoto"
          alt="Full size photo"
          style="width:100%;max-height:85vh;object-fit:contain;display:block"
        />
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup lang="ts">
import { GUIDE_SECTION_KEYS, GUIDE_SECTION_ICONS } from '~/composables/useGuide';

definePageMeta({ layout: "default" });
const { guide, fetchGuide, getSectionText, getCheckoutItems } = useGuide();
const { apartment, fetchApartment } = useApartment();
const { t, locale } = useI18n();

const loading = ref(true);
const checked = ref<boolean[]>([]);
const photoDialog = ref(false);
const selectedPhoto = ref<string | null>(null);

const currentCheckoutItems = computed(() => getCheckoutItems(locale.value));

watch(currentCheckoutItems, (items) => {
  checked.value = items.map(() => false);
});

const galleryCategoryLabels = computed(() => ({
  apartment: t('guide.gallery.apartment'),
  garden: t('guide.gallery.garden'),
  view: t('guide.gallery.view'),
}));

const hasGallery = computed(() =>
  Object.values(guide.value.gallery).some(arr => arr.length > 0)
);

const isEmpty = computed(() => {
  if (hasGallery.value) return false;
  if (currentCheckoutItems.value.length) return false;
  return GUIDE_SECTION_KEYS.every(
    k => !getSectionText(k, locale.value) && !guide.value.sections[k]?.photos?.length
  );
});

const openPhoto = (url: string) => {
  selectedPhoto.value = url;
  photoDialog.value = true;
};

onMounted(async () => {
  if (import.meta.server) return;

  const user = await useAuthGuard();
  if (!user) return;

  await Promise.all([
    fetchGuide().catch(() => {}),
    fetchApartment().catch(() => {}),
  ]);

  checked.value = currentCheckoutItems.value.map(() => false);
  loading.value = false;
});
</script>

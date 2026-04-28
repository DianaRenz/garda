<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="10" md="8">

        <div v-if="loading" class="text-center py-16">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else>
          <div class="mb-6">
            <h1 class="text-h5 font-weight-bold">{{ $t('photos.title') }}</h1>
            <p class="text-body-2 text-medium-emphasis mt-1">
              {{ $t('photos.subtitle') }}
            </p>
          </div>

          <VTabs v-model="activeTab" class="mb-4">
            <VTab value="house">{{ $t('photos.tabs.house') }}</VTab>
            <VTab value="apartment">{{ $t('photos.tabs.apartment') }}</VTab>
            <VTab value="lake">{{ $t('photos.tabs.lake') }}</VTab>
          </VTabs>

          <VWindow v-model="activeTab">
            <VWindowItem value="house">
              <VRow dense>
                <VCol
                  v-for="(photo, i) in HOUSE_PHOTOS"
                  :key="photo"
                  cols="6"
                  sm="4"
                  md="3"
                >
                  <div
                    class="rounded-lg"
                    style="aspect-ratio:4/3;overflow:hidden;cursor:pointer"
                    @click="openLightbox(HOUSE_PHOTOS, i)"
                  >
                    <img
                      :src="photo"
                      :alt="$t('photos.tabs.house')"
                      loading="lazy"
                      style="width:100%;height:100%;object-fit:cover"
                    />
                  </div>
                </VCol>
              </VRow>
            </VWindowItem>

            <VWindowItem value="apartment">
              <VRow dense>
                <VCol
                  v-for="(photo, i) in APARTMENT_PHOTOS"
                  :key="photo"
                  cols="6"
                  sm="4"
                  md="3"
                >
                  <div
                    class="rounded-lg"
                    style="aspect-ratio:4/3;overflow:hidden;cursor:pointer"
                    @click="openLightbox(APARTMENT_PHOTOS, i)"
                  >
                    <img
                      :src="photo"
                      :alt="$t('photos.tabs.apartment')"
                      loading="lazy"
                      style="width:100%;height:100%;object-fit:cover"
                    />
                  </div>
                </VCol>
              </VRow>
            </VWindowItem>

            <VWindowItem value="lake">
              <VRow dense>
                <VCol
                  v-for="(photo, i) in LAKE_PHOTOS"
                  :key="photo"
                  cols="6"
                  sm="4"
                  md="3"
                >
                  <div
                    class="rounded-lg"
                    style="aspect-ratio:4/3;overflow:hidden;cursor:pointer"
                    @click="openLightbox(LAKE_PHOTOS, i)"
                  >
                    <img
                      :src="photo"
                      :alt="$t('photos.tabs.lake')"
                      loading="lazy"
                      style="width:100%;height:100%;object-fit:cover"
                    />
                  </div>
                </VCol>
              </VRow>
            </VWindowItem>
          </VWindow>
        </template>
      </VCol>
    </VRow>

    <PhotoLightbox
      v-model="lightboxOpen"
      :photos="lightboxPhotos"
      :start-index="lightboxIndex"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { HOUSE_PHOTOS, APARTMENT_PHOTOS, LAKE_PHOTOS } from '~/utils/photos';

definePageMeta({ layout: 'default' });

const loading = ref(true);
const activeTab = ref('house');
const lightboxOpen = ref(false);
const lightboxPhotos = ref<string[]>([]);
const lightboxIndex = ref(0);

const openLightbox = (photos: string[], index: number) => {
  lightboxPhotos.value = photos;
  lightboxIndex.value = index;
  lightboxOpen.value = true;
};

onMounted(async () => {
  if (import.meta.server) return;

  const user = await useAuthGuard();
  if (!user) return;

  loading.value = false;
});
</script>

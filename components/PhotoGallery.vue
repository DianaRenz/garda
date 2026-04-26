<template>
  <div v-if="visibleCategories.length">
    <VTabs v-model="activeTab" class="mb-4">
      <VTab
        v-for="cat in visibleCategories"
        :key="cat"
        :value="cat"
      >
        {{ categoryLabels[cat] }}
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab">
      <VWindowItem
        v-for="cat in visibleCategories"
        :key="cat"
        :value="cat"
      >
        <VRow dense>
          <VCol
            v-for="(photo, i) in categories[cat]"
            :key="photo"
            cols="6"
            sm="4"
            md="3"
          >
            <div
              class="rounded-lg"
              style="aspect-ratio:1;overflow:hidden;cursor:pointer"
              @click="openPhoto(photo)"
            >
              <img
                :src="photo"
                :alt="categoryLabels[cat] || 'Photo'"
                style="width:100%;height:100%;object-fit:cover"
              />
            </div>
          </VCol>
        </VRow>
      </VWindowItem>
    </VWindow>

    <!-- Fullscreen dialog -->
    <VDialog v-model="dialog" max-width="900">
      <VCard rounded="lg" class="pa-0" style="background:#000">
        <VBtn
          icon
          size="small"
          variant="text"
          aria-label="Close"
          style="position:absolute;top:8px;right:8px;z-index:1;color:#fff"
          @click="dialog = false"
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
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categories: Record<string, string[]>;
  categoryLabels: Record<string, string>;
}>();

const visibleCategories = computed(() =>
  Object.keys(props.categories).filter(k => (props.categories[k]?.length ?? 0) > 0)
);

const activeTab = ref(visibleCategories.value[0] ?? '' as string);
const dialog = ref(false);
const selectedPhoto = ref<string | null>(null);

const openPhoto = (url: string) => {
  selectedPhoto.value = url;
  dialog.value = true;
};

watch(visibleCategories, (cats) => {
  if (cats.length && !cats.includes(activeTab.value)) {
    activeTab.value = cats[0] ?? '';
  }
});
</script>

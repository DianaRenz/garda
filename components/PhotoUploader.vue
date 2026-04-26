<template>
  <VRow dense>
    <VCol
      v-for="(photo, i) in photos"
      :key="photo"
      cols="4"
      sm="3"
      md="2"
    >
      <div class="photo-thumb rounded-lg" style="position:relative;aspect-ratio:1;overflow:hidden">
        <img :src="photo" alt="Uploaded photo" style="width:100%;height:100%;object-fit:cover" />
        <VBtn
          icon
          size="x-small"
          color="error"
          variant="flat"
          style="position:absolute;top:4px;right:4px"
          aria-label="Remove photo"
          :loading="removingIndex === i"
          @click="handleRemove(photo, i)"
        >
          <VIcon icon="fluent:dismiss-16-regular" size="14" />
        </VBtn>
      </div>
    </VCol>
    <VCol
      v-if="!maxPhotos || photos.length < maxPhotos"
      cols="4"
      sm="3"
      md="2"
    >
      <div
        class="photo-thumb rounded-lg d-flex align-center justify-center"
        style="aspect-ratio:1;border:2px dashed rgba(0,0,0,0.15);cursor:pointer"
        @click="fileInput?.click()"
      >
        <VProgressCircular v-if="uploading" indeterminate size="24" />
        <VIcon v-else icon="fluent:add-24-regular" size="28" color="medium-emphasis" />
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        hidden
        aria-label="Upload photo"
        @change="handleUpload"
      />
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
const props = defineProps<{
  photos: string[];
  maxPhotos?: number;
}>();

const emit = defineEmits<{
  upload: [file: File];
  remove: [url: string];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const removingIndex = ref<number | null>(null);

const handleUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    emit("upload", file);
  } finally {
    // Parent handles async; reset after a tick
    await nextTick();
    target.value = "";
  }
};

const handleRemove = (url: string, index: number) => {
  removingIndex.value = index;
  emit("remove", url);
};

// Reset loading states when photos change
watch(() => props.photos.length, () => {
  uploading.value = false;
  removingIndex.value = null;
});
</script>

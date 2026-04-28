<template>
  <VDialog
    :model-value="modelValue"
    fullscreen
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div
      class="lightbox"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <!-- Close -->
      <VBtn
        icon
        size="small"
        variant="text"
        aria-label="Close"
        class="lightbox-close"
        @click="$emit('update:modelValue', false)"
      >
        <VIcon icon="fluent:dismiss-24-regular" />
      </VBtn>

      <!-- Previous -->
      <VBtn
        v-if="photos.length > 1"
        icon
        variant="text"
        class="lightbox-prev"
        @click="prev"
      >
        <VIcon icon="fluent:chevron-left-24-regular" size="28" />
      </VBtn>

      <!-- Image -->
      <img
        :src="photos[currentIndex]"
        alt="Photo"
        class="lightbox-img"
      />

      <!-- Next -->
      <VBtn
        v-if="photos.length > 1"
        icon
        variant="text"
        class="lightbox-next"
        @click="next"
      >
        <VIcon icon="fluent:chevron-right-24-regular" size="28" />
      </VBtn>

      <!-- Counter -->
      <div v-if="photos.length > 1" class="lightbox-counter">
        {{ currentIndex + 1 }} / {{ photos.length }}
      </div>
    </div>
  </VDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  photos: string[];
  modelValue: boolean;
  startIndex: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const currentIndex = ref(props.startIndex);

watch(() => props.startIndex, (v) => {
  currentIndex.value = v;
});

watch(() => props.modelValue, (open) => {
  if (open) currentIndex.value = props.startIndex;
});

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length;
};

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.photos.length;
};

// Keyboard navigation
const onKeydown = (e: KeyboardEvent) => {
  if (!props.modelValue) return;
  if (e.key === 'ArrowLeft') prev();
  else if (e.key === 'ArrowRight') next();
  else if (e.key === 'Escape') emit('update:modelValue', false);
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});

// Swipe support
let touchStartX = 0;

const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].clientX;
};

const onTouchEnd = (e: TouchEvent) => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) prev();
    else next();
  }
};
</script>

<style scoped>
.lightbox {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.lightbox-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  color: #fff;
}

.lightbox-prev,
.lightbox-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  color: rgba(255, 255, 255, 0.8);
}

.lightbox-prev {
  left: 8px;
}

.lightbox-next {
  right: 8px;
}

.lightbox-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lightbox-counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}
</style>

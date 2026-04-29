<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('adminGuide.title') }}</h1>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{ error }}</VAlert>

    <div v-if="loading" class="text-center py-16">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <template v-else>

      <!-- Language tabs -->
      <label class="label text-grey-darken-2 mb-1">{{ $t('adminGuide.language') }}</label>
      <VTabs v-model="editLocale" class="mb-6">
        <VTab v-for="loc in GUIDE_LOCALES" :key="loc" :value="loc">{{ LOCALE_LABELS[loc] }}</VTab>
      </VTabs>

      <!-- Sections -->
      <h2 class="text-h6 font-weight-bold mb-4">{{ $t('adminGuide.sections') }}</h2>

      <VExpansionPanels variant="accordion">
        <VExpansionPanel
          v-for="key in GUIDE_SECTION_KEYS"
          :key="key"
        >
          <VExpansionPanelTitle>
            <div class="d-flex align-center ga-3">
              <VIcon :icon="GUIDE_SECTION_ICONS[key]" size="20" />
              <span>{{ $t(`guide.sections.${key}`) }}</span>
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <div class="mt-2">
              <label class="label text-grey-darken-2">{{ $t('adminGuide.sectionText') }}</label>
              <VTextarea
                v-model="sectionForms[key]!.text[editLocale]"
                rows="4"
                auto-grow
              />
            </div>

            <label class="label text-grey-darken-2">{{ $t('adminGuide.sectionPhotos') }}</label>
            <PhotoUploader
              :photos="guide.sections[key]?.photos ?? []"
              @upload="(file) => handleSectionUpload(key, file)"
              @remove="(url) => handleSectionRemove(key, url)"
            />

            <div class="mt-4">
              <VBtn
                class="gradient primary"
                size="small"
                :loading="savingSection === key"
                @click="handleSaveSection(key)"
              >
                {{ $t('common.save') }}
              </VBtn>
              <span
                v-if="savedSection === key"
                class="text-caption text-success ml-3"
              >
                {{ $t('settings.saved') }}
              </span>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>

      <VDivider class="my-8" />

      <!-- Checkout checklist -->
      <h2 class="text-h6 font-weight-bold mb-4">{{ $t('guide.checkout.title') }}</h2>

      <VList density="compact">
        <VListItem
          v-for="(item, i) in checkoutItems[editLocale]"
          :key="i"
        >
          <template #prepend>
            <VIcon icon="fluent:checkbox-unchecked-24-regular" size="20" class="mr-2" />
          </template>
          <VListItemTitle class="text-body-2">{{ item }}</VListItemTitle>
          <template #append>
            <VBtn
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="removeCheckoutItem(i)"
            >
              <VIcon icon="fluent:dismiss-16-regular" size="14" />
            </VBtn>
          </template>
        </VListItem>
      </VList>

      <div class="d-flex ga-2 mt-3">
        <VTextField
          v-model="newCheckoutItem"
          :placeholder="$t('adminGuide.checkoutPlaceholder')"
          density="compact"
          hide-details
          @keydown.enter="addCheckoutItem"
        />
        <VBtn
          variant="tonal"
          @click="addCheckoutItem"
        >
          {{ $t('common.add') }}
        </VBtn>
      </div>

      <div class="mt-4">
        <VBtn
          class="gradient primary"
          size="small"
          :loading="savingCheckout"
          @click="handleSaveCheckout"
        >
          {{ $t('common.save') }}
        </VBtn>
        <span
          v-if="savedCheckout"
          class="text-caption text-success ml-3"
        >
          {{ $t('settings.saved') }}
        </span>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import type { GuideSectionKey, GuideLocale } from '~/composables/useGuide';

definePageMeta({ layout: "admin", middleware: "auth" });

const {
  guide, fetchGuide,
  saveSection, saveCheckoutItems,
  addSectionPhoto, removeSectionPhoto,
} = useGuide();

const { GUIDE_SECTION_KEYS, GUIDE_SECTION_ICONS, GUIDE_LOCALES } = await import('~/composables/useGuide');
const { t } = useI18n();

const loading = ref(true);
const editLocale = ref<GuideLocale>('ru');

const LOCALE_LABELS: Record<GuideLocale, string> = { ru: 'RU', en: 'EN', de: 'DE' };

// Section forms (local copy for editing, per locale)
const sectionForms = reactive<Record<string, { text: Record<string, string> }>>(
  Object.fromEntries(GUIDE_SECTION_KEYS.map(k => [k, { text: Object.fromEntries(GUIDE_LOCALES.map(l => [l, ''])) }]))
);
const savingSection = ref<string | null>(null);
const savedSection = ref<string | null>(null);

// Checkout (per locale)
const checkoutItems = reactive<Record<string, string[]>>(
  Object.fromEntries(GUIDE_LOCALES.map(l => [l, []]))
);
const newCheckoutItem = ref('');
const savingCheckout = ref(false);
const savedCheckout = ref(false);

onMounted(async () => {
  await fetchGuide();
  // Sync local forms
  for (const key of GUIDE_SECTION_KEYS) {
    for (const loc of GUIDE_LOCALES) {
      sectionForms[key]!.text[loc] = guide.value.sections[key]?.text?.[loc] ?? '';
    }
  }
  for (const loc of GUIDE_LOCALES) {
    checkoutItems[loc] = [...(guide.value.checkoutItems[loc] ?? [])];
  }
  loading.value = false;
});

const error = ref('');

// Section handlers
const handleSaveSection = async (key: string) => {
  savingSection.value = key;
  savedSection.value = null;
  try {
    await saveSection(key, editLocale.value, sectionForms[key]?.text[editLocale.value] ?? '');
    savedSection.value = key;
    setTimeout(() => { if (savedSection.value === key) savedSection.value = null; }, 2000);
  } catch {
    error.value = t('common.error');
  } finally {
    savingSection.value = null;
  }
};

const handleSectionUpload = async (key: string, file: File) => {
  try { await addSectionPhoto(key, file); }
  catch { error.value = t('common.error'); }
};

const handleSectionRemove = async (key: string, url: string) => {
  try { await removeSectionPhoto(key, url); }
  catch { error.value = t('common.error'); }
};

// Checkout handlers
const addCheckoutItem = () => {
  const text = newCheckoutItem.value.trim();
  if (!text) return;
  (checkoutItems[editLocale.value] ??= []).push(text);
  newCheckoutItem.value = '';
};

const removeCheckoutItem = (index: number) => {
  checkoutItems[editLocale.value]?.splice(index, 1);
};

const handleSaveCheckout = async () => {
  savingCheckout.value = true;
  savedCheckout.value = false;
  try {
    await saveCheckoutItems(editLocale.value, [...(checkoutItems[editLocale.value] ?? [])]);
    savedCheckout.value = true;
    setTimeout(() => { savedCheckout.value = false; }, 2000);
  } catch {
    error.value = t('common.error');
  } finally {
    savingCheckout.value = false;
  }
};
</script>

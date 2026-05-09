<template>
  <VBottomSheet v-model="model" :max-width="540" content-class="rounded-t-xl overflow-hidden">
    <VCard rounded="t-xl">
      <VCardTitle class="pa-5 pb-3 d-flex align-center justify-space-between">
        <span>{{ existingItem ? $t('supplies.form.editTitle') : $t('supplies.form.title') }}</span>
        <VBtn icon="fluent:dismiss-24-regular" variant="text" size="small" :aria-label="$t('supplies.form.cancel')" @click="model = false" />
      </VCardTitle>

      <VCardText class="pa-5 pt-0">
        <VForm ref="formRef" @submit.prevent="submit">
          <div class="mt-1">
            <label class="label text-grey-darken-2" for="supply-name">{{ $t('supplies.form.name') }}</label>
            <VTextField
              v-model="form.name"
              :rules="[ruleRequired]"
              :placeholder="$t('supplies.form.namePlaceholder')"
              id="supply-name"
              autocomplete="off"
              autofocus
            />
          </div>

          <div class="mt-3">
            <label class="label text-grey-darken-2 d-block mb-2">{{ $t('supplies.form.category') }}</label>
            <div class="d-flex flex-wrap ga-2">
              <VChip
                v-for="cat in categories"
                :key="cat"
                :prepend-icon="categoryIcons[cat]"
                :variant="form.category === cat ? 'flat' : 'outlined'"
                :color="form.category === cat ? 'primary' : undefined"
                class="cursor-pointer"
                @click="form.category = cat"
              >
                {{ $t(`supplies.categories.${cat}`) }}
              </VChip>
            </div>
          </div>

          <div class="mt-4">
            <label class="label text-grey-darken-2 d-block mb-2">{{ $t('supplies.form.status') }}</label>
            <div class="d-flex flex-wrap ga-2">
              <VChip
                v-for="s in statuses"
                :key="s"
                :prepend-icon="statusIcons[s]"
                :variant="form.status === s ? 'flat' : 'outlined'"
                :color="form.status === s ? statusColors[s] : undefined"
                class="cursor-pointer"
                @click="form.status = s"
              >
                {{ $t(`supplies.statuses.${s}`) }}
              </VChip>
            </div>
          </div>

          <div class="mt-4">
            <label class="label text-grey-darken-2" for="supply-note">{{ $t('supplies.form.note') }}</label>
            <VTextField
              v-model="form.note"
              :placeholder="$t('supplies.form.notePlaceholder')"
              id="supply-note"
              autocomplete="off"
              counter="200"
              maxlength="200"
            />
          </div>

          <VAlert v-if="error" type="error" variant="tonal" class="mt-4">
            {{ $t('supplies.form.saveError') }}
          </VAlert>

          <div class="d-flex ga-2 mt-6 flex-wrap">
            <VBtn
              v-if="existingItem && userRole === 'admin'"
              color="error"
              variant="text"
              prepend-icon="fluent:delete-24-regular"
              :loading="deleting"
              @click="askDelete"
            >
              {{ $t('supplies.form.delete') }}
            </VBtn>
            <VSpacer />
            <VBtn variant="text" @click="model = false">{{ $t('supplies.form.cancel') }}</VBtn>
            <VBtn
              type="submit"
              class="gradient primary"
              :loading="saving"
              prepend-icon="fluent:save-24-regular"
            >
              {{ $t('supplies.form.save') }}
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <VDialog v-model="confirmDelete" max-width="360">
      <VCard rounded="lg">
        <VCardText class="pa-5">
          <p class="text-body-1">{{ $t('supplies.form.deleteConfirm') }}</p>
        </VCardText>
        <VCardActions class="px-5 pb-5 pt-0">
          <VBtn variant="text" @click="confirmDelete = false">{{ $t('supplies.form.cancel') }}</VBtn>
          <VSpacer />
          <VBtn color="error" variant="tonal" :loading="deleting" @click="doDelete">
            {{ $t('supplies.form.delete') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VBottomSheet>
</template>

<script setup lang="ts">
import {
  SUPPLY_CATEGORIES,
  SUPPLY_STATUSES,
  CATEGORY_ICONS,
  STATUS_ICONS,
  STATUS_COLORS,
  type SupplyItem,
  type SupplyCategory,
  type SupplyStatus,
} from "~/composables/useInventory";

const props = defineProps<{
  modelValue: boolean;
  existingItem: SupplyItem | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit("update:modelValue", v),
});

const { addItem, updateItem, deleteItem } = useInventory();
const { ruleRequired } = useFormRules();
const { userRole } = useAuth();

const categories = SUPPLY_CATEGORIES;
const statuses = SUPPLY_STATUSES;
const categoryIcons = CATEGORY_ICONS;
const statusIcons = STATUS_ICONS;
const statusColors = STATUS_COLORS;

const form = ref<{
  name: string;
  category: SupplyCategory;
  status: SupplyStatus;
  note: string;
}>({
  name: "",
  category: "hygiene",
  status: "stocked",
  note: "",
});

const formRef = ref();
const saving = ref(false);
const deleting = ref(false);
const error = ref(false);
const confirmDelete = ref(false);

const resetForm = () => {
  form.value = {
    name: "",
    category: "hygiene",
    status: "stocked",
    note: "",
  };
  error.value = false;
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    if (props.existingItem) {
      form.value = {
        name: props.existingItem.name,
        category: props.existingItem.category,
        status: props.existingItem.status,
        note: props.existingItem.note,
      };
      error.value = false;
    } else {
      resetForm();
    }
  }
);

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  error.value = false;
  try {
    if (props.existingItem) {
      await updateItem(props.existingItem.id, form.value);
    } else {
      await addItem(form.value);
    }
    model.value = false;
  } catch {
    error.value = true;
  } finally {
    saving.value = false;
  }
};

const askDelete = () => {
  confirmDelete.value = true;
};

const doDelete = async () => {
  if (!props.existingItem) return;
  deleting.value = true;
  try {
    await deleteItem(props.existingItem.id);
    confirmDelete.value = false;
    model.value = false;
  } catch {
    error.value = true;
    confirmDelete.value = false;
  } finally {
    deleting.value = false;
  }
};
</script>

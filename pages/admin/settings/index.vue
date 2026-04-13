<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('settings.title') }}</h1>

    <VForm ref="formRef" @submit.prevent="save">
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.name') }}</label>
        <VTextField v-model="form.title" :rules="[ruleRequired]" />
      </div>
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.description') }}</label>
        <VTextarea v-model="form.description" rows="4" />
      </div>
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.address') }}</label>
        <VTextField v-model="form.address" prepend-inner-icon="fluent:location-24-regular" />
      </div>
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.directions') }}</label>
        <VTextarea v-model="form.directions" rows="3" />
      </div>
      <div class="mt-1">
        <label class="label text-grey-darken-2">{{ $t('settings.rules') }}</label>
        <VTextarea v-model="form.rules" rows="4" />
      </div>
      <div class="mt-6">
        <VBtn type="submit" class="gradient primary" :loading="loading">{{ $t('settings.save') }}</VBtn>
      </div>
    </VForm>

    <VAlert v-if="success" type="success" class="mt-6" closable @click:close="success = false">
      {{ $t('settings.saved') }}
    </VAlert>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const { ruleRequired } = useFormRules();
const { apartment, fetchApartment, saveApartment } = useApartment();

const loading = ref(false);
const success = ref(false);
const formRef = ref();

const form = reactive({
  title: "",
  description: "",
  address: "",
  directions: "",
  rules: "",
});

watch(apartment, (val) => {
  if (val) Object.assign(form, val);
}, { immediate: true });

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  try {
    await saveApartment({ ...form });
    success.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchApartment);
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('settings.title') }}</h1>

    <VForm @submit.prevent="save">
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

    <VAlert v-if="success" type="success" class="mt-6">{{ $t('settings.saved') }}</VAlert>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const { ruleRequired } = useFormRules();

const loading = ref(false);
const success = ref(false);

const form = reactive({
  title: "",
  description: "",
  address: "",
  directions: "",
  rules: "",
});

const save = async () => {
  // TODO: save to Firestore
};
</script>

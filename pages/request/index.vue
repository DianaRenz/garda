<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="8" md="6">
        <NuxtLink to="/calendar" class="text-body-2 text-medium-emphasis d-flex align-center ga-1 mb-6">
          {{ $t('request.back') }}
        </NuxtLink>

        <h1 class="text-h4 font-weight-bold mb-2">{{ $t('request.title') }}</h1>
        <p class="text-medium-emphasis mb-8">{{ $t('request.subtitle') }}</p>

        <VForm @submit.prevent="submit">
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.name') }}</label>
            <VTextField v-model="form.name" :rules="[ruleRequired]" prepend-inner-icon="fluent:person-24-regular" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.contact') }}</label>
            <VTextField v-model="form.contact" :rules="[ruleRequired]" prepend-inner-icon="fluent:mail-24-regular" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.startDate') }}</label>
            <VTextField v-model="form.startDate" :rules="[ruleRequired]" type="date" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.endDate') }}</label>
            <VTextField v-model="form.endDate" :rules="[ruleRequired]" type="date" />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2">{{ $t('request.notes') }}</label>
            <VTextarea v-model="form.notes" rows="3" />
          </div>
          <div class="mt-6">
            <VBtn type="submit" block min-height="44" class="gradient primary" :loading="loading">
              {{ $t('request.submit') }}
            </VBtn>
          </div>
        </VForm>

        <VAlert v-if="success" type="success" class="mt-6">
          {{ $t('request.success') }}
        </VAlert>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const { ruleRequired } = useFormRules();

const loading = ref(false);
const success = ref(false);

const form = reactive({
  name: "",
  contact: "",
  startDate: "",
  endDate: "",
  notes: "",
});

const submit = async () => {
  // TODO: save to Firestore
};
</script>

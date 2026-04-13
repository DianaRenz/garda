<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">{{ $t('guests.title') }}</h1>
      <VBtn class="gradient primary" prepend-icon="fluent:add-24-regular" @click="dialog = true">
        {{ $t('guests.add') }}
      </VBtn>
    </div>

    <VCard variant="outlined" class="pa-6 text-center text-medium-emphasis">
      {{ $t('guests.empty') }}
    </VCard>

    <VDialog v-model="dialog" max-width="440">
      <VCard>
        <VCardTitle class="pa-6 pb-2">{{ $t('guests.form.title') }}</VCardTitle>
        <VCardText>
          <VForm @submit.prevent="saveGuest">
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.name') }}</label>
              <VTextField v-model="form.name" :rules="[ruleRequired]" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.phone') }}</label>
              <VTextField v-model="form.phone" prepend-inner-icon="fluent:phone-24-regular" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.email') }}</label>
              <VTextField v-model="form.email" prepend-inner-icon="fluent:mail-24-regular" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.notes') }}</label>
              <VTextarea v-model="form.notes" rows="2" />
            </div>
          </VForm>
        </VCardText>
        <VCardActions class="pa-6 pt-0 ga-2">
          <VSpacer />
          <VBtn variant="text" @click="dialog = false">{{ $t('guests.form.cancel') }}</VBtn>
          <VBtn class="gradient primary" @click="saveGuest">{{ $t('guests.form.save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const { ruleRequired } = useFormRules();

const dialog = ref(false);

const form = reactive({
  name: "",
  phone: "",
  email: "",
  notes: "",
});

const saveGuest = async () => {
  // TODO: save to Firestore
  dialog.value = false;
};
</script>

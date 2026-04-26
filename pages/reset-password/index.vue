<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center" class="fill-height">
      <VCol cols="12" sm="8" md="5" lg="4">
        <div class="text-center mb-8">
          <h1 class="text-h5 font-weight-bold">Garda</h1>
          <p class="text-medium-emphasis text-body-2 mt-1">{{ $t('resetPassword.title') }}</p>
        </div>

        <template v-if="!success">
          <p class="text-body-2 text-medium-emphasis mb-6">{{ $t('resetPassword.subtitle') }}</p>

          <VForm ref="formRef" @submit.prevent="submit">
            <div class="mt-1">
              <label class="label text-grey-darken-2" for="email">{{ $t('resetPassword.email') }}</label>
              <VTextField
                :rules="[ruleRequired, ruleEmail]"
                v-model="email"
                prepend-inner-icon="fluent:mail-24-regular"
                id="email"
                type="email"
              />
            </div>

            <VAlert v-if="error" type="error" class="mt-4" variant="tonal">
              {{ $t('resetPassword.error') }}
            </VAlert>

            <div class="mt-6">
              <VBtn type="submit" block min-height="44" class="gradient primary" :loading="loading">
                {{ $t('resetPassword.submit') }}
              </VBtn>
            </div>
          </VForm>
        </template>

        <VAlert v-else type="success" variant="tonal" class="mb-6">
          {{ $t('resetPassword.success') }}
        </VAlert>

        <p class="text-body-2 mt-6 text-center">
          <NuxtLink to="/login" class="font-weight-bold text-primary">
            {{ $t('resetPassword.backToLogin') }}
          </NuxtLink>
        </p>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { sendPasswordResetEmail } from "firebase/auth";

definePageMeta({ layout: "default" });

const { $auth } = useNuxtApp();
const { ruleRequired, ruleEmail } = useFormRules();

const email = ref("");
const loading = ref(false);
const success = ref(false);
const error = ref(false);
const formRef = ref();

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  error.value = false;
  try {
    await sendPasswordResetEmail($auth, email.value);
    success.value = true;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center" class="fill-height">
      <VCol cols="12" sm="8" md="5" lg="4">
        <div class="text-center mb-8">
          <h1 class="text-h5 font-weight-bold">Garda</h1>
          <p class="text-medium-emphasis text-body-2 mt-1">{{ $t('register.subtitle') }}</p>
        </div>

        <!-- Invalid token state -->
        <VAlert v-if="tokenError" type="error" variant="tonal">
          {{ tokenError === 'expired' ? $t('register.expiredToken') : $t('register.invalidToken') }}
        </VAlert>

        <!-- Loading state -->
        <div v-else-if="validating" class="text-center py-8">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <!-- Registration form -->
        <VForm v-else ref="formRef" @submit.prevent="submit">
          <div class="mt-1">
            <label class="label text-grey-darken-2" for="email">{{ $t('register.email') }}</label>
            <VTextField
              :rules="[ruleRequired, ruleEmail]"
              v-model="email"
              prepend-inner-icon="fluent:mail-24-regular"
              id="email"
              type="email"
            />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2" for="password">{{ $t('register.password') }}</label>
            <VTextField
              :rules="[ruleRequired, rulePassLen]"
              v-model="password"
              prepend-inner-icon="fluent:password-20-regular"
              id="password"
              type="password"
            />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2" for="confirm-password">{{ $t('register.confirmPassword') }}</label>
            <VTextField
              :rules="[ruleRequired, rulePasswordMatch]"
              v-model="confirmPassword"
              prepend-inner-icon="fluent:password-20-regular"
              id="confirm-password"
              type="password"
            />
          </div>

          <VAlert v-if="submitError" type="error" class="mt-4" variant="tonal">
            {{ $t('register.error') }}
          </VAlert>

          <div class="mt-6">
            <VBtn type="submit" block min-height="44" class="gradient primary" :loading="loading">
              {{ $t('register.submit') }}
            </VBtn>
          </div>
        </VForm>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { createUserWithEmailAndPassword } from "firebase/auth";

definePageMeta({ layout: "default" });

const { $auth } = useNuxtApp();
const route = useRoute();
const token = route.params.token as string;

const { validateToken, markTokenUsed } = useInvite();
const { ruleRequired, ruleEmail, rulePassLen } = useFormRules();

const validating = ref(true);
const tokenError = ref<string | null>(null);
const loading = ref(false);
const submitError = ref(false);
const formRef = ref();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const { t } = useI18n();

const rulePasswordMatch = (v: string) =>
  v === password.value || t('register.passwordMismatch');

onMounted(async () => {
  const result = await validateToken(token);
  if (!result.valid) {
    tokenError.value = result.error ?? "not_found";
  }
  validating.value = false;
});

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  submitError.value = false;
  try {
    await createUserWithEmailAndPassword($auth, email.value, password.value);
    await markTokenUsed(token);
    await navigateTo("/admin");
  } catch {
    submitError.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

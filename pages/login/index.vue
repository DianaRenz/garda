<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center" class="fill-height">
      <VCol cols="12" sm="8" md="5" lg="4">
        <div class="text-center mb-8">
          <h1 class="text-h5 font-weight-bold">Garda</h1>
          <p class="text-medium-emphasis text-body-2 mt-1">{{ $t('login.subtitle') }}</p>
        </div>

        <VForm ref="formRef" @submit.prevent="submit">
          <div class="mt-1">
            <label class="label text-grey-darken-2" for="email">{{ $t('login.email') }}</label>
            <VTextField
              :rules="[ruleRequired, ruleEmail]"
              v-model="email"
              prepend-inner-icon="fluent:mail-24-regular"
              id="email"
              type="email"
            />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2" for="password">{{ $t('login.password') }}</label>
            <VTextField
              :rules="[ruleRequired]"
              v-model="password"
              prepend-inner-icon="fluent:password-20-regular"
              id="password"
              type="password"
            />
          </div>

          <VAlert v-if="notVerified" type="warning" class="mt-4" variant="tonal">
            {{ $t('login.notVerified') }}
            <template #append>
              <VBtn
                v-if="!resent"
                variant="text"
                size="small"
                :loading="resending"
                @click="resendVerification"
              >
                {{ $t('login.resendVerification') }}
              </VBtn>
              <span v-else class="text-body-2 text-success">{{ $t('login.verificationResent') }}</span>
            </template>
          </VAlert>

          <VAlert v-if="error" type="error" class="mt-4" variant="tonal">
            {{ $t('login.error') }}
          </VAlert>

          <div class="mt-6">
            <VBtn type="submit" block min-height="44" class="gradient primary" :loading="loading">
              {{ $t('login.submit') }}
            </VBtn>
          </div>
        </VForm>

        <p class="text-body-2 mt-6 text-center">
          <NuxtLink to="/reset-password" class="font-weight-bold text-primary">
            {{ $t('login.forgotPassword') }}
          </NuxtLink>
        </p>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { doc, getDoc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const { user, userRole, login } = useAuth();
const { ruleRequired, ruleEmail } = useFormRules();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref(false);
const notVerified = ref(false);
const resending = ref(false);
const resent = ref(false);
const formRef = ref();

// Already logged in — redirect immediately
onMounted(() => {
  if (user.value && userRole.value) {
    navigateTo(userRole.value === "guest" ? "/account" : "/admin");
  }
});

const resendVerification = async () => {
  if (!$auth.currentUser) return;
  resending.value = true;
  try {
    await sendEmailVerification($auth.currentUser);
    resent.value = true;
  } catch {
    // silently fail
  } finally {
    resending.value = false;
  }
};

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  error.value = false;
  try {
    await login(email.value, password.value);
    const currentUser = $auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      notVerified.value = true;
      loading.value = false;
      return;
    }
    const uid = currentUser?.uid;
    if (uid) {
      const snap = await getDoc(doc($db, "users", uid));
      const role = snap.data()?.role;
      await navigateTo(role === "guest" ? "/account" : "/admin");
    } else {
      await navigateTo("/admin");
    }
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

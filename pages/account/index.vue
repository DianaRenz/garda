<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="8" md="5" lg="4">

        <div v-if="loading" class="text-center py-16">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else>
          <h1 class="text-h5 font-weight-bold mb-6">{{ $t('profile.title') }}</h1>

          <VCard variant="outlined" rounded="lg" class="pa-4">
            <VForm @submit.prevent="save">
              <label class="label">{{ $t('profile.name') }}</label>
              <VTextField
                v-model="name"
                :rules="[ruleRequired]"
                class="mb-2"
              />

              <label class="label">{{ $t('profile.phone') }}</label>
              <VTextField
                v-model="phone"
                class="mb-2"
              />

              <label class="label">{{ $t('profile.email') }}</label>
              <VTextField
                :model-value="email"
                disabled
                :hint="$t('profile.emailHint')"
                persistent-hint
                class="mb-4"
              />

              <VBtn
                type="submit"
                class="gradient primary"
                :loading="saving"
                block
              >
                {{ $t('profile.save') }}
              </VBtn>
            </VForm>

            <VAlert
              v-if="success"
              type="success"
              variant="tonal"
              class="mt-4"
            >
              {{ $t('profile.saved') }}
            </VAlert>

            <VAlert
              v-if="error"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              {{ $t('common.error') }}
            </VAlert>
          </VCard>
        </template>

      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const { ruleRequired } = useFormRules();
const { userData, fetchProfile } = useUserProfile();

const loading = ref(true);
const saving = ref(false);
const success = ref(false);
const error = ref(false);
const name = ref('');
const phone = ref('');
const email = ref('');
let uid = '';

const save = async () => {
  saving.value = true;
  success.value = false;
  error.value = false;
  try {
    await updateDoc(doc($db, 'users', uid), { name: name.value, phone: phone.value });
    // Sync to linked guest record (best-effort)
    getDocs(query(collection($db, 'guests'), where('userId', '==', uid)))
      .then(snap => {
        for (const d of snap.docs) {
          updateDoc(d.ref, { name: name.value, phone: phone.value }).catch(() => {});
        }
      })
      .catch(() => {});
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch {
    error.value = true;
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  if (import.meta.server) return;

  const user = await useAuthGuard();
  if (!user) return;

  uid = user.uid;
  await fetchProfile(uid, user.email || undefined);
  name.value = userData.value.name || '';
  phone.value = userData.value.phone || '';
  email.value = userData.value.email || user.email || '';
  loading.value = false;
});
</script>

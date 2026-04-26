<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center" class="fill-height">
      <VCol cols="12" sm="8" md="5" lg="4">
        <div class="text-center mb-8">
          <h1 class="text-h5 font-weight-bold">Garda</h1>
          <p class="text-body-2 text-medium-emphasis mt-1">Первичная настройка</p>
        </div>

        <VAlert v-if="!user" type="warning" variant="tonal" class="mb-6">
          Вы не авторизованы. <NuxtLink to="/login" class="font-weight-bold">Войдите</NuxtLink> сначала.
        </VAlert>

        <template v-else>
          <VCard variant="outlined" rounded="lg" class="pa-5 mb-4">
            <div class="text-caption text-medium-emphasis mb-1">Аккаунт</div>
            <div class="text-body-2 font-weight-medium">{{ user.email }}</div>
            <div class="text-caption text-medium-emphasis mt-3 mb-1">UID</div>
            <div class="text-caption font-weight-mono text-truncate">{{ user.uid }}</div>
          </VCard>

          <p class="text-body-2 text-medium-emphasis mb-4">
            У этого аккаунта нет прав администратора. Нажми кнопку, чтобы назначить себя администратором.
          </p>

          <VAlert v-if="error" type="error" variant="tonal" class="mb-4">
            Ошибка. Проверь Firestore Rules — нужно разрешить запись в <code>users/{uid}</code>.
          </VAlert>

          <VBtn
            block
            min-height="44"
            class="gradient primary"
            :loading="loading"
            @click="grantAdmin"
          >
            Назначить меня администратором
          </VBtn>
        </template>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();

const user = ref<User | null>(null);
const loading = ref(false);
const error = ref(false);

onMounted(() => {
  if (!import.meta.dev) {
    navigateTo("/");
    return;
  }
  onAuthStateChanged($auth, (u) => {
    user.value = u;
  });
});

const grantAdmin = async () => {
  if (!user.value) return;
  loading.value = true;
  error.value = false;
  try {
    await setDoc(doc($db, "users", user.value.uid), {
      role: "admin",
      email: user.value.email,
      createdAt: serverTimestamp(),
    });
    await navigateTo("/admin");
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

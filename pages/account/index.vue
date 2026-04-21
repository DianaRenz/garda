<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="10" md="8">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h5 font-weight-bold">{{ $t('account.title') }}</h1>
          <VBtn variant="text" prepend-icon="fluent:sign-out-24-regular" @click="logout">
            {{ $t('nav.logout') }}
          </VBtn>
        </div>

        <div v-if="loading" class="text-center py-8">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else>
          <!-- User info -->
          <VCard class="mb-6" variant="tonal">
            <VCardText>
              <div class="d-flex align-center ga-3">
                <VIcon icon="fluent:person-circle-24-regular" size="40" color="primary" />
                <div>
                  <div class="font-weight-medium">{{ userData?.name || userData?.email }}</div>
                  <div class="text-body-2 text-medium-emphasis">{{ userData?.email }}</div>
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Request button -->
          <div class="mb-6">
            <VBtn class="gradient primary" prepend-icon="fluent:calendar-add-24-regular" to="/request">
              {{ $t('account.requestDates') }}
            </VBtn>
          </div>

          <!-- Bookings -->
          <h2 class="text-h6 font-weight-bold mb-4">{{ $t('account.myBookings') }}</h2>

          <VAlert v-if="bookings.length === 0" type="info" variant="tonal">
            {{ $t('account.noBookings') }}
          </VAlert>

          <VCard v-for="b in bookings" :key="b.id" class="mb-3" variant="outlined">
            <VCardText>
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <div>
                  <div class="font-weight-medium">
                    {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
                  </div>
                  <div v-if="b.notes" class="text-body-2 text-medium-emphasis mt-1">{{ b.notes }}</div>
                </div>
                <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                  {{ $t(`bookings.statuses.${b.status}`) }}
                </VChip>
              </div>
            </VCardText>
          </VCard>
        </template>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const { bookings, subscribeByUser, formatDate, statusColor } = useBookings();

const loading = ref(true);
const userData = ref<{ name?: string; email?: string } | null>(null);

let unsubscribe: (() => void) | null = null;

onMounted(async () => {
  if (import.meta.server) return;

  const user = await new Promise<any>((resolve) => {
    const unsub = onAuthStateChanged($auth, (u) => { unsub(); resolve(u); });
  });

  if (!user) {
    await navigateTo("/login");
    return;
  }

  try {
    const snap = await getDoc(doc($db, "users", user.uid));
    if (snap.exists()) {
      userData.value = snap.data() as { name?: string; email?: string };
    }
  } catch {
    // ignore
  }

  unsubscribe = subscribeByUser(user.uid);
  loading.value = false;
});

onUnmounted(() => {
  unsubscribe?.();
});

const logout = async () => {
  await signOut($auth);
  await navigateTo("/");
};
</script>

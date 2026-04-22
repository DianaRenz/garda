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
          <div class="mb-8">
            <VBtn class="gradient primary" prepend-icon="fluent:calendar-add-24-regular" to="/request">
              {{ $t('account.requestDates') }}
            </VBtn>
          </div>

          <!-- Upcoming -->
          <h2 class="text-h6 font-weight-bold mb-3">{{ $t('account.upcoming') }}</h2>

          <VAlert v-if="upcoming.length === 0" type="info" variant="tonal" class="mb-6">
            {{ $t('account.noUpcoming') }}
          </VAlert>

          <div v-else class="d-flex flex-column ga-3 mb-8">
            <VCard v-for="b in upcoming" :key="b.id" variant="outlined" rounded="lg">
              <VCardText class="pa-4">
                <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                  <div>
                    <div class="font-weight-medium">
                      {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
                    </div>
                    <div v-if="b.notes" class="text-body-2 text-medium-emphasis mt-1">{{ b.notes }}</div>
                  </div>
                  <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                    {{ bookingStatusLabel(b) }}
                  </VChip>
                </div>
                <div
                  v-if="b.status === 'rejected' && b.rejectionNote"
                  class="text-body-2 text-medium-emphasis mt-2 pa-2 rounded"
                  style="background: rgba(0,0,0,0.04)"
                >
                  {{ $t('account.rejectedNote') }} {{ b.rejectionNote }}
                </div>
              </VCardText>
              <VCardActions v-if="b.status === 'pending'" class="px-4 pb-3 pt-0">
                <VSpacer />
                <VBtn size="small" variant="text" color="error" @click="askCancel(b.id)">
                  {{ $t('account.cancelRequest') }}
                </VBtn>
              </VCardActions>
            </VCard>
          </div>

          <!-- Past -->
          <h2 class="text-h6 font-weight-bold mb-3">{{ $t('account.past') }}</h2>

          <VAlert v-if="past.length === 0" variant="tonal" class="mb-4">
            {{ $t('account.noPast') }}
          </VAlert>

          <div v-else class="d-flex flex-column ga-3">
            <VCard v-for="b in past" :key="b.id" variant="outlined" rounded="lg" style="opacity: 0.7">
              <VCardText class="pa-4">
                <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                  <div class="font-weight-medium">
                    {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
                  </div>
                  <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                    {{ bookingStatusLabel(b) }}
                  </VChip>
                </div>
                <div v-if="b.notes" class="text-body-2 text-medium-emphasis mt-1">{{ b.notes }}</div>
              </VCardText>
            </VCard>
          </div>
        </template>
      </VCol>
    </VRow>

    <!-- Cancel confirm dialog -->
    <VDialog v-model="cancelDialog" max-width="360">
      <VCard rounded="lg">
        <VCardText class="pa-5">
          <p class="text-body-1 font-weight-medium">{{ $t('account.cancelConfirm') }}</p>
        </VCardText>
        <VCardActions class="px-5 pb-5 pt-0">
          <VBtn variant="text" @click="cancelDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VSpacer />
          <VBtn color="error" variant="tonal" :loading="cancelling" @click="doCancel">
            {{ $t('account.cancelRequest') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup lang="ts">
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import type { Booking } from '~/composables/useBookings';

definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const { deleteBooking, formatDate, statusColor } = useBookings();
const { t } = useI18n();

const loading = ref(true);
const userData = ref<{ name?: string; email?: string } | null>(null);
const myBookings = ref<Booking[]>([]);
const cancelDialog = ref(false);
const cancelling = ref(false);
const cancelId = ref<string | null>(null);

const today = new Date();
today.setHours(0, 0, 0, 0);

const upcoming = computed(() =>
  myBookings.value
    .filter(b => b.endDate && b.endDate.toDate() >= today)
    .sort((a, b) => a.startDate.seconds - b.startDate.seconds)
);

const past = computed(() =>
  myBookings.value
    .filter(b => b.endDate && b.endDate.toDate() < today)
    .sort((a, b) => b.startDate.seconds - a.startDate.seconds)
);

const bookingStatusLabel = (b: Booking): string => {
  if (b.status === 'pending') return t('account.pendingStatus');
  if (b.status === 'confirmed') return t('account.confirmedStatus');
  return t(`bookings.statuses.${b.status}`);
};

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
  } catch { /* ignore */ }

  const q = query(
    collection($db, "bookings"),
    where("userId", "==", user.uid),
    orderBy("startDate", "asc")
  );
  unsubscribe = onSnapshot(q, (snap) => {
    myBookings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
  });

  loading.value = false;
});

onUnmounted(() => {
  unsubscribe?.();
});

const askCancel = (id: string) => {
  cancelId.value = id;
  cancelDialog.value = true;
};

const doCancel = async () => {
  if (!cancelId.value) return;
  cancelling.value = true;
  try {
    await deleteBooking(cancelId.value);
    cancelDialog.value = false;
  } finally {
    cancelling.value = false;
  }
};

const logout = async () => {
  await signOut($auth);
  await navigateTo("/");
};
</script>

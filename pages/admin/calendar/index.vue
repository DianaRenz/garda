<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('calendar.title') }}</h1>

    <AppCalendar :bookings="bookings" :show-names="true" @select="selected = $event" />

    <!-- Booking detail dialog -->
    <VDialog v-model="dialog" max-width="400">
      <VCard v-if="selected" rounded="lg">
        <VCardText class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-h6 font-weight-bold">{{ selected.guestName }}</span>
            <VChip :color="statusColor[selected.status]" size="small" variant="tonal">
              {{ $t(`bookings.statuses.${selected.status}`) }}
            </VChip>
          </div>

          <div class="d-flex align-center ga-2 text-body-2 mb-2">
            <VIcon icon="fluent:calendar-24-regular" size="16" />
            {{ formatDate(selected.startDate) }} — {{ formatDate(selected.endDate) }}
          </div>

          <div v-if="selected.guestContact" class="d-flex align-center ga-2 text-body-2 mb-2">
            <VIcon icon="fluent:mail-24-regular" size="16" />
            {{ selected.guestContact }}
          </div>

          <div v-if="selected.notes" class="text-body-2 text-medium-emphasis mt-3 pa-3 rounded-lg" style="background: rgba(0,0,0,0.04)">
            {{ selected.notes }}
          </div>
        </VCardText>

        <VCardActions class="px-5 pb-5 pt-0">
          <VBtn
            v-if="selected.status === 'pending'"
            variant="tonal"
            color="primary"
            :loading="confirming"
            @click="confirm"
          >
            {{ $t('bookings.actions.confirm') }}
          </VBtn>
          <VSpacer />
          <VBtn variant="text" color="error" @click="deleteDialog = true">
            {{ $t('bookings.actions.delete') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete confirmation -->
    <VDialog v-model="deleteDialog" max-width="340">
      <VCard rounded="lg">
        <VCardText class="pa-5">
          <p class="text-body-1 font-weight-medium mb-1">{{ $t('common.deleteConfirmTitle') }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ $t('common.deleteConfirmText') }}</p>
        </VCardText>
        <VCardActions class="px-5 pb-5 pt-0">
          <VBtn variant="text" @click="deleteDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VSpacer />
          <VBtn color="error" variant="tonal" :loading="deleting" @click="remove">
            {{ $t('common.delete') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/composables/useBookings'

definePageMeta({ layout: "admin", middleware: "auth" });

const { bookings, subscribe, updateBooking, deleteBooking, formatDate, statusColor } = useBookings();

onMounted(() => {
  const unsub = subscribe();
  onUnmounted(unsub);
});

const selected = ref<Booking | null>(null);
const dialog = computed({
  get: () => !!selected.value,
  set: (v) => { if (!v) selected.value = null },
});

const deleteDialog = ref(false);
const confirming = ref(false);
const deleting = ref(false);

const confirm = async () => {
  if (!selected.value) return;
  confirming.value = true;
  try {
    await updateBooking(selected.value.id, { status: 'confirmed' });
    selected.value = null;
  } finally {
    confirming.value = false;
  }
};

const remove = async () => {
  if (!selected.value) return;
  deleting.value = true;
  try {
    await deleteBooking(selected.value.id);
    deleteDialog.value = false;
    selected.value = null;
  } finally {
    deleting.value = false;
  }
};
</script>

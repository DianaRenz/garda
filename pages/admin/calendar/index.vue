<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ $t('calendar.title') }}</h1>

    <AppCalendar :bookings="bookings" :show-names="true" @select="selected = $event" />

    <!-- Booking detail dialog -->
    <VDialog v-model="dialog" max-width="420">
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

          <div v-if="selected.rejectionNote" class="text-body-2 text-medium-emphasis mt-3 pa-3 rounded-lg" style="background: rgba(0,0,0,0.04)">
            <span class="font-weight-medium">{{ $t('account.rejectedNote') }}</span> {{ selected.rejectionNote }}
          </div>
        </VCardText>

        <VCardActions class="px-5 pb-5 pt-0 flex-wrap ga-2">
          <VBtn
            v-if="selected.status === 'pending'"
            variant="tonal"
            color="primary"
            :loading="confirming"
            @click="confirm"
          >
            {{ $t('bookings.actions.confirm') }}
          </VBtn>
          <VBtn
            v-if="selected.status === 'pending'"
            variant="tonal"
            color="error"
            @click="openReject"
          >
            {{ $t('bookings.actions.reject') }}
          </VBtn>
          <VSpacer />
          <VBtn variant="text" color="error" @click="deleteDialog = true">
            {{ $t('bookings.actions.delete') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Reject dialog -->
    <VDialog v-model="rejectDialog" max-width="480">
      <VCard rounded="lg">
        <VCardTitle class="pa-6 pb-2">{{ $t('bookings.rejectDialog.title') }}</VCardTitle>
        <VCardText>
          <VAlert v-if="rejectConflicts.length" type="info" variant="tonal" class="mb-4" density="compact">
            <div class="font-weight-medium mb-1">{{ $t('bookings.rejectDialog.conflict') }}</div>
            <div v-for="c in rejectConflicts" :key="c.id" class="text-body-2">
              {{ c.guestName }}: {{ formatDate(c.startDate) }} — {{ formatDate(c.endDate) }}
            </div>
          </VAlert>
          <div>
            <label class="label text-grey-darken-2">{{ $t('bookings.rejectDialog.note') }}</label>
            <VTextarea
              v-model="rejectNote"
              :placeholder="$t('bookings.rejectDialog.notePlaceholder')"
              rows="3"
            />
          </div>
        </VCardText>
        <VCardActions class="pa-6 pt-0 ga-2">
          <VSpacer />
          <VBtn variant="text" @click="rejectDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="error" variant="tonal" :loading="rejecting" @click="doReject">
            {{ $t('bookings.rejectDialog.confirm') }}
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

const { bookings, subscribe, updateBooking, deleteBooking, getConflicts, formatDate, statusColor } = useBookings();

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
const rejectDialog = ref(false);
const confirming = ref(false);
const deleting = ref(false);
const rejecting = ref(false);
const rejectNote = ref('');

const rejectConflicts = computed(() =>
  selected.value ? getConflicts(selected.value) : []
);

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

const openReject = () => {
  rejectNote.value = '';
  rejectDialog.value = true;
};

const doReject = async () => {
  if (!selected.value) return;
  rejecting.value = true;
  try {
    await updateBooking(selected.value.id, {
      status: 'rejected',
      rejectionNote: rejectNote.value || null,
    });
    rejectDialog.value = false;
    selected.value = null;
  } finally {
    rejecting.value = false;
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

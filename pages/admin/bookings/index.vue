<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">{{ $t('bookings.title') }}</h1>
      <VBtn class="gradient primary" prepend-icon="fluent:add-24-regular" @click="createNew">
        {{ $t('bookings.add') }}
      </VBtn>
    </div>

    <!-- Filters -->
    <div class="d-flex ga-3 mb-6 flex-wrap">
      <VChip
        v-for="s in statuses"
        :key="s.value"
        :color="s.value !== 'all' ? statusColor[s.value] : undefined"
        :variant="filterStatus === s.value ? 'flat' : 'tonal'"
        class="cursor-pointer"
        @click="filterStatus = s.value"
      >
        {{ $t(`bookings.statuses.${s.value}`) }}
      </VChip>
    </div>

    <!-- Desktop table -->
    <VCard v-if="!mobile" variant="outlined">
      <VTable v-if="filtered.length">
        <thead>
          <tr>
            <th>{{ $t('bookings.table.guest') }}</th>
            <th>{{ $t('bookings.table.dates') }}</th>
            <th>{{ $t('bookings.table.status') }}</th>
            <th>{{ $t('bookings.table.source') }}</th>
            <th>{{ $t('bookings.table.notes') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filtered" :key="b.id" class="cursor-pointer hover:bg-gray-50" @click="editBooking(b)">
            <td>
              <div class="font-weight-medium">{{ b.guestName || '(не назначен)' }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ b.guestContact || '—' }}</div>
            </td>
            <td class="text-no-wrap">
              {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
            </td>
            <td>
              <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                {{ $t(`bookings.statuses.${b.status}`) }}
              </VChip>
            </td>
            <td>
              <VChip size="small" variant="tonal">
                {{ $t(`bookings.sources.${b.source}`) }}
              </VChip>
            </td>
            <td class="text-medium-emphasis text-body-2" style="max-width:200px;">
              {{ b.notes || '—' }}
            </td>
            <td @click.stop>
              <VBtn
                size="small"
                variant="text"
                color="error"
                icon="fluent:delete-24-regular"
                @click="askDelete(b.id)"
              />
            </td>
          </tr>
        </tbody>
      </VTable>
      <div v-else class="pa-8 text-center text-medium-emphasis">
        {{ $t('bookings.empty') }}
      </div>
    </VCard>

    <!-- Mobile cards -->
    <template v-else>
      <div v-if="!filtered.length" class="pa-8 text-center text-medium-emphasis">
        {{ $t('bookings.empty') }}
      </div>
      <div class="d-flex flex-column ga-3">
        <VCard v-for="b in filtered" :key="b.id" variant="outlined" rounded="lg" class="cursor-pointer" @click="editBooking(b)">
          <VCardText class="pa-4">
            <div class="d-flex align-start justify-space-between mb-1">
              <div class="flex-grow-1">
                <div class="font-weight-medium">{{ b.guestName || '(не назначен)' }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ b.guestContact || '—' }}</div>
              </div>
              <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                {{ $t(`bookings.statuses.${b.status}`) }}
              </VChip>
            </div>
            <div class="text-body-2 mt-2">
              {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
            </div>
            <div v-if="b.notes" class="text-body-2 text-medium-emphasis mt-1">{{ b.notes }}</div>
          </VCardText>
          <VCardActions class="px-4 pb-3 pt-0" @click.stop>
            <VSpacer />
            <VBtn
              size="small"
              variant="text"
              color="error"
              icon="fluent:delete-24-regular"
              @click="askDelete(b.id)"
            />
          </VCardActions>
        </VCard>
      </div>
    </template>

    <!-- Edit/Create booking dialog -->
    <VDialog v-model="editDialog" max-width="540">
      <VCard>
        <VCardTitle class="pa-6 pb-2">
          {{ editingId ? 'Редактировать бронирование' : $t('bookings.form.title') }}
        </VCardTitle>
        <VCardText>
          <VForm ref="formRef" @submit.prevent="save">
            <!-- Guest selector -->
            <div class="mb-4 pa-4 rounded-lg" style="background: rgba(0,0,0,0.04);">
              <label class="label text-grey-darken-2 mb-3 d-block">Гость</label>
              <VSelect
                v-model="form.guestId"
                :items="guestOptions"
                item-title="name"
                item-value="id"
                label="Выберите или создайте гостя"
                clearable
              />
              <VBtn
                v-if="form.guestId && !editingId"
                size="small"
                variant="text"
                class="mt-2"
                prepend-icon="fluent:add-circle-20-regular"
                @click="createNewGuestInline = true"
              >
                Или создать нового
              </VBtn>
            </div>

            <!-- Inline guest creation -->
            <VCard v-if="createNewGuestInline" variant="outlined" class="mb-4 pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2 font-weight-medium">Новый гость</span>
                <VBtn
                  icon="fluent:dismiss-24-regular"
                  variant="text"
                  size="small"
                  @click="createNewGuestInline = false"
                />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2 text-body-2">Имя</label>
                <VTextField v-model="newGuestForm.name" density="compact" />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2 text-body-2">Телефон</label>
                <VTextField v-model="newGuestForm.phone" density="compact" />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2 text-body-2">Email</label>
                <VTextField v-model="newGuestForm.email" density="compact" />
              </div>
              <VBtn
                size="small"
                class="gradient primary mt-3"
                @click="addGuestAndAssign"
              >
                Создать и назначить
              </VBtn>
            </VCard>

            <!-- Other fields -->
            <div class="mt-4">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.contact') }}</label>
              <VTextField v-model="form.guestContact" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.startDate') }}</label>
              <VTextField v-model="form.startDate" type="date" :rules="[ruleRequired]" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.endDate') }}</label>
              <VTextField v-model="form.endDate" type="date" :rules="endDateRules" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.status') }}</label>
              <VSelect v-model="form.status" :items="statusOptions" item-title="label" item-value="value" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.notes') }}</label>
              <VTextarea v-model="form.notes" rows="2" />
            </div>
          </VForm>
        </VCardText>
        <VCardActions class="pa-6 pt-0 ga-2">
          <VSpacer />
          <VBtn variant="text" @click="editDialog = false">{{ $t('bookings.form.cancel') }}</VBtn>
          <VBtn
            class="gradient primary"
            :loading="saving"
            :disabled="!form.guestId"
            @click="save"
          >
            {{ editingId ? 'Обновить' : $t('bookings.form.save') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete confirm -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard>
        <VCardTitle class="pa-6 pb-2">{{ $t('common.deleteConfirmTitle') }}</VCardTitle>
        <VCardText>{{ $t('common.deleteConfirmText') }}</VCardText>
        <VCardActions class="pa-6 pt-0 ga-2">
          <VSpacer />
          <VBtn variant="text" @click="deleteDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="error" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { Booking } from '~/composables/useBookings'

definePageMeta({ layout: "admin", middleware: "auth" });

const { mobile } = useDisplay()
const { t } = useI18n();
const { ruleRequired } = useFormRules();
const { bookings, subscribe, createBooking, updateBooking, deleteBooking } = useBookings();
const { guests, subscribe: subscribeGuests, createGuest } = useGuests();

const { bookings: allBookings, formatDate, statusColor } = useBookings();

const editDialog = ref(false);
const deleteDialog = ref(false);
const saving = ref(false);
const deleting = ref(false);
const deleteId = ref<string | null>(null);
const filterStatus = ref("all");
const formRef = ref();
const editingId = ref<string | null>(null);
const createNewGuestInline = ref(false);

const statuses = ["all", "pending", "confirmed", "blocked", "rejected"].map((v) => ({ value: v }));

const statusOptions = computed(() =>
  ["pending", "confirmed", "blocked"].map((v) => ({
    value: v,
    label: t(`bookings.statuses.${v}`),
  }))
);

const guestOptions = computed(() => [
  ...guests.value.map(g => ({ id: g.id, name: g.name })),
]);

const endDateRules = computed(() => [
  ruleRequired,
  (v: string) => !form.startDate || !v || v >= form.startDate || t('bookings.form.endDateError'),
]);

const filtered = computed(() =>
  filterStatus.value === "all"
    ? bookings.value
    : bookings.value.filter((b) => b.status === filterStatus.value)
);

const form = reactive({
  guestId: null as string | null,
  guestName: "",
  guestContact: "",
  startDate: "",
  endDate: "",
  status: "confirmed" as "pending" | "confirmed" | "blocked" | "rejected",
  notes: "",
});

const newGuestForm = reactive({
  name: "",
  phone: "",
  email: "",
});

const createNew = () => {
  Object.assign(form, {
    guestId: null,
    guestName: "",
    guestContact: "",
    startDate: "",
    endDate: "",
    status: "confirmed",
    notes: "",
  });
  editingId.value = null;
  createNewGuestInline.value = false;
  editDialog.value = true;
};

const editBooking = (booking: Booking) => {
  editingId.value = booking.id;
  Object.assign(form, {
    guestId: booking.guestId,
    guestName: booking.guestName,
    guestContact: booking.guestContact,
    startDate: booking.startDate.toDate().toISOString().split('T')[0],
    endDate: booking.endDate.toDate().toISOString().split('T')[0],
    status: booking.status,
    notes: booking.notes,
  });
  createNewGuestInline.value = false;
  editDialog.value = true;
};

const addGuestAndAssign = async () => {
  if (!newGuestForm.name) return;
  await createGuest({ name: newGuestForm.name, phone: newGuestForm.phone, email: newGuestForm.email, notes: "" });
  const newGuest = guests.value.find(g => g.name === newGuestForm.name);
  if (newGuest) {
    form.guestId = newGuest.id;
    form.guestName = newGuest.name;
    form.guestContact = newGuestForm.phone || newGuestForm.email;
  }
  Object.assign(newGuestForm, { name: "", phone: "", email: "" });
  createNewGuestInline.value = false;
};

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (editingId.value) {
      // При редактировании конвертируем даты обратно в Timestamps
      const { Timestamp } = await import("firebase/firestore");
      await updateBooking(editingId.value, {
        guestId: form.guestId,
        guestName: form.guestName,
        guestContact: form.guestContact,
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        endDate: Timestamp.fromDate(new Date(form.endDate)),
        status: form.status,
        notes: form.notes,
      });
    } else {
      await createBooking({
        guestId: form.guestId,
        guestName: form.guestName,
        guestContact: form.guestContact,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        source: "admin",
        notes: form.notes,
      });
    }
    editDialog.value = false;
  } finally {
    saving.value = false;
  }
};

const askDelete = (id: string) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const doDelete = async () => {
  if (!deleteId.value) return;
  deleting.value = true;
  try {
    await deleteBooking(deleteId.value);
    deleteDialog.value = false;
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  const u1 = subscribe();
  const u2 = subscribeGuests();
  onUnmounted(() => { u1(); u2(); });
});
</script>

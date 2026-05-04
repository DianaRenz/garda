<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">{{ $t('bookings.title') }}</h1>
      <VBtn class="gradient primary" prepend-icon="fluent:add-24-regular" @click="createNew">
        {{ $t('bookings.add') }}
      </VBtn>
    </div>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{ error }}</VAlert>

    <div v-if="loading" class="text-center py-16">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <template v-else>
    <!-- Filters -->
    <div class="d-flex ga-3 mb-6 flex-wrap">
      <VChip
        v-for="s in statuses"
        :key="s.value"
        :color="filterStatus === s.value && s.value === 'all'
          ? 'on-surface'
          : (s.value !== 'all' ? statusColor[s.value] : undefined)"
        :variant="filterStatus === s.value ? 'flat' : (s.value === 'all' ? 'outlined' : 'tonal')"
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
          <tr v-for="b in filtered" :key="b.id" class="cursor-pointer hover:bg-gray-50" :style="{ borderLeft: `3px solid rgb(var(--v-theme-${statusColor[b.status]}))` }" @click="editBooking(b)">
            <td>
              <div class="font-weight-medium">{{ bookingGuestLabel(b) }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ b.guestPhone || b.guestContact || '—' }}</div>
              <div v-if="b.guestEmail" class="text-body-2 text-medium-emphasis">{{ b.guestEmail }}</div>
            </td>
            <td class="text-no-wrap">
              {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
              <div class="text-caption text-medium-emphasis">{{ bookingDuration(b) }}</div>
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
        <VCard v-for="b in filtered" :key="b.id" variant="outlined" rounded="lg" class="cursor-pointer" :style="{ borderLeft: `3px solid rgb(var(--v-theme-${statusColor[b.status]}))` }" @click="editBooking(b)">
          <VCardText class="pa-4">
            <div class="d-flex align-start justify-space-between mb-1">
              <div class="flex-grow-1" style="min-width: 0">
                <div class="font-weight-medium text-truncate">{{ bookingGuestLabel(b) }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ b.guestPhone || b.guestContact || '—' }}</div>
                <div v-if="b.guestEmail" class="text-body-2 text-medium-emphasis" style="overflow-wrap: anywhere">{{ b.guestEmail }}</div>
              </div>
              <VChip :color="statusColor[b.status]" size="small" variant="tonal">
                {{ $t(`bookings.statuses.${b.status}`) }}
              </VChip>
            </div>
            <div class="text-body-2 mt-2">
              {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
            </div>
            <div class="text-caption text-medium-emphasis">{{ bookingDuration(b) }}</div>
            <div v-if="b.notes" class="text-body-2 text-medium-emphasis mt-1" style="overflow-wrap: anywhere">{{ b.notes }}</div>
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
    </template>

    <!-- Edit/Create booking dialog -->
    <VDialog v-model="editDialog" max-width="440">
      <VCard>
        <VCardTitle class="pa-6 pb-2">
          {{ editingId ? $t('bookings.form.editTitle') : $t('bookings.form.title') }}
        </VCardTitle>
        <VCardText>
          <VForm ref="formRef" @submit.prevent="save">
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.status') }}</label>
              <VSelect v-model="form.status" :items="statusOptions" item-title="label" item-value="value" />
            </div>

            <!-- Registered user selector -->
            <div v-if="form.status !== 'blocked'" class="mb-4">
              <label class="label text-grey-darken-2 mb-1 d-block">
                {{ $t('bookings.form.accountGuest') }}
                <span class="text-medium-emphasis font-weight-regular">{{ $t('bookings.form.optional') }}</span>
              </label>
              <VSelect
                v-model="form.userId"
                :items="registeredUserOptions"
                item-title="label"
                item-value="uid"
                clearable
                :placeholder="$t('bookings.form.unlinked')"
                density="compact"
                @update:model-value="onUserSelect"
              />
              <p class="text-caption text-medium-emphasis mt-1">{{ $t('bookings.form.accountHint') }}</p>
            </div>

            <!-- Guest selector -->
            <div v-if="form.status !== 'blocked'" class="mb-4 pa-4 rounded-lg" style="background: rgba(var(--v-theme-on-surface), 0.04);">
              <label class="label text-grey-darken-2 mb-3 d-block">{{ $t('bookings.form.guest') }}</label>
              <VSelect
                v-model="form.guestId"
                :items="guestOptions"
                item-title="name"
                item-value="id"
                :label="$t('bookings.form.guestPlaceholder')"
                clearable
              />
              <VBtn
                v-if="!form.guestId && !editingId"
                size="small"
                variant="text"
                class="mt-2"
                prepend-icon="fluent:add-circle-20-regular"
                @click="createNewGuestInline = true"
              >
                {{ $t('bookings.form.createNewGuest') }}
              </VBtn>
            </div>

            <!-- Inline guest creation -->
            <VCard v-if="createNewGuestInline && form.status !== 'blocked'" variant="outlined" class="mb-4 pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2 font-weight-medium">{{ $t('bookings.form.newGuest') }}</span>
                <VBtn
                  icon="fluent:dismiss-24-regular"
                  variant="text"
                  size="small"
                  @click="createNewGuestInline = false"
                />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2 text-body-2">{{ $t('guests.form.name') }}</label>
                <VTextField v-model="newGuestForm.name" density="compact" />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2 text-body-2">{{ $t('guests.form.phone') }}</label>
                <VTextField v-model="newGuestForm.phone" type="tel" density="compact" />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2 text-body-2">{{ $t('guests.form.email') }}</label>
                <VTextField v-model="newGuestForm.email" type="email" density="compact" />
              </div>
              <VBtn
                size="small"
                class="gradient primary mt-3"
                @click="addGuestAndAssign"
              >
                {{ $t('bookings.form.createAndAssign') }}
              </VBtn>
            </VCard>

            <!-- Other fields -->
            <div v-if="form.status !== 'blocked'" class="mt-4">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.guestName') }}</label>
              <VTextField v-model="form.guestName" :rules="[ruleRequired]" prepend-inner-icon="fluent:person-24-regular" />
            </div>
            <div v-if="form.status !== 'blocked'" class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.phone') }}</label>
              <VTextField v-model="form.guestPhone" type="tel" prepend-inner-icon="fluent:call-24-regular" />
            </div>
            <div v-if="form.status !== 'blocked'" class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.email') }}</label>
              <VTextField v-model="form.guestEmail" type="email" prepend-inner-icon="fluent:mail-24-regular" :rules="[ruleOptionalEmail]" />
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
              <label class="label text-grey-darken-2">{{ $t('bookings.form.notes') }}</label>
              <VTextarea v-model="form.notes" rows="2" />
            </div>
            <VAlert v-if="dialogConflicts.length" type="warning" variant="tonal" density="comfortable" class="mt-4">
              {{ $t('bookings.form.conflicts') }}
              <div v-for="b in dialogConflicts" :key="b.id" class="text-body-2 mt-1">
                {{ bookingGuestLabel(b) }} · {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
              </div>
            </VAlert>
          </VForm>
        </VCardText>
        <VCardActions class="pa-6 pt-0 ga-2">
          <VSpacer />
          <VBtn variant="text" @click="editDialog = false">{{ $t('bookings.form.cancel') }}</VBtn>
          <VBtn
            class="gradient primary"
            :loading="saving"
            :disabled="!canSave"
            @click="save"
          >
            {{ editingId ? $t('bookings.form.update') : $t('bookings.form.save') }}
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
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useDisplay } from 'vuetify'
import type { Booking } from '~/composables/useBookings'

definePageMeta({ layout: "admin", middleware: "auth" });

const { $db } = useNuxtApp();
const { mobile } = useDisplay()
const { t } = useI18n();
const { ruleRequired, ruleEmail } = useFormRules();
const { bookings, subscribe, createBooking, updateBooking, deleteBooking, formatDate, statusColor } = useBookings();
const { guests, subscribe: subscribeGuests, createGuest } = useGuests();
const { notifyGuestStatusUpdate } = useNotifications();

interface RegisteredUser {
  uid: string;
  name?: string;
  email: string;
  phone?: string;
}

const registeredUsers = ref<RegisteredUser[]>([]);

const registeredUserOptions = computed(() =>
  registeredUsers.value.map(u => ({
    uid: u.uid,
    label: [u.name || u.email, u.phone].filter(Boolean).join(' · '),
  }))
);

const editDialog = ref(false);
const deleteDialog = ref(false);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const error = ref('');
const deleteId = ref<string | null>(null);
const filterStatus = ref("all");
const formRef = ref();
const editingId = ref<string | null>(null);
const createNewGuestInline = ref(false);

const statuses = ["all", "pending", "confirmed", "blocked", "rejected", "cancelled"].map((v) => ({ value: v }));

const statusOptions = computed(() =>
  ["pending", "confirmed", "blocked", "rejected", "cancelled"].map((v) => ({
    value: v,
    label: t(`bookings.statuses.${v}`),
  }))
);

const guestOptions = computed(() => [
  ...guests.value.map(g => ({ id: g.id, name: g.name })),
]);

const endDateRules = computed(() => [
  ruleRequired,
  (v: string) => !form.startDate || !v || v > form.startDate || t('bookings.form.endDateError'),
]);

const canSave = computed(() =>
  !!form.startDate
  && !!form.endDate
  && form.endDate > form.startDate
  && (form.status === "blocked" || !!form.guestName.trim())
);

const filtered = computed(() =>
  filterStatus.value === "all"
    ? bookings.value
    : bookings.value.filter((b) => b.status === filterStatus.value)
);

const form = reactive({
  guestId: null as string | null,
  userId: null as string | null,
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  startDate: "",
  endDate: "",
  status: "confirmed" as "pending" | "confirmed" | "blocked" | "rejected" | "cancelled",
  notes: "",
});

const onUserSelect = (uid: string | null) => {
  if (!uid) { form.userId = null; return; }
  const u = registeredUsers.value.find(x => x.uid === uid);
  if (!u) return;
  form.userId = uid;
  form.guestName = u.name || form.guestName;
  form.guestPhone = u.phone || form.guestPhone;
  form.guestEmail = u.email || form.guestEmail;
};

watch(() => form.status, (status) => {
  if (status === "blocked") {
    form.guestId = null;
    form.userId = null;
    form.guestName = "";
    form.guestPhone = "";
    form.guestEmail = "";
    createNewGuestInline.value = false;
  }
});

watch(() => form.guestId, (id) => {
  if (!id) return;
  const g = guests.value.find(x => x.id === id);
  if (!g) return;
  form.guestName = g.name || form.guestName;
  form.guestPhone = g.phone || form.guestPhone;
  form.guestEmail = g.email || form.guestEmail;
});

const newGuestForm = reactive({
  name: "",
  phone: "",
  email: "",
});

const ruleOptionalEmail = (value: string) => !value || ruleEmail(value);

const createNew = () => {
  Object.assign(form, {
    guestId: null,
    userId: null,
    guestName: "",
    guestPhone: "",
    guestEmail: "",
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
    userId: booking.userId,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone || booking.guestContact || '',
    guestEmail: booking.guestEmail || '',
    startDate: booking.startDate.toDate().toISOString().split('T')[0],
    endDate: booking.endDate.toDate().toISOString().split('T')[0],
    status: booking.status,
    notes: booking.notes,
  });
  createNewGuestInline.value = false;
  editDialog.value = true;
};

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const overlapsFormRange = (booking: Booking) => {
  if (!form.startDate || !form.endDate || form.endDate <= form.startDate) return false;
  if (booking.id === editingId.value || booking.status === "rejected" || booking.status === "cancelled") return false;
  const start = toIso(booking.startDate.toDate());
  const end = toIso(booking.endDate.toDate());
  return form.startDate < end && form.endDate > start;
};

const dialogConflicts = computed(() => bookings.value.filter(overlapsFormRange));

const bookingGuestLabel = (booking: Booking) => {
  if (booking.status === "blocked") return t('bookings.blockedGuest');
  return booking.guestName || t('bookings.unassigned');
};

const bookingDuration = (booking: Booking) => {
  if (!booking.startDate || !booking.endDate) return "";
  const nights = Math.max(
    1,
    Math.round((booking.endDate.toDate().getTime() - booking.startDate.toDate().getTime()) / 86400000)
  );
  return t('bookings.nights', { count: nights });
};

const addGuestAndAssign = async () => {
  if (!newGuestForm.name) return;
  try {
  const newId = await createGuest({ name: newGuestForm.name, phone: newGuestForm.phone, email: newGuestForm.email, notes: "" });
  form.guestId = newId;
  form.guestName = newGuestForm.name;
  form.guestPhone = newGuestForm.phone;
  form.guestEmail = newGuestForm.email;
  Object.assign(newGuestForm, { name: "", phone: "", email: "" });
  createNewGuestInline.value = false;
  } catch { error.value = t('common.error'); }
};

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (editingId.value) {
      const prevStatus = bookings.value.find(b => b.id === editingId.value)?.status;
      const { Timestamp } = await import("firebase/firestore");
      await updateBooking(editingId.value, {
        guestId: form.status === "blocked" ? null : form.guestId,
        userId: form.status === "blocked" ? null : form.userId,
        guestName: form.status === "blocked" ? "" : form.guestName,
        guestPhone: form.status === "blocked" ? "" : form.guestPhone,
        guestEmail: form.status === "blocked" ? "" : form.guestEmail,
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        endDate: Timestamp.fromDate(new Date(form.endDate)),
        status: form.status,
        notes: form.notes,
      });
      if (form.guestEmail && prevStatus !== form.status &&
          (form.status === "confirmed" || form.status === "rejected")) {
        notifyGuestStatusUpdate({ guestName: form.guestName, guestEmail: form.guestEmail,
          status: form.status, startDate: form.startDate, endDate: form.endDate }).catch(() => {});
      }
    } else {
      await createBooking({
        guestId: form.status === "blocked" ? null : form.guestId,
        userId: form.status === "blocked" ? null : form.userId,
        guestName: form.status === "blocked" ? "" : form.guestName,
        guestPhone: form.status === "blocked" ? "" : form.guestPhone,
        guestEmail: form.status === "blocked" ? "" : form.guestEmail,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        source: "admin",
        notes: form.notes,
      });
    }
    editDialog.value = false;
  } catch {
    error.value = t('common.error');
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
  } catch {
    error.value = t('common.error');
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  const u1 = subscribe();
  const u2 = subscribeGuests();
  onUnmounted(() => { u1(); u2(); });
  watch(bookings, () => { loading.value = false; }, { once: true });

  try {
    const snap = await getDocs(query(collection($db, 'users'), where('role', '==', 'guest')));
    registeredUsers.value = snap.docs.map((d) => {
      const data = d.data() as Omit<RegisteredUser, "uid">;
      return { uid: d.id, ...data };
    });
  } catch { /* registered users list is optional — don't block page */ }
});

</script>

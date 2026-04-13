<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">{{ $t('bookings.title') }}</h1>
      <VBtn class="gradient primary" prepend-icon="fluent:add-24-regular" @click="openCreate">
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

    <!-- Table -->
    <VCard variant="outlined">
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
          <tr v-for="b in filtered" :key="b.id">
            <td>
              <div class="font-weight-medium">{{ b.guestName }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ b.guestContact }}</div>
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
            <td>
              <div class="d-flex ga-1 justify-end">
                <VBtn
                  v-if="b.status === 'pending'"
                  size="small"
                  variant="tonal"
                  color="primary"
                  :loading="confirming === b.id"
                  @click="confirm(b.id)"
                >
                  {{ $t('bookings.actions.confirm') }}
                </VBtn>
                <VBtn
                  size="small"
                  variant="text"
                  color="error"
                  icon="fluent:delete-24-regular"
                  @click="askDelete(b.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>
      <div v-else class="pa-8 text-center text-medium-emphasis">
        {{ $t('bookings.empty') }}
      </div>
    </VCard>

    <!-- Create dialog -->
    <VDialog v-model="dialog" max-width="500">
      <VCard>
        <VCardTitle class="pa-6 pb-2">{{ $t('bookings.form.title') }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" @submit.prevent="save">
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.guest') }}</label>
              <VTextField v-model="form.guestName" :rules="[ruleRequired]" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.contact') }}</label>
              <VTextField v-model="form.guestContact" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.startDate') }}</label>
              <VTextField v-model="form.startDate" type="date" :rules="[ruleRequired]" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('bookings.form.endDate') }}</label>
              <VTextField v-model="form.endDate" type="date" :rules="[ruleRequired]" />
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
          <VBtn variant="text" @click="dialog = false">{{ $t('bookings.form.cancel') }}</VBtn>
          <VBtn class="gradient primary" :loading="saving" @click="save">{{ $t('bookings.form.save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete confirm dialog -->
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
definePageMeta({ layout: "admin", middleware: "auth" });

const { t } = useI18n();
const { ruleRequired } = useFormRules();
const { bookings, subscribe, createBooking, updateBooking, deleteBooking, formatDate, statusColor } = useBookings();

const dialog = ref(false);
const deleteDialog = ref(false);
const saving = ref(false);
const deleting = ref(false);
const confirming = ref<string | null>(null);
const deleteId = ref<string | null>(null);
const filterStatus = ref("all");
const formRef = ref();

const statuses = ["all", "pending", "confirmed", "blocked"].map((v) => ({ value: v }));

const statusOptions = computed(() =>
  ["pending", "confirmed", "blocked"].map((v) => ({
    value: v,
    label: t(`bookings.statuses.${v}`),
  }))
);

const filtered = computed(() =>
  filterStatus.value === "all"
    ? bookings.value
    : bookings.value.filter((b) => b.status === filterStatus.value)
);

const form = reactive({
  guestName: "",
  guestContact: "",
  startDate: "",
  endDate: "",
  status: "confirmed" as "pending" | "confirmed" | "blocked",
  notes: "",
});

const openCreate = () => {
  Object.assign(form, { guestName: "", guestContact: "", startDate: "", endDate: "", status: "confirmed", notes: "" });
  dialog.value = true;
};

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    await createBooking({ ...form, source: "admin", guestId: null });
    dialog.value = false;
  } finally {
    saving.value = false;
  }
};

const confirm = async (id: string) => {
  confirming.value = id;
  try {
    await updateBooking(id, { status: "confirmed" });
  } finally {
    confirming.value = null;
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
  const unsub = subscribe();
  onUnmounted(unsub);
});
</script>

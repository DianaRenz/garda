<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">{{ $t('guests.title') }}</h1>
      <VBtn class="gradient primary" prepend-icon="fluent:add-24-regular" @click="openCreate">
        {{ $t('guests.add') }}
      </VBtn>
    </div>

    <VCard variant="outlined">
      <VTable v-if="guests.length">
        <thead>
          <tr>
            <th>{{ $t('guests.table.name') }}</th>
            <th>{{ $t('guests.table.phone') }}</th>
            <th>{{ $t('guests.table.email') }}</th>
            <th>{{ $t('guests.table.notes') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in guests" :key="g.id">
            <td class="font-weight-medium">{{ g.name }}</td>
            <td class="text-medium-emphasis">{{ g.phone || '—' }}</td>
            <td class="text-medium-emphasis">{{ g.email || '—' }}</td>
            <td class="text-body-2 text-medium-emphasis" style="max-width:200px;">{{ g.notes || '—' }}</td>
            <td>
              <VBtn
                size="small"
                variant="text"
                color="error"
                icon="fluent:delete-24-regular"
                @click="askDelete(g.id)"
              />
            </td>
          </tr>
        </tbody>
      </VTable>
      <div v-else class="pa-8 text-center text-medium-emphasis">
        {{ $t('guests.empty') }}
      </div>
    </VCard>

    <!-- Create dialog -->
    <VDialog v-model="dialog" max-width="440">
      <VCard>
        <VCardTitle class="pa-6 pb-2">{{ $t('guests.form.title') }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" @submit.prevent="save">
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.name') }}</label>
              <VTextField v-model="form.name" :rules="[ruleRequired]" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.phone') }}</label>
              <VTextField v-model="form.phone" prepend-inner-icon="fluent:phone-24-regular" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.email') }}</label>
              <VTextField v-model="form.email" prepend-inner-icon="fluent:mail-24-regular" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.notes') }}</label>
              <VTextarea v-model="form.notes" rows="2" />
            </div>
          </VForm>
        </VCardText>
        <VCardActions class="pa-6 pt-0 ga-2">
          <VSpacer />
          <VBtn variant="text" @click="dialog = false">{{ $t('guests.form.cancel') }}</VBtn>
          <VBtn class="gradient primary" :loading="saving" @click="save">{{ $t('guests.form.save') }}</VBtn>
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
definePageMeta({ layout: "admin", middleware: "auth" });

const { ruleRequired } = useFormRules();
const { guests, subscribe, createGuest, deleteGuest } = useGuests();

const dialog = ref(false);
const deleteDialog = ref(false);
const saving = ref(false);
const deleting = ref(false);
const deleteId = ref<string | null>(null);
const formRef = ref();

const form = reactive({ name: "", phone: "", email: "", notes: "" });

const openCreate = () => {
  Object.assign(form, { name: "", phone: "", email: "", notes: "" });
  dialog.value = true;
};

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    await createGuest({ ...form });
    dialog.value = false;
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
    await deleteGuest(deleteId.value);
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

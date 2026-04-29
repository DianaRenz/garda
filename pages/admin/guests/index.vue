<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">{{ $t('guests.title') }}</h1>
      <VBtn class="gradient primary" prepend-icon="fluent:add-24-regular" @click="openCreate">
        {{ $t('guests.add') }}
      </VBtn>
    </div>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{ error }}</VAlert>

    <div v-if="loading" class="text-center py-16">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <template v-else>
    <!-- Desktop table -->
    <VCard v-if="!mobile" variant="outlined">
      <VTable v-if="guests.length">
        <thead>
          <tr>
            <th>{{ $t('guests.table.name') }}</th>
            <th>{{ $t('guests.table.phone') }}</th>
            <th>{{ $t('guests.table.email') }}</th>
            <th>{{ $t('guests.table.status') }}</th>
            <th>{{ $t('guests.table.notes') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in guests" :key="g.id">
            <td class="font-weight-medium">{{ g.name }}</td>
            <td class="text-medium-emphasis">{{ g.phone || '—' }}</td>
            <td class="text-medium-emphasis">{{ g.email || '—' }}</td>
            <td>
              <VChip
                size="small"
                :color="g.userId ? 'success' : undefined"
                variant="tonal"
              >
                {{ g.userId ? $t('guests.registered') : $t('guests.notRegistered') }}
              </VChip>
            </td>
            <td class="text-body-2 text-medium-emphasis" style="max-width:200px;">{{ g.notes || '—' }}</td>
            <td>
              <VBtn
                size="small"
                variant="text"
                icon="fluent:edit-24-regular"
                @click="openEdit(g)"
              />
              <VBtn
                v-if="!g.userId"
                size="small"
                variant="text"
                color="primary"
                icon="fluent:send-24-regular"
                @click="openInvite(g)"
              />
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

    <!-- Mobile cards -->
    <template v-else>
      <div v-if="!guests.length" class="pa-8 text-center text-medium-emphasis">
        {{ $t('guests.empty') }}
      </div>
      <div class="d-flex flex-column ga-3">
        <VCard v-for="g in guests" :key="g.id" variant="outlined" rounded="lg">
          <VCardText class="pa-4">
            <div class="d-flex align-start justify-space-between">
              <div>
                <div class="d-flex align-center ga-2">
                  <span class="font-weight-medium">{{ g.name }}</span>
                  <VChip
                    size="x-small"
                    :color="g.userId ? 'success' : undefined"
                    variant="tonal"
                  >
                    {{ g.userId ? $t('guests.registered') : $t('guests.notRegistered') }}
                  </VChip>
                </div>
                <div v-if="g.phone" class="text-body-2 text-medium-emphasis mt-1">
                  <VIcon icon="fluent:phone-24-regular" size="14" class="mr-1" />{{ g.phone }}
                </div>
                <div v-if="g.email" class="text-body-2 text-medium-emphasis mt-1">
                  <VIcon icon="fluent:mail-24-regular" size="14" class="mr-1" />{{ g.email }}
                </div>
                <div v-if="g.notes" class="text-body-2 text-medium-emphasis mt-1">{{ g.notes }}</div>
              </div>
              <div class="d-flex flex-column">
                <VBtn
                  size="small"
                  variant="text"
                  icon="fluent:edit-24-regular"
                  @click="openEdit(g)"
                />
                <VBtn
                  v-if="!g.userId"
                  size="small"
                  variant="text"
                  color="primary"
                  icon="fluent:send-24-regular"
                  @click="openInvite(g)"
                />
                <VBtn
                  size="small"
                  variant="text"
                  color="error"
                  icon="fluent:delete-24-regular"
                  @click="askDelete(g.id)"
                />
              </div>
            </div>
          </VCardText>
        </VCard>
      </div>
    </template>
    </template>

    <!-- Create dialog -->
    <VDialog v-model="dialog" max-width="440">
      <VCard>
        <VCardTitle class="pa-6 pb-2">{{ editId ? $t('guests.form.editTitle') : $t('guests.form.title') }}</VCardTitle>
        <VCardText>
          <VForm ref="formRef" @submit.prevent="save">
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.name') }}</label>
              <VTextField v-model="form.name" :rules="[ruleRequired]" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.phone') }}</label>
              <VTextField v-model="form.phone" type="tel" prepend-inner-icon="fluent:phone-24-regular" />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2">{{ $t('guests.form.email') }}</label>
              <VTextField v-model="form.email" type="email" prepend-inner-icon="fluent:mail-24-regular" />
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

    <!-- Invite dialog -->
    <VDialog v-model="inviteDialog" max-width="480">
      <VCard>
        <VCardTitle class="pa-6 pb-2">{{ $t('guests.invite.title', { name: inviteGuestName }) }}</VCardTitle>
        <VCardText>
          <p class="text-body-2 text-medium-emphasis mb-4">{{ $t('guests.invite.description') }}</p>
          <template v-if="inviteLink">
            <VTextField
              :model-value="inviteLink"
              readonly
              variant="outlined"
              hide-details
              @click="copyInviteLink"
            />
            <div class="d-flex align-center ga-2 mt-3">
              <VBtn variant="tonal" color="primary" @click="copyInviteLink" prepend-icon="fluent:copy-24-regular">
                {{ inviteCopied ? $t('invite.copied') : $t('invite.copy') }}
              </VBtn>
              <span class="text-caption text-medium-emphasis">{{ $t('invite.expires') }}</span>
            </div>
          </template>
          <div v-else class="text-center py-4">
            <VProgressCircular indeterminate color="primary" />
          </div>
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn variant="text" @click="inviteDialog = false">{{ $t('common.close') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { Guest } from '~/composables/useGuests'

definePageMeta({ layout: "admin", middleware: "auth" })

const { mobile } = useDisplay()

const { t } = useI18n();
const { ruleRequired } = useFormRules();
const { guests, subscribe, createGuest, updateGuest, deleteGuest } = useGuests();
const { generateGuestInvite } = useInvite();

const dialog = ref(false);
const deleteDialog = ref(false);
const inviteDialog = ref(false);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const error = ref('');
const deleteId = ref<string | null>(null);
const formRef = ref();
const inviteLink = ref('');
const inviteCopied = ref(false);
const inviteGuestName = ref('');

const form = reactive({ name: "", phone: "", email: "", notes: "" });
const editId = ref<string | null>(null);

const openCreate = () => {
  editId.value = null;
  Object.assign(form, { name: "", phone: "", email: "", notes: "" });
  dialog.value = true;
};

const openEdit = (g: Guest) => {
  editId.value = g.id;
  Object.assign(form, { name: g.name, phone: g.phone || "", email: g.email || "", notes: g.notes || "" });
  dialog.value = true;
};

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (editId.value) {
      await updateGuest(editId.value, { ...form });
    } else {
      await createGuest({ ...form });
    }
    dialog.value = false;
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
    await deleteGuest(deleteId.value);
    deleteDialog.value = false;
  } catch {
    error.value = t('common.error');
  } finally {
    deleting.value = false;
  }
};

const openInvite = async (g: Guest) => {
  inviteGuestName.value = g.name;
  inviteLink.value = '';
  inviteCopied.value = false;
  inviteDialog.value = true;
  try {
    const token = await generateGuestInvite(g.id, { name: g.name, phone: g.phone || "", email: g.email || "" });
    const base = window.location.origin;
    inviteLink.value = `${base}/register/${token}`;
  } catch {
    error.value = t('common.error');
    inviteDialog.value = false;
  }
};

const copyInviteLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    inviteCopied.value = true;
    setTimeout(() => { inviteCopied.value = false; }, 2000);
  } catch {}
};

onMounted(() => {
  const unsub = subscribe();
  onUnmounted(unsub);
  watch(guests, () => { loading.value = false; }, { once: true });
});
</script>

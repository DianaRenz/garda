<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">{{ $t('bookings.title') }}</h1>
      <VBtn class="gradient primary" prepend-icon="fluent:add-24-regular" @click="dialog = true">
        {{ $t('bookings.add') }}
      </VBtn>
    </div>

    <div class="d-flex ga-3 mb-6 flex-wrap">
      <VChip
        v-for="s in statuses"
        :key="s.value"
        :color="s.color"
        variant="tonal"
        @click="filterStatus = s.value"
        :class="{ 'font-weight-bold': filterStatus === s.value }"
      >
        {{ $t(`bookings.statuses.${s.value}`) }}
      </VChip>
    </div>

    <VCard variant="outlined" class="pa-6 text-center text-medium-emphasis">
      {{ $t('bookings.empty') }}
    </VCard>

    <VDialog v-model="dialog" max-width="500">
      <VCard>
        <VCardTitle class="pa-6 pb-2">{{ $t('bookings.form.title') }}</VCardTitle>
        <VCardText>
          <VForm @submit.prevent="saveBooking">
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
          <VBtn class="gradient primary" @click="saveBooking">{{ $t('bookings.form.save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const { ruleRequired } = useFormRules();
const { t } = useI18n();

const dialog = ref(false);
const filterStatus = ref("all");

const statuses = [
  { value: "all", color: "default" },
  { value: "pending", color: "warning" },
  { value: "confirmed", color: "primary" },
  { value: "blocked", color: "error" },
];

const statusOptions = computed(() =>
  statuses.filter(s => s.value !== "all").map(s => ({
    value: s.value,
    label: t(`bookings.statuses.${s.value}`),
  }))
);

const form = reactive({
  guestName: "",
  guestContact: "",
  startDate: "",
  endDate: "",
  status: "confirmed",
  notes: "",
});

const saveBooking = async () => {
  // TODO: save to Firestore
  dialog.value = false;
};
</script>

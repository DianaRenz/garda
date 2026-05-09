<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="11" md="9" lg="8">

        <div v-if="loading" class="text-center py-16">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <template v-else>
          <!-- Header -->
          <div class="d-flex align-start justify-space-between ga-3 mb-2 flex-wrap">
            <div class="flex-grow-1" style="min-width: 200px">
              <h1 class="text-h5 font-weight-bold">{{ $t('supplies.title') }}</h1>
              <p class="text-body-2 text-medium-emphasis mt-1">{{ $t('supplies.subtitle') }}</p>
            </div>
            <VBtn
              class="gradient primary flex-shrink-0"
              prepend-icon="fluent:add-24-regular"
              min-height="40"
              @click="openAdd"
            >
              {{ $t('supplies.addBtn') }}
            </VBtn>
          </div>

          <!-- Status filter -->
          <div class="d-flex ga-2 flex-wrap mt-5">
            <VChip
              v-for="f in statusFilters"
              :key="f.value"
              :variant="statusFilter === f.value ? 'flat' : 'outlined'"
              :color="statusFilter === f.value ? 'primary' : undefined"
              size="small"
              class="cursor-pointer"
              @click="statusFilter = f.value"
            >
              {{ $t(f.label) }}
            </VChip>
          </div>

          <!-- Category filter -->
          <div class="d-flex ga-2 flex-wrap mt-3 mb-6">
            <VChip
              v-for="cat in categoryFilters"
              :key="cat.value"
              :prepend-icon="cat.icon"
              :variant="categoryFilter === cat.value ? 'flat' : 'outlined'"
              :color="categoryFilter === cat.value ? 'primary' : undefined"
              size="small"
              class="cursor-pointer"
              @click="categoryFilter = cat.value"
            >
              {{ $t(cat.label) }}
            </VChip>
          </div>

          <!-- Empty -->
          <VCard v-if="!filtered.length" variant="outlined" rounded="lg" class="py-12 text-center">
            <VIcon icon="fluent:box-multiple-24-regular" size="32" class="mb-3" style="opacity: 0.4" />
            <p class="text-body-2 text-medium-emphasis">
              {{ items.length === 0 ? $t('supplies.empty') : $t('supplies.emptyFiltered') }}
            </p>
          </VCard>

          <!-- Grouped list -->
          <template v-else>
            <div v-for="group in grouped" :key="group.category" class="mb-6">
              <div class="d-flex align-center ga-2 mb-2">
                <VIcon :icon="categoryIcons[group.category]" size="18" color="primary" />
                <h2 class="text-body-2 font-weight-medium text-medium-emphasis">
                  {{ $t(`supplies.categories.${group.category}`) }}
                </h2>
              </div>

              <VCard variant="outlined" rounded="lg">
                <div v-for="(item, i) in group.items" :key="item.id">
                  <VDivider v-if="i > 0" />
                  <div
                    class="d-flex align-center ga-3 px-3 py-3 supplies-row"
                    @click="openEdit(item)"
                  >
                    <!-- Status — tap to cycle, stops propagation -->
                    <VTooltip :text="'→ ' + $t(`supplies.statuses.${cycleStatus(item.status)}`)" location="top">
                      <template #activator="{ props: tp }">
                        <VBtn
                          v-bind="tp"
                          :icon="statusIcons[item.status]"
                          :color="statusColors[item.status]"
                          variant="text"
                          density="comfortable"
                          :loading="busyId === item.id"
                          :aria-label="$t(`supplies.statuses.${item.status}`)"
                          @click.stop="cycle(item)"
                        />
                      </template>
                    </VTooltip>

                    <div class="flex-grow-1" style="min-width: 0">
                      <div class="text-body-1" style="overflow-wrap: anywhere">{{ item.name }}</div>
                      <div v-if="item.note" class="text-caption text-medium-emphasis mt-1" style="overflow-wrap: anywhere">
                        {{ item.note }}
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1" style="opacity: 0.7">
                        <template v-if="userRole === 'admin'">
                          {{ $t('supplies.updatedBy', { name: item.updatedByName || '—' }) }}
                          ·
                        </template>
                        {{ formatDate(item.updatedAt) }}
                      </div>
                    </div>

                    <VIcon icon="fluent:chevron-right-24-regular" size="16" class="flex-shrink-0" style="opacity: 0.4" />
                  </div>
                </div>
              </VCard>
            </div>
          </template>
        </template>
      </VCol>
    </VRow>

    <InventoryAddSheet v-model="sheetOpen" :existing-item="editingItem" />

    <VSnackbar
      :model-value="!!errorMsg"
      color="error"
      timeout="4000"
      location="bottom"
      @update:model-value="errorMsg = null"
    >
      {{ errorMsg }}
    </VSnackbar>
  </VContainer>
</template>

<script setup lang="ts">
import {
  CATEGORY_ICONS,
  STATUS_ICONS,
  STATUS_COLORS,
  SUPPLY_CATEGORIES,
  sortItems,
  cycleStatus,
  type SupplyCategory,
  type SupplyItem,
} from "~/composables/useInventory";

definePageMeta({ layout: "default" });

useHead({
  meta: [{ name: "robots", content: "noindex,nofollow" }],
});

const { items, subscribe, cycleItemStatus } = useInventory();
const { fetchProfile } = useUserProfile();
const { formatDate } = useBookings();
const { userRole } = useAuth();
const { t } = useI18n();

const loading = ref(true);
const sheetOpen = ref(false);
const editingItem = ref<SupplyItem | null>(null);
const busyId = ref<string | null>(null);
const errorMsg = ref<string | null>(null);

type StatusFilter = "all" | "toBuy" | "inStock";
type CategoryFilter = SupplyCategory | "all";

const statusFilter = ref<StatusFilter>("all");
const categoryFilter = ref<CategoryFilter>("all");

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all",     label: "supplies.filters.all" },
  { value: "toBuy",   label: "supplies.filters.toBuy" },
  { value: "inStock", label: "supplies.filters.inStock" },
];

const categoryFilters: { value: CategoryFilter; icon?: string; label: string }[] = [
  { value: "all",       label: "supplies.filters.all" },
  ...SUPPLY_CATEGORIES.map((c) => ({
    value: c as CategoryFilter,
    icon: CATEGORY_ICONS[c],
    label: `supplies.categories.${c}`,
  })),
];

const categoryIcons = CATEGORY_ICONS;
const statusIcons = STATUS_ICONS;
const statusColors = STATUS_COLORS;

const filtered = computed<SupplyItem[]>(() => {
  return items.value.filter((item) => {
    if (statusFilter.value === "toBuy" && item.status === "stocked") return false;
    if (statusFilter.value === "inStock" && item.status !== "stocked") return false;
    if (categoryFilter.value !== "all" && item.category !== categoryFilter.value) return false;
    return true;
  });
});

const grouped = computed<{ category: SupplyCategory; items: SupplyItem[] }[]>(() => {
  const buckets = new Map<SupplyCategory, SupplyItem[]>();
  for (const item of filtered.value) {
    const list = buckets.get(item.category) ?? [];
    list.push(item);
    buckets.set(item.category, list);
  }
  return SUPPLY_CATEGORIES
    .filter((c) => buckets.has(c))
    .map((c) => ({ category: c, items: sortItems(buckets.get(c)!) }));
});

const openAdd = () => {
  editingItem.value = null;
  sheetOpen.value = true;
};

const openEdit = (item: SupplyItem) => {
  editingItem.value = item;
  sheetOpen.value = true;
};

const cycle = async (item: SupplyItem) => {
  busyId.value = item.id;
  errorMsg.value = null;
  try {
    await cycleItemStatus(item);
  } catch {
    errorMsg.value = t("common.error");
  } finally {
    busyId.value = null;
  }
};

let unsubscribe: (() => void) | null = null;

onMounted(async () => {
  const user = await useAuthGuard();
  if (!user) return;
  // Pull profile so updatedByName uses the friendly name (guests) instead
  // of falling back to email when the user adds/updates an item.
  await fetchProfile(user.uid, user.email).catch(() => {});
  unsubscribe = subscribe();
  loading.value = false;
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>

<style scoped>
.supplies-row {
  cursor: pointer;
  transition: background-color 0.12s;
}
.supplies-row:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
</style>

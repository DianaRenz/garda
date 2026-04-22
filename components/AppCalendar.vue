<template>
  <div>
    <!-- Month navigation -->
    <div class="d-flex align-center justify-space-between mb-4">
      <VBtn icon variant="text" density="comfortable" @click="prev">
        <VIcon icon="fluent:chevron-left-24-regular" />
      </VBtn>
      <span class="font-weight-medium text-body-1 text-capitalize">{{ label }}</span>
      <VBtn icon variant="text" density="comfortable" @click="next">
        <VIcon icon="fluent:chevron-right-24-regular" />
      </VBtn>
    </div>

    <!-- Weekday headers -->
    <div class="cal-grid mb-1">
      <div v-for="(h, i) in headers" :key="i" class="cal-header">{{ h }}</div>
    </div>

    <!-- Day cells -->
    <div class="cal-grid">
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="cal-cell"
        :class="{ 'cal-cell--clickable': showNames && !!cell.booking }"
        :style="cellStyle(cell)"
        @click="cell.booking && showNames && $emit('select', cell.booking)"
      >
        <span
          class="text-caption"
          :class="cell.isToday ? 'font-weight-bold text-primary' : ''"
        >{{ cell.day }}</span>
        <span v-if="showNames && cell.booking && cell.isCurrentMonth" class="cal-name">
          {{ cell.booking.guestName }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/composables/useBookings'

const props = withDefaults(defineProps<{
  bookings: Booking[]
  showNames?: boolean
  highlightIds?: string[]
}>(), { showNames: false, highlightIds: () => [] })

defineEmits<{ select: [booking: Booking] }>()

const { locale } = useI18n()

const intlLocale = computed(() =>
  ({ ru: 'ru-RU', en: 'en-US', de: 'de-DE' }[locale.value] ?? locale.value)
)

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const prev = () => {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
const next = () => {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

const label = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1)
    .toLocaleDateString(intlLocale.value, { month: 'long', year: 'numeric' })
)

// Jan 1 2024 is Monday — use as anchor for weekday names
const headers = computed(() =>
  Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(intlLocale.value, { weekday: 'short' })
  )
)

const toStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const todayStr = toStr(now)

const PRIORITY: Record<string, number> = { blocked: 3, confirmed: 2, pending: 1 }

const BG: Record<string, string> = {
  pending:   'rgba(255, 193,  7, 0.2)',
  confirmed: 'rgba( 33, 150, 243, 0.16)',
  blocked:   'rgba(244,  67,  54, 0.14)',
}

const getBooking = (dateStr: string): Booking | null => {
  const matches = props.bookings.filter(b => {
    if (!b.startDate || !b.endDate) return false
    return dateStr >= toStr(b.startDate.toDate()) && dateStr <= toStr(b.endDate.toDate())
  })
  if (!matches.length) return null
  return matches.reduce((best, b) =>
    (PRIORITY[b.status] ?? 0) > (PRIORITY[best.status] ?? 0) ? b : best
  )
}

const cells = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstDay = new Date(y, m, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Mon = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prevMonthDays = new Date(y, m, 0).getDate()
  const result = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, prevMonthDays - i)
    result.push({ key: `p${i}`, day: prevMonthDays - i, isCurrentMonth: false, isToday: false, booking: getBooking(toStr(d)) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const s = toStr(new Date(y, m, d))
    result.push({ key: `c${d}`, day: d, isCurrentMonth: true, isToday: s === todayStr, booking: getBooking(s) })
  }
  const total = Math.ceil((startOffset + daysInMonth) / 7) * 7
  for (let d = 1; d <= total - startOffset - daysInMonth; d++) {
    const s = toStr(new Date(y, m + 1, d))
    result.push({ key: `n${d}`, day: d, isCurrentMonth: false, isToday: false, booking: getBooking(s) })
  }
  return result
})

const highlightSet = computed(() => new Set(props.highlightIds))

const cellStyle = (cell: typeof cells.value[0]) => {
  const isOwn = cell.booking && cell.isCurrentMonth && highlightSet.value.has(cell.booking.id)
  return {
    opacity: cell.isCurrentMonth ? 1 : 0.3,
    background: (cell.booking && cell.isCurrentMonth) ? BG[cell.booking.status] : undefined,
    border: isOwn
      ? '2px solid rgb(var(--v-theme-primary))'
      : '1px solid rgba(0,0,0,0.06)',
    boxShadow: isOwn ? '0 0 0 1px rgb(var(--v-theme-primary))' : undefined,
  }
}
</script>

<style scoped>
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.cal-header {
  text-align: center;
  font-size: 11px;
  padding: 4px 0 6px;
  opacity: 0.45;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cal-cell {
  min-height: 60px;
  padding: 6px 7px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: default;
  transition: filter 0.12s;
}
.cal-cell--clickable {
  cursor: pointer;
}
.cal-cell--clickable:hover {
  filter: brightness(0.93);
}
.cal-name {
  font-size: 11px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.75;
}

@media (max-width: 599px) {
  .cal-cell {
    min-height: 42px;
    padding: 4px 3px;
    border-radius: 5px;
    gap: 2px;
  }
  .cal-header {
    font-size: 10px;
    padding: 2px 0 4px;
    letter-spacing: 0;
  }
  .cal-name {
    font-size: 9px;
  }
}
</style>

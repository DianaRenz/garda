import {
  collection, doc,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp,
  addDoc, updateDoc, deleteDoc,
} from "firebase/firestore";
import { ref as vueRef } from "vue";

export type BookingStatus = "pending" | "confirmed" | "blocked" | "rejected" | "cancelled";

export interface Booking {
  id: string;
  guestId: string | null;
  userId: string | null;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestContact?: string; // legacy field — kept for backward compat with old Firestore docs
  startDate: Timestamp;
  endDate: Timestamp;
  status: BookingStatus;
  source: "admin" | "request";
  notes: string;
  rejectionNote: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CalendarBooking {
  id: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: Exclude<BookingStatus, "rejected" | "cancelled">;
  userId: string | null;
}

export interface BookingForm {
  guestId?: string | null;
  userId?: string | null;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  status: BookingStatus;
  source: "admin" | "request";
  notes: string;
  rejectionNote?: string | null;
}

const tsToStr = (ts: Timestamp): string => {
  const d = ts.toDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const useBookings = () => {
  const { $db } = useNuxtApp();
  const bookings = useState<Booking[]>("bookings", () => []);

  const subscribe = () => {
    const q = query(collection($db, "bookings"), orderBy("startDate", "asc"));
    return onSnapshot(q,
      (snap) => {
        bookings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
      },
      (err) => {
        if (import.meta.dev) console.error('[useBookings] subscribe error:', err);
      },
    );
  };

  const subscribeCalendar = () => {
    const calendarBookings = vueRef<CalendarBooking[]>([]);
    const q = query(collection($db, "bookings"), orderBy("startDate", "asc"));
    const unsub = onSnapshot(q,
      (snap) => {
        calendarBookings.value = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              startDate: data.startDate,
              endDate: data.endDate,
              status: data.status,
              userId: data.userId ?? null,
            };
          })
          .filter((b) => b.status !== "rejected" && b.status !== "cancelled") as CalendarBooking[];
      },
      (err) => {
        if (import.meta.dev) console.error('[useBookings] calendar listener error:', err);
      },
    );
    return { calendarBookings, unsub };
  };

  const getConflicts = (booking: Booking): Booking[] => {
    if (!booking.startDate || !booking.endDate) return [];
    const aStart = tsToStr(booking.startDate);
    const aEnd = tsToStr(booking.endDate);
    return bookings.value.filter((b) => {
      if (b.id === booking.id) return false;
      if (b.status === "rejected" || b.status === "blocked" || b.status === "cancelled") return false;
      if (!b.startDate || !b.endDate) return false;
      return aStart <= tsToStr(b.endDate) && aEnd >= tsToStr(b.startDate);
    });
  };

  const createBooking = async (form: BookingForm) => {
    const startDate = Timestamp.fromDate(new Date(form.startDate));
    const endDate = Timestamp.fromDate(new Date(form.endDate));
    await addDoc(collection($db, "bookings"), {
      guestId: form.guestId ?? null,
      userId: form.userId ?? null,
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      guestEmail: form.guestEmail,
      startDate,
      endDate,
      status: form.status,
      source: form.source,
      notes: form.notes,
      rejectionNote: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateBooking = async (id: string, data: Partial<Omit<Booking, "id">>) => {
    await updateDoc(doc($db, "bookings", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteBooking = async (id: string) => {
    await deleteDoc(doc($db, "bookings", id));
  };

  const { locale } = useI18n();
  const intlLocale = computed(() =>
    ({ ru: 'ru-RU', en: 'en-US', de: 'de-DE' }[locale.value] ?? locale.value)
  );

  const formatDate = (ts: Timestamp | undefined) => {
    if (!ts) return "—";
    return ts.toDate().toLocaleDateString(intlLocale.value, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusColor: Record<string, string> = {
    pending:   "warning",
    confirmed: "primary",
    blocked:   "error",
    rejected:  "secondary",
    cancelled: "secondary",
  };

  return {
    bookings, subscribe, subscribeCalendar, getConflicts,
    createBooking, updateBooking, deleteBooking,
    formatDate, statusColor,
  };
};

import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, where, onSnapshot, serverTimestamp, Timestamp,
} from "firebase/firestore";

export type BookingStatus = "pending" | "confirmed" | "blocked" | "rejected";

export interface Booking {
  id: string;
  guestId: string | null;
  userId: string | null;
  guestName: string;
  guestContact: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: BookingStatus;
  source: "admin" | "request";
  notes: string;
  rejectionNote: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BookingForm {
  guestId?: string | null;
  userId?: string | null;
  guestName: string;
  guestContact: string;
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
    return onSnapshot(q, (snap) => {
      bookings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
    });
  };

  const subscribeByUser = (uid: string) => {
    const q = query(
      collection($db, "bookings"),
      where("userId", "==", uid),
      orderBy("startDate", "asc")
    );
    return onSnapshot(q, (snap) => {
      bookings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
    });
  };

  const getConflicts = (booking: Booking): Booking[] => {
    if (!booking.startDate || !booking.endDate) return [];
    const aStart = tsToStr(booking.startDate);
    const aEnd = tsToStr(booking.endDate);
    return bookings.value.filter((b) => {
      if (b.id === booking.id) return false;
      if (b.status === "rejected" || b.status === "blocked") return false;
      if (!b.startDate || !b.endDate) return false;
      return aStart <= tsToStr(b.endDate) && aEnd >= tsToStr(b.startDate);
    });
  };

  const createBooking = async (form: BookingForm) => {
    await addDoc(collection($db, "bookings"), {
      guestId: form.guestId ?? null,
      userId: form.userId ?? null,
      guestName: form.guestName,
      guestContact: form.guestContact,
      startDate: Timestamp.fromDate(new Date(form.startDate)),
      endDate: Timestamp.fromDate(new Date(form.endDate)),
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

  const formatDate = (ts: Timestamp | undefined) => {
    if (!ts) return "—";
    return ts.toDate().toLocaleDateString("ru-RU", {
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
  };

  return {
    bookings, subscribe, subscribeByUser, getConflicts,
    createBooking, updateBooking, deleteBooking,
    formatDate, statusColor,
  };
};

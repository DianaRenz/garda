import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp,
} from "firebase/firestore";

export interface Booking {
  id: string;
  guestId: string | null;
  guestName: string;
  guestContact: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: "pending" | "confirmed" | "blocked";
  source: "admin" | "request";
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BookingForm {
  guestId?: string | null;
  guestName: string;
  guestContact: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  status: "pending" | "confirmed" | "blocked";
  source: "admin" | "request";
  notes: string;
}

export const useBookings = () => {
  const { $db } = useNuxtApp();
  const bookings = useState<Booking[]>("bookings", () => []);

  const subscribe = () => {
    const q = query(collection($db, "bookings"), orderBy("startDate", "asc"));
    return onSnapshot(q, (snap) => {
      bookings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
    });
  };

  const createBooking = async (form: BookingForm) => {
    await addDoc(collection($db, "bookings"), {
      guestId: form.guestId ?? null,
      guestName: form.guestName,
      guestContact: form.guestContact,
      startDate: Timestamp.fromDate(new Date(form.startDate)),
      endDate: Timestamp.fromDate(new Date(form.endDate)),
      status: form.status,
      source: form.source,
      notes: form.notes,
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
    pending: "warning",
    confirmed: "primary",
    blocked: "error",
  };

  return { bookings, subscribe, createBooking, updateBooking, deleteBooking, formatDate, statusColor };
};

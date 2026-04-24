import {
  collection, doc,
  query, orderBy, where, onSnapshot, serverTimestamp, Timestamp,
  writeBatch,
} from "firebase/firestore";

export type BookingStatus = "pending" | "confirmed" | "blocked" | "rejected";

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

export interface PublicBooking {
  id: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: Exclude<BookingStatus, "rejected">;
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
  const publicBookings = useState<PublicBooking[]>("public-bookings", () => []);

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

  const subscribePublic = () => {
    const q = query(collection($db, "publicBookings"), orderBy("startDate", "asc"));
    return onSnapshot(q, (snap) => {
      publicBookings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PublicBooking));
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
    const ref = doc(collection($db, "bookings"));
    const batch = writeBatch($db);
    const startDate = Timestamp.fromDate(new Date(form.startDate));
    const endDate = Timestamp.fromDate(new Date(form.endDate));

    batch.set(ref, {
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

    if (form.status !== "rejected") {
      batch.set(doc($db, "publicBookings", ref.id), {
        startDate,
        endDate,
        status: form.status,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  };

  const updateBooking = async (id: string, data: Partial<Omit<Booking, "id">>) => {
    const current = bookings.value.find((booking) => booking.id === id);
    const merged = current ? { ...current, ...data } : null;
    const projection = {
      startDate: data.startDate ?? merged?.startDate,
      endDate: data.endDate ?? merged?.endDate,
      status: data.status ?? merged?.status,
    };
    const batch = writeBatch($db);

    batch.update(doc($db, "bookings", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    if (projection.startDate && projection.endDate && projection.status && projection.status !== "rejected") {
      batch.set(doc($db, "publicBookings", id), {
        startDate: projection.startDate,
        endDate: projection.endDate,
        status: projection.status,
        updatedAt: serverTimestamp(),
      });
    } else if (projection.status === "rejected") {
      batch.delete(doc($db, "publicBookings", id));
    }

    await batch.commit();
  };

  const deleteBooking = async (id: string) => {
    const batch = writeBatch($db);
    batch.delete(doc($db, "bookings", id));
    batch.delete(doc($db, "publicBookings", id));
    await batch.commit();
  };

  const syncPublicBookings = async (source = bookings.value) => {
    const batch = writeBatch($db);
    source.forEach((booking) => {
      const ref = doc($db, "publicBookings", booking.id);
      if (booking.status === "rejected") {
        batch.delete(ref);
      } else {
        batch.set(ref, {
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
          updatedAt: serverTimestamp(),
        });
      }
    });
    await batch.commit();
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
    bookings, publicBookings, subscribe, subscribeByUser, subscribePublic, getConflicts,
    createBooking, updateBooking, deleteBooking, syncPublicBookings,
    formatDate, statusColor,
  };
};

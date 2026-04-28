import {
  collection, addDoc, deleteDoc, doc, getDoc,
  query, orderBy, where, onSnapshot, getDocs,
  serverTimestamp, writeBatch, updateDoc,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  userId?: string | null; // Firebase Auth UID — set when guest self-registers
  createdAt: Timestamp;
}

export const useGuests = () => {
  const { $db } = useNuxtApp();
  const guests = useState<Guest[]>("guests", () => []);

  const subscribe = () => {
    const q = query(collection($db, "guests"), orderBy("name", "asc"));
    return onSnapshot(q, (snap) => {
      guests.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guest));
    });
  };

  const createGuest = async (data: Omit<Guest, "id" | "createdAt">) => {
    const docRef = await addDoc(collection($db, "guests"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const deleteGuest = async (id: string) => {
    await deleteDoc(doc($db, "guests", id));
  };

  const getGuest = async (id: string): Promise<Guest | null> => {
    const snap = await getDoc(doc($db, "guests", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Guest;
  };

  const linkGuestToUser = async (
    guestId: string,
    userId: string,
    profileData: { name: string; phone: string; email: string }
  ) => {
    const batch = writeBatch($db);
    // Update guest record with userId and fresh profile data
    batch.update(doc($db, "guests", guestId), {
      userId,
      name: profileData.name,
      phone: profileData.phone,
      email: profileData.email,
    });
    // Migrate bookings: add userId to bookings linked by guestId that have no userId
    const bookingsQ = query(
      collection($db, "bookings"),
      where("guestId", "==", guestId),
      where("userId", "==", null)
    );
    const bookingSnaps = await getDocs(bookingsQ);
    for (const bookingDoc of bookingSnaps.docs) {
      batch.update(bookingDoc.ref, { userId });
    }
    await batch.commit();
  };

  return { guests, subscribe, createGuest, deleteGuest, getGuest, linkGuestToUser };
};

import {
  collection, addDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, serverTimestamp,
} from "firebase/firestore";

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  userId?: string | null; // Firebase Auth UID — set when guest self-registers
  createdAt: any;
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
    await addDoc(collection($db, "guests"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  };

  const deleteGuest = async (id: string) => {
    await deleteDoc(doc($db, "guests", id));
  };

  return { guests, subscribe, createGuest, deleteGuest };
};

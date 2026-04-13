import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface ApartmentInfo {
  title: string;
  description: string;
  address: string;
  directions: string;
  rules: string;
  photos: string[];
}

export const useApartment = () => {
  const { $db } = useNuxtApp();
  const apartment = useState<ApartmentInfo | null>("apartment", () => null);

  const fetchApartment = async () => {
    const snap = await getDoc(doc($db, "apartment", "info"));
    if (snap.exists()) {
      apartment.value = snap.data() as ApartmentInfo;
    }
  };

  const saveApartment = async (data: Omit<ApartmentInfo, "photos">) => {
    await setDoc(
      doc($db, "apartment", "info"),
      { ...data, photos: apartment.value?.photos ?? [], updatedAt: serverTimestamp() },
      { merge: true }
    );
    apartment.value = { ...apartment.value, ...data, photos: apartment.value?.photos ?? [] };
  };

  return { apartment, fetchApartment, saveApartment };
};

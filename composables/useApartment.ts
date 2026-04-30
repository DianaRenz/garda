import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface ApartmentInfo {
  title: string;
  description: string;
  address: string;
  directions: string;
  rules: string;
  paypalLink: string | null;
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

  const saveApartment = async (data: Partial<Omit<ApartmentInfo, "photos">>) => {
    await setDoc(
      doc($db, "apartment", "info"),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
    apartment.value = {
      ...(apartment.value ?? { title: "", description: "", address: "", directions: "", rules: "", paypalLink: null, photos: [] }),
      ...data,
    } as ApartmentInfo;
  };

  return { apartment, fetchApartment, saveApartment };
};

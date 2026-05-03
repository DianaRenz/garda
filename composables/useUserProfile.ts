import { doc, getDoc } from "firebase/firestore";

/**
 * Fetch user profile (name, email, phone) from Firestore users collection.
 */
export const useUserProfile = () => {
  const { $db } = useNuxtApp();

  const userData = ref<{ name?: string; email?: string; phone?: string }>({});

  const fetchProfile = async (uid: string, fallbackEmail?: string | null) => {
    try {
      const snap = await getDoc(doc($db, "users", uid));
      if (snap.exists()) {
        userData.value = snap.data() as { name?: string; email?: string; phone?: string };
      } else if (fallbackEmail) {
        userData.value = { email: fallbackEmail };
      }
    } catch {
      if (fallbackEmail) userData.value = { email: fallbackEmail };
    }
  };

  return { userData, fetchProfile };
};

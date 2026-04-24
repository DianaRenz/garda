import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

export const useInvite = () => {
  const { $db } = useNuxtApp();

  const generateInvite = async (type: "admin" | "guest"): Promise<string> => {
    const token = crypto.randomUUID();
    const ref = doc(collection($db, "invites"), token);
    await setDoc(ref, {
      token,
      type,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ),
      used: false,
      usedAt: null,
    });
    return token;
  };

  const validateToken = async (
    token: string
  ): Promise<{ valid: boolean; type?: "admin" | "guest"; error?: "not_found" | "used" | "expired" }> => {
    const ref = doc($db, "invites", token);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { valid: false, error: "not_found" };
    const data = snap.data();
    if (data.used) return { valid: false, error: "used" };
    if (data.expiresAt.toDate() < new Date())
      return { valid: false, error: "expired" };
    return { valid: true, type: data.type ?? "admin" };
  };

  const markTokenUsed = async (token: string) => {
    const ref = doc($db, "invites", token);
    await updateDoc(ref, { used: true, usedAt: serverTimestamp() });
  };

  return { generateInvite, validateToken, markTokenUsed };
};

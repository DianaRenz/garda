import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) return;

  // Firebase Auth relies on localStorage — skip on server
  if (import.meta.server) return;

  const { $auth, $db } = useNuxtApp();

  const user = await new Promise<any>((resolve) => {
    const unsubscribe = onAuthStateChanged($auth, (u) => {
      unsubscribe();
      resolve(u);
    });
  });

  if (!user) return navigateTo("/login");

  try {
    const userDoc = await getDoc(doc($db, "users", user.uid));
    if (!userDoc.exists()) return navigateTo("/setup");
    if (userDoc.data().role !== "admin") return navigateTo("/login");
  } catch {
    return navigateTo("/login");
  }
});

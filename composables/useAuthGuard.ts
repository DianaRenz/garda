import { onAuthStateChanged } from "firebase/auth";

/**
 * Client-side auth guard for guest-facing pages.
 * Returns the authenticated user or redirects to /login.
 */
export const useAuthGuard = async () => {
  const { $auth } = useNuxtApp();

  if (import.meta.server) return null;

  const user = await new Promise<any>((resolve) => {
    const unsub = onAuthStateChanged($auth, (u) => {
      unsub();
      resolve(u);
    });
  });

  if (!user) {
    await navigateTo("/login");
    return null;
  }

  return user;
};

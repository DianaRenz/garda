import { onAuthStateChanged } from "firebase/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) return;

  const { $auth } = useNuxtApp();

  const user = await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged($auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

  if (!user) {
    return navigateTo("/login");
  }
});

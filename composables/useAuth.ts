import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const useAuth = () => {
  const { $auth, $db } = useNuxtApp();
  const user = useState<User | null>("auth-user", () => null);
  const userRole = useState<"admin" | "guest" | null>("auth-role", () => null);

  const init = () => {
    onAuthStateChanged($auth, async (u) => {
      user.value = u;
      if (u) {
        try {
          const snap = await getDoc(doc($db, "users", u.uid));
          userRole.value = (snap.data()?.role as "admin" | "guest") ?? null;
        } catch {
          userRole.value = null;
        }
      } else {
        userRole.value = null;
      }
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword($auth, email, password);
  };

  const logout = async () => {
    await signOut($auth);
    await navigateTo("/login");
  };

  const isLoggedIn = computed(() => !!user.value);

  return { user, userRole, isLoggedIn, init, login, logout };
};

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

export const useAuth = () => {
  const { $auth } = useNuxtApp();
  const user = useState<User | null>("auth-user", () => null);

  const init = () => {
    onAuthStateChanged($auth, (u) => {
      user.value = u;
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

  return { user, isLoggedIn, init, login, logout };
};

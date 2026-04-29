import { vi } from "vitest";

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  onAuthStateChanged: vi.fn(() => () => {}),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("firebase/firestore", () => {
  class Timestamp {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    static fromDate(d: Date) {
      const ms = d.getTime();
      return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
    }
    static now() {
      return Timestamp.fromDate(new Date());
    }
    toDate() {
      return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
    }
    toMillis() {
      return this.seconds * 1000 + this.nanoseconds / 1e6;
    }
  }
  return {
    Timestamp,
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn(() => () => {}),
    serverTimestamp: vi.fn(() => ({ __server: true })),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    arrayUnion: vi.fn((v) => ({ __op: "arrayUnion", v })),
    arrayRemove: vi.fn((v) => ({ __op: "arrayRemove", v })),
  };
});

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

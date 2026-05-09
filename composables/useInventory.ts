import {
  collection, doc,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp,
  addDoc, updateDoc, deleteDoc,
} from "firebase/firestore";

export type SupplyCategory = "hygiene" | "food" | "household" | "other";
export type SupplyStatus = "stocked" | "low" | "out";

export const SUPPLY_CATEGORIES: SupplyCategory[] = [
  "hygiene",
  "food",
  "household",
  "other",
];

export const SUPPLY_STATUSES: SupplyStatus[] = ["stocked", "low", "out"];

export const CATEGORY_ICONS: Record<SupplyCategory, string> = {
  hygiene:   "fluent:bottle-tonic-24-regular",
  food:      "fluent:food-24-regular",
  household: "fluent:wash-shield-24-regular",
  other:     "fluent:box-24-regular",
};

export const STATUS_ICONS: Record<SupplyStatus, string> = {
  stocked: "fluent:checkmark-circle-24-filled",
  low:     "fluent:warning-24-filled",
  out:     "fluent:dismiss-circle-24-filled",
};

export const STATUS_COLORS: Record<SupplyStatus, string> = {
  stocked: "success",
  low:     "warning",
  out:     "error",
};

// Sort priority: out first (most urgent), then low, then stocked.
const STATUS_PRIORITY: Record<SupplyStatus, number> = {
  out: 0,
  low: 1,
  stocked: 2,
};

export interface SupplyItem {
  id: string;
  name: string;
  category: SupplyCategory;
  status: SupplyStatus;
  note: string;
  createdAt: Timestamp;
  createdBy: string;
  createdByName: string;
  updatedAt: Timestamp;
  updatedBy: string;
  updatedByName: string;
}

/**
 * Cycle status: stocked → low → out → stocked.
 * Pure helper — exported for tests and one-tap UX.
 */
export const cycleStatus = (current: SupplyStatus): SupplyStatus => {
  if (current === "stocked") return "low";
  if (current === "low") return "out";
  return "stocked";
};

/**
 * Default sort: out → low → stocked, ties broken alphabetically.
 * Pure helper — exported for tests.
 */
export const sortItems = (items: SupplyItem[]): SupplyItem[] => {
  return [...items].sort((a, b) => {
    const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (byStatus !== 0) return byStatus;
    return a.name.localeCompare(b.name);
  });
};

export const useInventory = () => {
  const { $db } = useNuxtApp();
  const items = useState<SupplyItem[]>("inventory-items", () => []);
  const { user } = useAuth();
  const { userData } = useUserProfile();

  const subscribe = () => {
    const q = query(collection($db, "inventory"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        items.value = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupplyItem));
      },
      (err) => {
        if (import.meta.dev) console.error("[useInventory] subscribe error:", err);
      }
    );
  };

  // Display name: prefer profile name (guests), fall back to email (admins).
  const currentDisplayName = (): string => {
    return userData.value?.name || userData.value?.email || user.value?.email || "";
  };

  const requireUid = (): string => {
    const uid = user.value?.uid;
    if (!uid) throw new Error("Not authenticated");
    return uid;
  };

  const addItem = async (input: {
    name: string;
    category: SupplyCategory;
    status?: SupplyStatus;
    note?: string;
  }) => {
    const uid = requireUid();
    const displayName = currentDisplayName();
    await addDoc(collection($db, "inventory"), {
      name: input.name.trim(),
      category: input.category,
      status: input.status ?? "stocked",
      note: (input.note ?? "").trim(),
      createdAt: serverTimestamp(),
      createdBy: uid,
      createdByName: displayName,
      updatedAt: serverTimestamp(),
      updatedBy: uid,
      updatedByName: displayName,
    });
  };

  const updateItem = async (
    id: string,
    patch: Partial<Pick<SupplyItem, "name" | "category" | "status" | "note">>
  ) => {
    const uid = requireUid();
    const displayName = currentDisplayName();
    const item = items.value.find((i) => i.id === id);
    if (!item) throw new Error("Item not found");

    const trimmed = {
      ...(patch.name !== undefined && { name: patch.name.trim() }),
      ...(patch.note !== undefined && { note: patch.note.trim() }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.status !== undefined && { status: patch.status }),
    };

    // Rules require a complete payload (full validation on every update),
    // so we send the merged result rather than a sparse patch.
    await updateDoc(doc($db, "inventory", id), {
      name: trimmed.name ?? item.name,
      category: trimmed.category ?? item.category,
      status: trimmed.status ?? item.status,
      note: trimmed.note ?? item.note,
      updatedAt: serverTimestamp(),
      updatedBy: uid,
      updatedByName: displayName,
    });
  };

  const updateStatus = (id: string, status: SupplyStatus) =>
    updateItem(id, { status });

  const cycleItemStatus = (item: SupplyItem) =>
    updateStatus(item.id, cycleStatus(item.status));

  const deleteItem = async (id: string) => {
    await deleteDoc(doc($db, "inventory", id));
  };

  return {
    items,
    subscribe,
    addItem,
    updateItem,
    updateStatus,
    cycleItemStatus,
    deleteItem,
  };
};

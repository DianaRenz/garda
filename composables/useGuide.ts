import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { arrayUnion, arrayRemove } from "firebase/firestore";

export const GUIDE_LOCALES = ["ru", "en", "de"] as const;
export type GuideLocale = (typeof GUIDE_LOCALES)[number];

export interface GuideSection {
  text: Record<string, string>;
  photos: string[];
}

export interface GuideData {
  gallery: {
    apartment: string[];
    garden: string[];
    view: string[];
  };
  sections: Record<string, GuideSection>;
  checkoutItems: Record<string, string[]>;
  updatedAt: Timestamp | null;
}

export const GUIDE_SECTION_KEYS = [
  "directions",
  "checkin",
  "electricity",
  "kitchen",
  "wifi",
  "grounds",
  "trash",
  "emergency",
] as const;

export type GuideSectionKey = (typeof GUIDE_SECTION_KEYS)[number];

export const GUIDE_SECTION_ICONS: Record<GuideSectionKey, string> = {
  directions: "fluent:vehicle-car-24-regular",
  checkin: "fluent:key-24-regular",
  electricity: "fluent:flash-24-regular",
  kitchen: "fluent:food-24-regular",
  wifi: "fluent:wifi-1-24-regular",
  grounds: "fluent:plant-grass-24-regular",
  trash: "fluent:delete-24-regular",
  emergency: "fluent:call-24-regular",
};

export const GALLERY_CATEGORIES = ["apartment", "garden", "view"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

const emptyLocalizedText = (): Record<string, string> =>
  Object.fromEntries(GUIDE_LOCALES.map((l) => [l, ""]));

const emptyLocalizedList = (): Record<string, string[]> =>
  Object.fromEntries(GUIDE_LOCALES.map((l) => [l, []]));

const emptyGuide = (): GuideData => ({
  gallery: { apartment: [], garden: [], view: [] },
  sections: Object.fromEntries(
    GUIDE_SECTION_KEYS.map((k) => [k, { text: emptyLocalizedText(), photos: [] }])
  ),
  checkoutItems: emptyLocalizedList(),
  updatedAt: null,
});

export const useGuide = () => {
  const { $db, $storage } = useNuxtApp();
  const guide = useState<GuideData>("guide", emptyGuide);

  const docRef = doc($db, "apartment", "guide");

  const fetchGuide = async () => {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const base = emptyGuide();
      guide.value = {
        gallery: {
          apartment: data.gallery?.apartment ?? base.gallery.apartment,
          garden: data.gallery?.garden ?? base.gallery.garden,
          view: data.gallery?.view ?? base.gallery.view,
        },
        sections: Object.fromEntries(
          GUIDE_SECTION_KEYS.map((k) => {
            const raw = data.sections?.[k]?.text;
            // Migration: string → { ru: text }
            const text =
              typeof raw === "string"
                ? { ...emptyLocalizedText(), ru: raw }
                : { ...emptyLocalizedText(), ...(raw ?? {}) };
            return [
              k,
              {
                text,
                photos: data.sections?.[k]?.photos ?? [],
              },
            ];
          })
        ),
        // Migration: string[] → { ru: items }
        checkoutItems: Array.isArray(data.checkoutItems)
          ? { ...emptyLocalizedList(), ru: data.checkoutItems }
          : { ...emptyLocalizedList(), ...(data.checkoutItems ?? {}) },
        updatedAt: data.updatedAt,
      };
    }
  };

  const ensureDoc = async () => {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, { ...emptyGuide(), updatedAt: serverTimestamp() });
    }
  };

  const saveSection = async (key: string, locale: GuideLocale, text: string) => {
    await ensureDoc();
    await updateDoc(docRef, {
      [`sections.${key}.text.${locale}`]: text,
      updatedAt: serverTimestamp(),
    });
    if (guide.value.sections[key]) {
      guide.value.sections[key].text[locale] = text;
    }
  };

  const saveCheckoutItems = async (locale: GuideLocale, items: string[]) => {
    await ensureDoc();
    await updateDoc(docRef, {
      [`checkoutItems.${locale}`]: items,
      updatedAt: serverTimestamp(),
    });
    guide.value.checkoutItems[locale] = items;
  };

  const getSectionText = (key: string, locale: string): string => {
    const texts = guide.value.sections[key]?.text;
    if (!texts) return "";
    return texts[locale] || texts.ru || "";
  };

  const getCheckoutItems = (locale: string): string[] => {
    const items = guide.value.checkoutItems;
    if (!items) return [];
    const list = items[locale];
    if (list && list.length) return list;
    return items.ru || [];
  };

  const uploadPhoto = async (
    path: string,
    file: File
  ): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const uuid = crypto.randomUUID();
    const fileRef = storageRef($storage, `${path}/${uuid}.${ext}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const deletePhoto = async (url: string) => {
    try {
      const fileRef = storageRef($storage, url);
      await deleteObject(fileRef);
    } catch (e: any) {
      if (e?.code !== "storage/object-not-found") throw e;
    }
  };

  const addGalleryPhoto = async (category: GalleryCategory, file: File) => {
    await ensureDoc();
    const url = await uploadPhoto(`guide/gallery/${category}`, file);
    await updateDoc(docRef, {
      [`gallery.${category}`]: arrayUnion(url),
      updatedAt: serverTimestamp(),
    });
    guide.value.gallery[category].push(url);
    return url;
  };

  const removeGalleryPhoto = async (category: GalleryCategory, url: string) => {
    await deletePhoto(url);
    await updateDoc(docRef, {
      [`gallery.${category}`]: arrayRemove(url),
      updatedAt: serverTimestamp(),
    });
    guide.value.gallery[category] = guide.value.gallery[category].filter(
      (u) => u !== url
    );
  };

  const addSectionPhoto = async (sectionKey: string, file: File) => {
    await ensureDoc();
    const url = await uploadPhoto(`guide/sections/${sectionKey}`, file);
    await updateDoc(docRef, {
      [`sections.${sectionKey}.photos`]: arrayUnion(url),
      updatedAt: serverTimestamp(),
    });
    if (guide.value.sections[sectionKey]) {
      guide.value.sections[sectionKey].photos.push(url);
    }
    return url;
  };

  const removeSectionPhoto = async (sectionKey: string, url: string) => {
    await deletePhoto(url);
    await updateDoc(docRef, {
      [`sections.${sectionKey}.photos`]: arrayRemove(url),
      updatedAt: serverTimestamp(),
    });
    if (guide.value.sections[sectionKey]) {
      guide.value.sections[sectionKey].photos =
        guide.value.sections[sectionKey].photos.filter((u) => u !== url);
    }
  };

  return {
    guide,
    fetchGuide,
    saveSection,
    saveCheckoutItems,
    getSectionText,
    getCheckoutItems,
    addGalleryPhoto,
    removeGalleryPhoto,
    addSectionPhoto,
    removeSectionPhoto,
  };
};

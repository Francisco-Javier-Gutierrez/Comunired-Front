import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PublicationData {
  text: string | null;
  image: string | null;
}

export interface PublicationStore extends PublicationData {
  setText: (text: string | null) => void;
  setImage: (image: string | null) => void;
  resetPublication: () => void;
}

export const usePublicationData = create<PublicationStore>()(
  persist(
    (set) => ({
      text: null,
      image: null,

      setText: (text: string | null) => set({ text }),
      setImage: (image: string | null) => set({ image }),

      resetPublication: () =>
        set({
          text: null,
          image: null,
        }),
    }),
    {
      name: "publication-store",
    }
  )
);

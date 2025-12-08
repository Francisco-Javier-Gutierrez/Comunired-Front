import { create } from "zustand";

export interface PublicationData {
  text: string | null;
  image: string | null;
}

export interface PublicationStore extends PublicationData {
  setText: (text: string | null) => void;
  setImage: (image: string | null) => void;
  resetPublication: () => void;
}

export const usePublicationData = create<PublicationStore>()((set) => ({
  text: null,
  image: null,

  setText: (text) => set({ text }),
  setImage: (image) => set({ image }),

  resetPublication: () =>
    set({
      text: null,
      image: null,
    }),
}));

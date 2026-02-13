import { create } from "zustand";

export interface PublicationData {
  text: string | null;
  image: string | null;
  video: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PublicationStore extends PublicationData {
  setText: (text: string | null) => void;
  setImage: (image: string | null) => void;
  setVideo: (video: string | null) => void;
  setLatitude: (lat: number | null) => void;
  setLongitude: (lng: number | null) => void;
  resetPublication: () => void;
}

export const usePublicationData = create<PublicationStore>()((set) => ({
  text: null,
  image: null,
  video: null,
  latitude: null,
  longitude: null,

  setText: (text) => set({ text }),
  setImage: (image) => set({ image }),
  setVideo: (video) => set({ video }),
  setLatitude: (latitude) => set({ latitude }),
  setLongitude: (longitude) => set({ longitude }),

  resetPublication: () =>
    set({
      text: null,
      image: null,
      video: null,
      latitude: null,
      longitude: null,
    }),
}));

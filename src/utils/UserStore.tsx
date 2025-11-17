import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserData {
  email: string | null;
  name: string | null;
  profilePictureUrl: string | null;
}

export interface UserStore extends UserData {
  setEmail: (email: string | null) => void;
  setName: (name: string | null) => void;
  setProfilePictureUrl: (url: string | null) => void;
  resetUser: () => void;
}

export const useUserData = create<UserStore>()(
  persist(
    (set) => ({
      email: null,
      name: "Francisco",
      profilePictureUrl: null,

      setEmail: (email) => set({ email }),
      setName: (name) => set({ name }),
      setProfilePictureUrl: (profilePictureUrl) => set({ profilePictureUrl }),

      resetUser: () =>
        set({
          email: null,
          name: null,
          profilePictureUrl: null,
        }),
    }),
    {
      name: "user-store",
    }
  )
);

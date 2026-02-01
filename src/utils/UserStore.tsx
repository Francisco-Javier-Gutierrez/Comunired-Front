import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserData {
  email: string | null;
  name: string | null;
  token: string | null;
  profilePictureUrl: string | null;
}

export interface UserStore extends UserData {
  setEmail: (email: string | null) => void;
  setName: (name: string | null) => void;
  setToken: (token: string | null) => void;
  setProfilePictureUrl: (url: string | null) => void;
  resetUser: () => void;
}

export const useUserData = create<UserStore>()(
  persist(
    (set) => ({
      email: null,
      name: null,
      profilePictureUrl: null,
      token: null,

      setEmail: (email) => set({ email }),
      setName: (name) => set({ name }),
      setToken: (token) => set({ token }),
      setProfilePictureUrl: (profilePictureUrl) => set({ profilePictureUrl }),

      resetUser: () =>
        set({
          email: null,
          name: null,
          profilePictureUrl: null,
          token: null
        }),
    }),
    {
      name: "user-store",
    }
  )
);

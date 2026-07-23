import { create } from 'zustand';

export interface NotificationState {
    hasUnreadNotifications: boolean;
    setHasUnreadNotifications: (value: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    hasUnreadNotifications: false,
    setHasUnreadNotifications: (value) => set({ hasUnreadNotifications: value })
}));

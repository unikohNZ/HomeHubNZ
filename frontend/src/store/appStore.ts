import { create } from "zustand";

interface AppState {
  isOffline: boolean;
  lastSyncAt: string | null;
  setOffline: (value: boolean) => void;
  markSynced: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOffline: false,
  lastSyncAt: null,
  setOffline: (value) => set({ isOffline: value }),
  markSynced: () => set({ isOffline: false, lastSyncAt: new Date().toISOString() }),
}));

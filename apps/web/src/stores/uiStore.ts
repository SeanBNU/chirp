import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  composeModalOpen: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setSoundEnabled: (enabled: boolean) => void;
  openComposeModal: () => void;
  closeComposeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      soundEnabled: true,
      composeModalOpen: false,

      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      openComposeModal: () => set({ composeModalOpen: true }),
      closeComposeModal: () => set({ composeModalOpen: false }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme, soundEnabled: state.soundEnabled }),
    }
  )
);

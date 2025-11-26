import { create } from "zustand";
import { UIState, Mood } from "@/types";

interface UIStore extends UIState {
  setSidebarOpen: (open: boolean) => void;
  setModalOpen: (open: boolean, modal?: string | null) => void;
  setFilters: (filters: Partial<UIState["filters"]>) => void;
  resetFilters: () => void;
}

const initialState: UIState = {
  sidebarOpen: false,
  modalOpen: false,
  currentModal: null,
  filters: {
    mood: null,
    tags: [],
    searchQuery: "",
  },
};

export const useUIStore = create<UIStore>((set) => ({
  ...initialState,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setModalOpen: (modalOpen, currentModal = null) =>
    set({ modalOpen, currentModal }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () =>
    set({
      filters: {
        mood: null,
        tags: [],
        searchQuery: "",
      },
    }),
}));


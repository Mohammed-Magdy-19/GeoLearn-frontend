/**
 * src/store/useUIStore.ts
 *
 * Global UI state that needs to be shared across components.
 * Keeps purely client-side concerns (modals, sidebars) out of
 * the server-state layer (TanStack Query).
 */

import { create } from "zustand";

interface UIState {
  /** Mobile sidebar open/closed on DashboardLayout */
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  /** Global loading overlay — shown during critical async operations */
  isGlobalLoading: boolean;
  setGlobalLoading: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  isGlobalLoading: false,
  setGlobalLoading: (value) => set({ isGlobalLoading: value }),
}));

/**
 * src/store/useDashboardStore.ts
 *
 * Zustand store for dashboard UI state management.
 * Handles table filters, pagination, dialogs, and sidebar navigation.
 */

import { create } from "zustand";
import type {
  UserFilters,
  ConfirmDialogState,
} from "../features/dashboard/types/dashboardTypes";

// ─────────────────────────────────────────────────────────────
// State Interface
// ─────────────────────────────────────────────────────────────

interface DashboardState {
  // ── User Management Filters ──
  userFilters: UserFilters;
  setUserFilters: (filters: Partial<UserFilters>) => void;
  resetUserFilters: () => void;

  // ── Course Search ──
  courseSearch: string;
  setCourseSearch: (search: string) => void;

  // ── Pagination ──
  usersPage: number;
  setUsersPage: (page: number) => void;
  coursesPage: number;
  setCoursesPage: (page: number) => void;

  // ── Confirm Dialog ──
  confirmDialog: ConfirmDialogState;
  openConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: "danger" | "warning" | "info"
  ) => void;
  closeConfirmDialog: () => void;

  // ── Selected IDs for editing ──
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;

  // ── Form Dialogs Visibility ──
  isCourseFormOpen: boolean;
  setCourseFormOpen: (open: boolean) => void;
  isModuleFormOpen: boolean;
  setModuleFormOpen: (open: boolean) => void;
  isLessonFormOpen: boolean;
  setLessonFormOpen: (open: boolean) => void;
}

// ─────────────────────────────────────────────────────────────
// Default Filter Values
// ─────────────────────────────────────────────────────────────

const defaultUserFilters: UserFilters = {
  search: "",
  role: "all",
  isActive: "all",
};

const defaultConfirmDialog: ConfirmDialogState = {
  isOpen: false,
  title: "",
  message: "",
  onConfirm: null,
  variant: "warning",
};

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>((set) => ({
  // User filters
  userFilters: { ...defaultUserFilters },
  setUserFilters: (filters) =>
    set((state) => ({
      userFilters: { ...state.userFilters, ...filters },
      // Reset to page 1 when filters change
      usersPage: filters.search !== undefined || filters.role !== undefined ? 1 : state.usersPage,
    })),
  resetUserFilters: () =>
    set({ userFilters: { ...defaultUserFilters }, usersPage: 1 }),

  // Course search
  courseSearch: "",
  setCourseSearch: (search) =>
    set((state) => ({ courseSearch: search, coursesPage: search ? 1 : state.coursesPage })),

  // Pagination
  usersPage: 1,
  setUsersPage: (page) => set({ usersPage: page }),
  coursesPage: 1,
  setCoursesPage: (page) => set({ coursesPage: page }),

  // Confirm dialog
  confirmDialog: { ...defaultConfirmDialog },
  openConfirmDialog: (title, message, onConfirm, variant = "warning") =>
    set({
      confirmDialog: { isOpen: true, title, message, onConfirm, variant },
    }),
  closeConfirmDialog: () =>
    set({ confirmDialog: { ...defaultConfirmDialog } }),

  // Selected IDs
  selectedCourseId: null,
  setSelectedCourseId: (id) => set({ selectedCourseId: id }),
  selectedModuleId: null,
  setSelectedModuleId: (id) => set({ selectedModuleId: id }),

  // Form dialogs
  isCourseFormOpen: false,
  setCourseFormOpen: (open) => set({ isCourseFormOpen: open }),
  isModuleFormOpen: false,
  setModuleFormOpen: (open) => set({ isModuleFormOpen: open }),
  isLessonFormOpen: false,
  setLessonFormOpen: (open) => set({ isLessonFormOpen: open }),
}));

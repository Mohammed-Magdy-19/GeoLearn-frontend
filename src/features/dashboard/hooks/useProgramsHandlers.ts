/**
 * src/features/dashboard/hooks/useProgramsHandlers.ts
 */
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardStore } from "../../../store/useDashboardStore";
import { useCreateProgram, useUpdateProgram, useDeleteProgram } from "./useProgramsMutations";
import type { AdminProgramEntry, ProgramPayload } from "../types/programTypes";

export const useProgramsHandlers = () => {
  const { t } = useTranslation();
  const { openConfirmDialog } = useDashboardStore();
  const create = useCreateProgram();
  const update = useUpdateProgram();
  const del = useDeleteProgram();

  const [editingEntry, setEditingEntry] = useState<AdminProgramEntry | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const handleOpenCreate = useCallback(() => { setEditingEntry(null); setFormOpen(true); }, []);
  const handleOpenEdit = useCallback((e: AdminProgramEntry) => { setEditingEntry(e); setFormOpen(true); }, []);
  const handleCloseForm = useCallback(() => { setFormOpen(false); setEditingEntry(null); }, []);

  const handleSave = useCallback(
    (payload: ProgramPayload) => {
      if (editingEntry) {
        update.mutate({ id: editingEntry.id, payload }, { onSuccess: () => handleCloseForm() });
      } else {
        create.mutate(payload, { onSuccess: () => handleCloseForm() });
      }
    },
    [editingEntry, create, update, handleCloseForm]
  );

  const handleDelete = useCallback(
    (entry: AdminProgramEntry) => {
      openConfirmDialog(
        t('dashboard.deleteProgramTitle'),
        t('dashboard.deleteProgramMsg', { title: entry.title }),
        () => del.mutate(entry.id),
        "danger"
      );
    },
    [openConfirmDialog, del]
  );

  return {
    editingEntry, isFormOpen,
    handleOpenCreate, handleOpenEdit, handleCloseForm,
    handleSave, handleDelete,
    isMutating: create.isPending || update.isPending || del.isPending,
  };
};

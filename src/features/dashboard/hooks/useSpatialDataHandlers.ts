/**
 * src/features/dashboard/hooks/useSpatialDataHandlers.ts
 */
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardStore } from "../../../store/useDashboardStore";
import { useCreateSpatialData, useUpdateSpatialData, useDeleteSpatialData } from "./useSpatialDataMutations";
import type { AdminSpatialDataEntry, SpatialDataPayload } from "../types/spatialDataTypes";

export const useSpatialDataHandlers = () => {
  const { t } = useTranslation();
  const { openConfirmDialog } = useDashboardStore();
  const create = useCreateSpatialData();
  const update = useUpdateSpatialData();
  const del = useDeleteSpatialData();

  const [editingEntry, setEditingEntry] = useState<AdminSpatialDataEntry | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const handleOpenCreate = useCallback(() => { setEditingEntry(null); setFormOpen(true); }, []);
  const handleOpenEdit = useCallback((e: AdminSpatialDataEntry) => { setEditingEntry(e); setFormOpen(true); }, []);
  const handleCloseForm = useCallback(() => { setFormOpen(false); setEditingEntry(null); }, []);

  const handleSave = useCallback(
    (payload: SpatialDataPayload) => {
      if (editingEntry) {
        update.mutate({ id: editingEntry.id, payload }, { onSuccess: () => handleCloseForm() });
      } else {
        create.mutate(payload, { onSuccess: () => handleCloseForm() });
      }
    },
    [editingEntry, create, update, handleCloseForm]
  );

  const handleDelete = useCallback(
    (entry: AdminSpatialDataEntry) => {
      openConfirmDialog(
        t('dashboard.deleteSpatialDataTitle'),
        t('dashboard.deleteSpatialDataMsg', { title: entry.title }),
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

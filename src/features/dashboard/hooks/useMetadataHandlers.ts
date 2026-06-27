/**
 * src/features/dashboard/hooks/useMetadataHandlers.ts
 */
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardStore } from "../../../store/useDashboardStore";
import { useCreateMetadata, useUpdateMetadata, useDeleteMetadata } from "./useMetadataMutations";
import type { AdminMetadataEntry, MetadataPayload } from "../types/metadataTypes";

export const useMetadataHandlers = () => {
  const { t } = useTranslation();
  const { openConfirmDialog } = useDashboardStore();
  const create = useCreateMetadata();
  const update = useUpdateMetadata();
  const del = useDeleteMetadata();

  const [editingEntry, setEditingEntry] = useState<AdminMetadataEntry | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const handleOpenCreate = useCallback(() => { setEditingEntry(null); setFormOpen(true); }, []);
  const handleOpenEdit = useCallback((e: AdminMetadataEntry) => { setEditingEntry(e); setFormOpen(true); }, []);
  const handleCloseForm = useCallback(() => { setFormOpen(false); setEditingEntry(null); }, []);

  const handleSave = useCallback(
    (payload: MetadataPayload) => {
      if (editingEntry) {
        update.mutate({ id: editingEntry.id, payload }, { onSuccess: () => handleCloseForm() });
      } else {
        create.mutate(payload, { onSuccess: () => handleCloseForm() });
      }
    },
    [editingEntry, create, update, handleCloseForm]
  );

  const handleDelete = useCallback(
    (entry: AdminMetadataEntry) => {
      openConfirmDialog(
        t('dashboard.deleteMetadataTitle'),
        t('dashboard.deleteMetadataMsg', { title: entry.title }),
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

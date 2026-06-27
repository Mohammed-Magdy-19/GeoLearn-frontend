/**
 * src/features/dashboard/hooks/useSummariesHandlers.ts
 *
 * Orchestration hook for summaries CRUD with confirm dialogs.
 * Mirrors the useCoursesHandlers pattern (SRP, DIP).
 */

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardStore } from "../../../store/useDashboardStore";
import {
  useCreateSummary,
  useUpdateSummary,
  useDeleteSummary,
} from "./useSummariesMutations";
import type { AdminSummary, SummaryPayload } from "../types/summaryTypes";

export const useSummariesHandlers = () => {
  const { t } = useTranslation();
  const { openConfirmDialog } = useDashboardStore();

  const createSummary = useCreateSummary();
  const updateSummary = useUpdateSummary();
  const deleteSummaryMutation = useDeleteSummary();

  const [editingSummary, setEditingSummary] = useState<AdminSummary | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const handleOpenCreate = useCallback(() => {
    setEditingSummary(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((summary: AdminSummary) => {
    setEditingSummary(summary);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingSummary(null);
  }, []);

  const handleSaveSummary = useCallback(
    (payload: SummaryPayload) => {
      if (editingSummary) {
        updateSummary.mutate(
          { summaryId: editingSummary.id, payload },
          { onSuccess: () => handleCloseForm() }
        );
      } else {
        createSummary.mutate(payload, {
          onSuccess: () => handleCloseForm(),
        });
      }
    },
    [editingSummary, createSummary, updateSummary, handleCloseForm]
  );

  const handleDeleteSummary = useCallback(
    (summary: AdminSummary) => {
      openConfirmDialog(
        t('dashboard.deleteSummaryTitle'),
        t('dashboard.deleteSummaryMsg', { title: summary.title }),
        () => deleteSummaryMutation.mutate(summary.id),
        "danger"
      );
    },
    [openConfirmDialog, deleteSummaryMutation]
  );

  return {
    editingSummary,
    isFormOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSaveSummary,
    handleDeleteSummary,
    isMutating:
      createSummary.isPending ||
      updateSummary.isPending ||
      deleteSummaryMutation.isPending,
  };
};

export default useSummariesHandlers;

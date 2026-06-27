/**
 * src/features/dashboard/hooks/useSummariesMutations.ts
 *
 * TanStack Query mutation hooks for summaries CRUD.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import {
  createSummary,
  updateSummary,
  deleteSummary,
} from "../api/summariesApi";
import { summaryKeys } from "./useSummariesQuery";
import type { SummaryPayload } from "../types/summaryTypes";

const summariesListKey = summaryKeys.all;

export const useCreateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SummaryPayload) => createSummary(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: summariesListKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.summaryCreated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.summaryCreateFailed"));
    },
  });
};

export const useUpdateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      summaryId,
      payload,
    }: {
      summaryId: string;
      payload: Partial<SummaryPayload>;
    }) => updateSummary(summaryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: summariesListKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.summaryUpdated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.summaryUpdateFailed"));
    },
  });
};

export const useDeleteSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (summaryId: string) => deleteSummary(summaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: summariesListKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.summaryDeleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.summaryDeleteFailed"));
    },
  });
};

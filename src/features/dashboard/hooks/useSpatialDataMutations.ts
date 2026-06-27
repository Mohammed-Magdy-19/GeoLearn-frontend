/**
 * src/features/dashboard/hooks/useSpatialDataMutations.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { createSpatialData, updateSpatialData, deleteSpatialData } from "../api/spatialDataApi";
import { spatialDataKeys } from "./useSpatialDataQuery";
import type { SpatialDataPayload } from "../types/spatialDataTypes";

export const useCreateSpatialData = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SpatialDataPayload) => createSpatialData(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: spatialDataKeys.all });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.spatialDataCreated"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.spatialDataCreateFailed")),
  });
};

export const useUpdateSpatialData = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SpatialDataPayload> }) =>
      updateSpatialData(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: spatialDataKeys.all });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.spatialDataUpdated"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.spatialDataUpdateFailed")),
  });
};

export const useDeleteSpatialData = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSpatialData(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: spatialDataKeys.all });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.spatialDataDeleted"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.spatialDataDeleteFailed")),
  });
};

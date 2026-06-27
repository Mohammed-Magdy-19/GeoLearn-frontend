/**
 * src/features/dashboard/hooks/useMetadataMutations.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { createMetadata, updateMetadata, deleteMetadata } from "../api/metadataApi";
import { metadataKeys } from "./useMetadataQuery";
import type { MetadataPayload } from "../types/metadataTypes";

export const useCreateMetadata = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MetadataPayload) => createMetadata(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: metadataKeys.all });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.metadataCreated"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.metadataCreateFailed")),
  });
};

export const useUpdateMetadata = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MetadataPayload> }) =>
      updateMetadata(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: metadataKeys.all });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.metadataUpdated"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.metadataUpdateFailed")),
  });
};

export const useDeleteMetadata = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMetadata(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: metadataKeys.all });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.metadataDeleted"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.metadataDeleteFailed")),
  });
};

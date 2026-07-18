/**
 * src/features/dashboard/hooks/useProgramsMutations.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { createProgram, updateProgram, deleteProgram } from "../api/programsApi";
import { programKeys } from "./useProgramsQuery";
import type { ProgramPayload } from "../types/programTypes";

export const useCreateProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProgramPayload) => createProgram(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programKeys.all });
      qc.invalidateQueries({ queryKey: ["public-programs"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.programCreated"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.programCreateFailed")),
  });
};

export const useUpdateProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProgramPayload> }) =>
      updateProgram(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programKeys.all });
      qc.invalidateQueries({ queryKey: ["public-programs"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.programUpdated"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.programUpdateFailed")),
  });
};

export const useDeleteProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProgram(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programKeys.all });
      qc.invalidateQueries({ queryKey: ["public-programs"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(i18n.t("toasts.programDeleted"));
    },
    onError: (e: Error) => toast.error(e.message || i18n.t("toasts.programDeleteFailed")),
  });
};

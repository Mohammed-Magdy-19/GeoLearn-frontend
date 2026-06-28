import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminModule, ModulePayload } from "../../types/dashboardTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ModuleFormModalProps {
  isOpen: boolean;
  courseId: string;
  onClose: () => void;
  onSubmit: (data: ModulePayload) => void;
  initialData?: AdminModule | null;
  isSubmitting?: boolean;
}

const ModuleFormModal: React.FC<ModuleFormModalProps> = ({
  isOpen,
  courseId,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setOrderIndex(initialData.order_index ?? 0);
    } else {
      setTitle("");
      setDescription("");
      setOrderIndex(0);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ course: courseId, title, description, order_index: orderIndex });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground font-display">
            {initialData ? t('dashboard.editModule') : t('dashboard.addNewModule')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="module-title">{t('dashboard.moduleTitle')} *</Label>
            <Input
              id="module-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="module-description">{t('dashboard.descriptionLabel')}</Label>
            <Textarea
              id="module-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium shadow-brand disabled:opacity-60 disabled:cursor-not-allowed gap-2"
            >
              {isSubmitting && (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {initialData ? t('dashboard.saveChanges') : t('dashboard.addModule')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleFormModal;

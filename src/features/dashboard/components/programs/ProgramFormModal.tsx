/**
 * src/features/dashboard/components/programs/ProgramFormModal.tsx
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { AdminProgramEntry, ProgramPayload } from "../../types/programTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ProgramPayload) => void;
  initialData: AdminProgramEntry | null;
  isSubmitting?: boolean;
}

const ProgramFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData, isSubmitting = false }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setSource(initialData.source);
        setSourceUrl(initialData.source_url);
        setIsPublished(initialData.is_published);
      } else {
        setTitle(""); setDescription("");
        setSource(""); setSourceUrl(""); setIsPublished(true);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProgramPayload = {
      title,
      description,
      source,
      source_url: sourceUrl,
      is_published: isPublished,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {initialData ? t('dashboard.editProgram') : t('dashboard.addNewProgram')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prog-title">{t('dashboard.programTitleLabel')} *</Label>
            <Input id="prog-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('dashboard.programTitlePlaceholder')} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-desc">{t('dashboard.descriptionLabel')}</Label>
            <Textarea id="prog-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('dashboard.detailedDescription')} className="min-h-[100px] resize-y" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-source">{t('dashboard.sourceLabel')}</Label>
            <Input id="prog-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder={t('dashboard.sourcePlaceholder')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-source-url" className="flex items-center gap-1.5"><ExternalLink className="size-3.5" />{t('dashboard.goToSource')}</Label>
            <Input id="prog-source-url" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder={`https://example.com (${t('common.optional')})`} dir="ltr" className="text-left" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="prog-published" className="cursor-pointer">{t('dashboard.publishedVisible')}</Label>
            <Switch id="prog-published" checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed gap-2"
            >
              {isSubmitting && (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {initialData ? t('dashboard.update') : t('dashboard.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramFormModal;

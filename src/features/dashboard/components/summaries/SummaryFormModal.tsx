/**
 * src/features/dashboard/components/summaries/SummaryFormModal.tsx
 *
 * Modal form for creating/editing summaries with file upload.
 * Uses shadcn/ui Dialog, Input, Label, Switch, Textarea, and Button.
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileText, FolderOpen, ExternalLink } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import type { AdminSummary, SummaryPayload } from "../../types/summaryTypes";

interface SummaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SummaryPayload) => void;
  initialData: AdminSummary | null;
  isSubmitting?: boolean;
}

const SummaryFormModal: React.FC<SummaryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [subject, setSubject] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setSource(initialData.source);
        setSourceUrl(initialData.source_url);
        setSubject(initialData.subject);
        setIsPublished(initialData.is_published);
        setSelectedFile(null);
      } else {
        setTitle("");
        setDescription("");
        setSource("");
        setSourceUrl("");
        setSubject("");
        setIsPublished(true);
        setSelectedFile(null);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SummaryPayload = {
      title,
      description,
      source,
      source_url: sourceUrl,
      subject,
      is_published: isPublished,
    };
    if (selectedFile) {
      payload.file = selectedFile;
    }
    onSubmit(payload);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {initialData ? t('dashboard.editSummary') : t('dashboard.addNewSummary')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="summary-title">{t('dashboard.titleLabel')} *</Label>
            <Input
              id="summary-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('dashboard.summaryTitlePlaceholder')}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="summary-desc">{t('dashboard.descriptionLabel')}</Label>
            <Textarea
              id="summary-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('dashboard.optionalDescription')}
              className="min-h-[80px] resize-y"
            />
          </div>

          {/* Source (المصدر) */}
          <div className="space-y-1.5">
            <Label htmlFor="summary-source">{t('dashboard.sourceLabel')}</Label>
            <Input
              id="summary-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={t('dashboard.sourcePlaceholder')}
            />
          </div>

          {/* Source URL (الذهاب إلي المصدر) */}
          <div className="space-y-1.5">
            <Label htmlFor="summary-source-url" className="flex items-center gap-1.5">
              <ExternalLink className="size-3.5" />
              {t('dashboard.goToSource')}
            </Label>
            <Input
              id="summary-source-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder={`https://example.com (${t('common.optional')})`}
              dir="ltr"
              className="text-left"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="summary-subject">{t('dashboard.subjectLabel')}</Label>
            <Input
              id="summary-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('dashboard.subjectPlaceholder')}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label>
              {t('dashboard.fileLabel')} {!initialData && "*"}
            </Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${dragOver
                  ? "border-brand-primary bg-brand-primary/5"
                  : "border-border hover:border-brand-primary/50 hover:bg-accent/30"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    <FileText className="size-4 inline" /> {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : initialData?.file_name ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.currentFile')}: <span className="font-medium text-foreground">{initialData.file_name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.dragNewFileToReplace')}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <FolderOpen className="size-6 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.dragFileOrClick')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, Word, PowerPoint, Excel, ZIP, {t('dashboard.images')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="summary-published" className="cursor-pointer">
              {t('dashboard.publishedVisible')}
            </Label>
            <Switch
              id="summary-published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed gap-2"
              disabled={isSubmitting || !title || (!initialData && !selectedFile)}
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

export default SummaryFormModal;

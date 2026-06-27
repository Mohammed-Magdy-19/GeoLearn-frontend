/**
 * src/features/dashboard/components/metadata/MetadataFormModal.tsx
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FolderOpen, FileText, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { AdminMetadataEntry, MetadataPayload } from "../../types/metadataTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: MetadataPayload) => void;
  initialData: AdminMetadataEntry | null;
}

const MetadataFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setCategory(initialData.category);
        setSource(initialData.source);
        setSourceUrl(initialData.source_url);
        setIsPublished(initialData.is_published);
        setSelectedFile(null);
      } else {
        setTitle(""); setDescription(""); setCategory("");
        setSource(""); setSourceUrl(""); setIsPublished(true);
        setSelectedFile(null);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MetadataPayload = {
      title, description, category, source,
      source_url: sourceUrl, is_published: isPublished,
    };
    if (selectedFile) payload.file = selectedFile;
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {initialData ? t('dashboard.editMetadata') : t('dashboard.addNewMetadata')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="meta-title">{t('dashboard.titleLabel')} *</Label>
            <Input id="meta-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('dashboard.metaTitlePlaceholder')} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta-desc">{t('dashboard.descriptionLabel')}</Label>
            <Textarea id="meta-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('dashboard.detailedDescription')} className="min-h-[80px] resize-y" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta-category">{t('dashboard.categoryLabel')}</Label>
            <Input id="meta-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t('dashboard.categoryPlaceholder')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta-source">{t('dashboard.sourceLabel')}</Label>
            <Input id="meta-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder={t('dashboard.sourcePlaceholder')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta-source-url" className="flex items-center gap-1.5"><ExternalLink className="size-3.5" />{t('dashboard.goToSource')}</Label>
            <Input id="meta-source-url" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder={`https://example.com (${t('common.optional')})`} dir="ltr" className="text-left" />
          </div>
          {/* File Upload */}
          <div className="space-y-1.5">
            <Label>{t('dashboard.fileOptional')}</Label>
            <div
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setSelectedFile(f); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver ? "border-brand-primary bg-brand-primary/5" : "border-border hover:border-brand-primary/50 hover:bg-accent/30"}`}
            >
              <input ref={fileInputRef} type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} className="hidden" />
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground"><FileText className="size-4 inline" /> {selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : initialData?.file_name ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('dashboard.currentFile')}: <span className="font-medium text-foreground">{initialData.file_name}</span></p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.dragNewFileToReplace')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <FolderOpen className="size-6 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t('dashboard.dragFileOrClick')}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="meta-published" className="cursor-pointer">{t('dashboard.publishedVisible')}</Label>
            <Switch id="meta-published" checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold" disabled={!title}>{initialData ? t('dashboard.update') : t('dashboard.create')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MetadataFormModal;

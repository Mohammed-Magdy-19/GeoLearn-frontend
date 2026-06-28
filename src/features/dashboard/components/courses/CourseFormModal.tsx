import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminCourse, CoursePayload } from "../../types/dashboardTypes";
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

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CoursePayload) => void;
  initialData?: AdminCourse | null;
  isSubmitting?: boolean;
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CoursePayload>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    price_egp: initialData?.price_egp ?? 0,
    is_published: initialData?.is_published ?? false,
    thumbnail: null,
    cover_image: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title ?? "",
        slug: initialData.slug ?? "",
        description: initialData.description ?? "",
        price_egp: initialData.price_egp ?? 0,
        is_published: initialData.is_published ?? false,
        thumbnail: null,
        cover_image: null,
      });
    } else {
      setFormData({ title: "", slug: "", description: "", price_egp: 0, is_published: false, thumbnail: null, cover_image: null });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground font-display">
            {initialData ? t('dashboard.editCourse') : t('dashboard.addNewCourse')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="course-title">{t('dashboard.courseTitle')} *</Label>
            <Input
              id="course-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-slug">{t('dashboard.slugLabel')} *</Label>
            <Input
              id="course-slug"
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })}
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-description">{t('dashboard.descriptionLabel')}</Label>
            <Textarea
              id="course-description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="course-price">{t('dashboard.priceEGP')}</Label>
              <Input
                id="course-price"
                type="number"
                min={0}
                step={0.01}
                value={formData.price_egp}
                onChange={(e) => setFormData({ ...formData, price_egp: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="course-published"
                  dir="ltr"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="course-published" className="cursor-pointer">{t('dashboard.publishCourse')}</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="course-thumbnail">{t('dashboard.courseThumbnail')}</Label>
              <Input
                id="course-thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-cover">{t('dashboard.courseCoverImage')}</Label>
              <Input
                id="course-cover"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.files?.[0] || null })}
                className="text-xs"
              />
            </div>
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
              {initialData ? t('dashboard.saveChanges') : t('dashboard.createCourse')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormModal;

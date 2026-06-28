import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Video, X } from "lucide-react";
import type { AdminLesson, LessonPayload } from "../../types/dashboardTypes";
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

interface LessonFormModalProps {
  isOpen: boolean;
  moduleId: string;
  onClose: () => void;
  onSubmit: (data: LessonPayload) => void;
  initialData?: AdminLesson | null;
  isSubmitting?: boolean;
}

const LessonFormModal: React.FC<LessonFormModalProps> = ({
  isOpen,
  moduleId,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isReadingDuration, setIsReadingDuration] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setOrderIndex(initialData.order_index ?? 0);
      setIsFreePreview(initialData.is_free_preview ?? false);
      setLessonFile(null);
      setVideoFile(null);

      const totalSecs = initialData.duration_seconds ?? 0;
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      setDurationHours(hrs);
      setDurationMinutes(mins);
      setDurationSeconds(secs);
    } else {
      setTitle("");
      setDescription("");
      setOrderIndex(0);
      setDurationHours(0);
      setDurationMinutes(0);
      setDurationSeconds(0);
      setIsFreePreview(false);
      setLessonFile(null);
      setVideoFile(null);
    }
  }, [initialData, isOpen]);

  /**
   * Read the real duration from a video file using the browser's
   * HTMLVideoElement API, then auto-fill the duration fields.
   */
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
    setIsReadingDuration(true);

    // Create a temporary video element to read the duration
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";

    const objectUrl = URL.createObjectURL(file);
    videoEl.src = objectUrl;

    videoEl.onloadedmetadata = () => {
      const totalSecs = Math.round(videoEl.duration);
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      setDurationHours(hrs);
      setDurationMinutes(mins);
      setDurationSeconds(secs);
      setIsReadingDuration(false);

      URL.revokeObjectURL(objectUrl);
    };

    videoEl.onerror = () => {
      // If we can't read duration, leave fields as-is
      setIsReadingDuration(false);
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      module: moduleId,
      title,
      description,
      order_index: orderIndex,
      duration_seconds: durationHours * 3600 + durationMinutes * 60 + durationSeconds,
      is_free_preview: isFreePreview,
      video_file: videoFile,
      lesson_file: lessonFile,
    });
  };

  const handleClose = () => {
    setLessonFile(null);
    setVideoFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md overflow-x-hidden overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground font-display">
            {initialData ? t('dashboard.editLesson') : t('dashboard.addNewLesson')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lesson-title">{t('dashboard.lessonTitle')} *</Label>
            <Input
              id="lesson-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lesson-description">{t('dashboard.descriptionLabel')}</Label>
            <Textarea
              id="lesson-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* ── Video file picker ──────────────────────────────── */}
          <div className="space-y-1.5">
            <Label>{t('dashboard.lessonVideo')}</Label>
            {videoFile ? (
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-background border border-brand-primary/30 rounded-lg min-w-0">
                <Video className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span className="text-xs text-foreground break-all flex-1 min-w-0" title={videoFile.name}>{videoFile.name}</span>
                {isReadingDuration && (
                  <span className="text-[10px] text-brand-primary animate-pulse">{t('dashboard.readingDuration')}</span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleRemoveVideo}
                  className="text-red-400 hover:text-red-300 flex-shrink-0"
                  title={t('dashboard.removeVideo')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Input
                ref={videoInputRef}
                type="file"
                dir="ltr"
                accept="video/mp4,video/webm,video/x-matroska,.mp4,.webm,.mkv"
                onChange={handleVideoFileChange}
              />
            )}
            {initialData?.has_video && !videoFile && (
              <p className="mt-1 text-[10px] text-muted-foreground">{t('dashboard.existingVideoHint')}</p>
            )}
          </div>

          {/* ── Duration + Free preview row ───────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                {t('dashboard.lessonDuration')} *
                {isReadingDuration && (
                  <span className="text-[10px] text-brand-primary animate-pulse mr-1">({t('dashboard.autoDetecting')})</span>
                )}
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <Label className="block text-[10px] text-muted-foreground mb-1 text-center">{t('dashboard.hours')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                    className="text-xs text-center px-1.5 py-1"
                  />
                </div>
                <div>
                  <Label className="block text-[10px] text-muted-foreground mb-1 text-center">{t('dashboard.minutes')}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                    className="text-xs text-center px-1.5 py-1"
                  />
                </div>
                <div>
                  <Label className="block text-[10px] text-muted-foreground mb-1 text-center">{t('dashboard.seconds')}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                    className="text-xs text-center px-1.5 py-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end pb-1.5">
              <div className="flex items-center gap-2">
                <Switch
                  id="lesson-free-preview"
                  dir="ltr"
                  checked={isFreePreview}
                  onCheckedChange={setIsFreePreview}
                />
                <Label htmlFor="lesson-free-preview" className="cursor-pointer">{t('courses.freePreview')}</Label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lesson-file">{t('dashboard.lessonFileLabel')}</Label>
            <Input
              id="lesson-file"
              type="file"
              dir="ltr"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              onChange={(e) => setLessonFile(e.target.files?.[0] || null)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting || isReadingDuration}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isReadingDuration || isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium shadow-brand disabled:opacity-50 disabled:cursor-not-allowed gap-2"
            >
              {isSubmitting && (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {initialData ? t('dashboard.saveChanges') : t('dashboard.addLesson')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonFormModal;

import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminModule, AdminLesson } from "../../types/dashboardTypes";
import LessonItem from "./LessonItem";

const ModuleItem: React.FC<{
  module: AdminModule;
  onAddLesson: (moduleId: string) => void;
  onEditModule: (module: AdminModule) => void;
  onDeleteModule: (moduleId: string) => void;
  onEditLesson: (lesson: AdminLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDeleteVideo?: (secureVideoId: string) => void;
}> = ({ module, onAddLesson, onEditModule, onDeleteModule, onEditLesson, onDeleteLesson, onDeleteVideo }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <span className={`transform transition-transform text-muted-foreground ${isOpen ? "rotate-180" : ""}`}>▼</span>
          <div>
            <h4 className="font-semibold text-sm text-foreground">{module.title}</h4>
            <p className="text-xs text-muted-foreground">{t('common.lessons_other', { count: module.lessons?.length ?? 0 })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onAddLesson(module.id); }} className="p-1.5 text-xs text-primary hover:bg-primary/10 rounded-md transition-colors">+ {t('dashboard.addLesson')}</button>
          <button onClick={(e) => { e.stopPropagation(); onEditModule(module); }} className="p-1.5 text-xs text-primary hover:bg-primary/10 rounded-md transition-colors" title={t('dashboard.editModule')}><Pencil className="size-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDeleteModule(module.id); }} className="p-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors"><Trash2 className="size-3.5" /></button>
        </div>
      </button>

      {isOpen && (
        <div className="divide-y divide-border">
          {module.lessons?.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">{t('dashboard.noLessonsInModule')}</div>
          )}
          {module.lessons?.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} onEdit={onEditLesson} onDelete={onDeleteLesson} onDeleteVideo={onDeleteVideo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleItem;

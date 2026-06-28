/**
 * src/features/dashboard/pages/SpatialDataManagementPage.tsx
 */
import { useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminSpatialData } from "../hooks/useSpatialDataQuery";
import { useSpatialDataHandlers } from "../hooks/useSpatialDataHandlers";
import SpatialDataFormModal from "../components/spatial-data/SpatialDataFormModal";
import type { AdminSpatialDataEntry } from "../types/spatialDataTypes";

export const SpatialDataManagementPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminSpatialData(page, search);
  const { editingEntry, isFormOpen, handleOpenCreate, handleOpenEdit, handleCloseForm, handleSave, handleDelete, isMutating } = useSpatialDataHandlers();

  const entries = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.manageSpatialData")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboard.manageSpatialDataSubtitle", { count: totalCount })}</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          {t("dashboard.addSpatialData")}
        </Button>
      </div>

      <Input placeholder={t("dashboard.searchSpatialData")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <MapPin className="size-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t("dashboard.noSpatialDataYet")}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t("dashboard.addFirstSpatialData")}</p>
          <Button onClick={handleOpenCreate} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold">{t("dashboard.addFirstSpatialDataButton")}</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <SpatialCard key={entry.id} entry={entry} onEdit={handleOpenEdit} onDelete={handleDelete} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t("common.previous")}</Button>
              <span className="text-sm text-muted-foreground px-3">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>{t("common.next")}</Button>
            </div>
          )}
        </>
      )}
      <SpatialDataFormModal isOpen={isFormOpen} onClose={handleCloseForm} onSubmit={handleSave} initialData={editingEntry} isSubmitting={isMutating} />
    </div>
  );
};

function SpatialCard({ entry, onEdit, onDelete }: { entry: AdminSpatialDataEntry; onEdit: (e: AdminSpatialDataEntry) => void; onDelete: (e: AdminSpatialDataEntry) => void }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-brand-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground truncate text-sm flex-1">{entry.title}</h3>
        <span className="shrink-0 text-xs bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full">{entry.data_type_display}</span>
      </div>
      {entry.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{entry.description}</p>}
      
      {/* Coordinates */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg px-2.5 py-1.5">
        <MapPin className="size-3.5 shrink-0 text-brand-primary" />
        <span dir="ltr" className="font-mono">{entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}</span>
        {entry.category && <><span className="text-border">•</span><span>{entry.category}</span></>}
      </div>

      {entry.source && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-brand-primary/5 rounded-lg px-2.5 py-1.5 border border-brand-primary/10">
          <span className="truncate flex-1 font-medium text-foreground">{entry.source}</span>
          {entry.source_url && (
            <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-brand-primary" onClick={(e) => e.stopPropagation()}>
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className={`flex items-center gap-1 ${entry.is_published ? "text-brand-accent" : "text-brand-primary"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${entry.is_published ? "bg-brand-accent" : "bg-brand-primary"}`} />
          {entry.is_published ? t("common.published") : t("common.draft")}
        </span>
        {entry.file_name && <span>{entry.file_name} ({entry.file_size_display})</span>}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1" />
        <button onClick={() => onEdit(entry)} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent/50">{t("common.edit")}</button>
        <button onClick={() => onDelete(entry)} className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10">{t("common.delete")}</button>
      </div>
    </div>
  );
}

export default SpatialDataManagementPage;

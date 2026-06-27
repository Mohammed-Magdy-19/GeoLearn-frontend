/**
 * src/features/dashboard/pages/SummariesManagementPage.tsx
 *
 * Admin dashboard page for CRUD operations on summaries.
 * Follows the same patterns as CoursesManagementPage.
 */

import { useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminSummaries } from "../hooks/useSummariesQuery";
import { useSummariesHandlers } from "../hooks/useSummariesHandlers";
import SummaryFormModal from "../components/summaries/SummaryFormModal";
import type { AdminSummary } from "../types/summaryTypes";

export const SummariesManagementPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminSummaries(page, search);

  const {
    editingSummary,
    isFormOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSaveSummary,
    handleDeleteSummary,
  } = useSummariesHandlers();

  const summaries = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.manageSummaries")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.manageSummariesSubtitle", { count: totalCount })}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          {t("dashboard.addSummary")}
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={t("dashboard.searchSummaries")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : summaries.length === 0 ? (
        <EmptyState onCreateClick={handleOpenCreate} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.map((summary) => (
              <SummaryCard
                key={summary.id}
                summary={summary}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteSummary}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("common.previous")}
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <SummaryFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveSummary}
        initialData={editingSummary}
      />
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-16 border border-dashed border-border rounded-xl">
      <FileText className="size-10 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t("dashboard.noSummariesYet")}
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        {t("dashboard.addFirstSummary")}
      </p>
      <Button
        onClick={onCreateClick}
        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold"
      >
        {t("dashboard.addFirstSummaryButton")}
      </Button>
    </div>
  );
}

function SummaryCard({
  summary,
  onEdit,
  onDelete,
}: {
  summary: AdminSummary;
  onEdit: (s: AdminSummary) => void;
  onDelete: (s: AdminSummary) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-brand-primary/40 transition-colors group">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-sm">
            {summary.title}
          </h3>
          {summary.subject && (
            <p className="text-xs text-muted-foreground mt-0.5">{summary.subject}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {summary.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {summary.description}
        </p>
      )}

      {/* Source info */}
      {summary.source && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-brand-primary/5 rounded-lg px-2.5 py-1.5 border border-brand-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
          <span className="truncate flex-1 font-medium text-foreground">{summary.source}</span>
          {summary.source_url && (
            <a
              href={summary.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-brand-primary hover:text-brand-primary/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      )}

      {/* File info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg px-2.5 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
        <span className="truncate flex-1">{summary.file_name || "—"}</span>
        <span className="shrink-0">{summary.file_size_display}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
          {summary.download_count} {t("dashboard.downloads", { count: summary.download_count }).split(' ')[1] || 'downloads'}
        </span>
        <span
          className={`flex items-center gap-1 ${
            summary.is_published ? "text-brand-accent" : "text-brand-primary"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${summary.is_published ? "bg-brand-accent" : "bg-brand-primary"}`} />
          {summary.is_published ? t("common.published") : t("common.draft")}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {summary.file_url && (
          <a
            href={summary.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
            {t("common.preview")}
          </a>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onEdit(summary)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent/50"
        >
          {t("common.edit")}
        </button>
        <button
          onClick={() => onDelete(summary)}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10"
        >
          {t("common.delete")}
        </button>
      </div>
    </div>
  );
}

export default SummariesManagementPage;

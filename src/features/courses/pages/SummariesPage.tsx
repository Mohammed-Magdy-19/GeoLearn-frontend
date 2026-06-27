/**
 * src/features/courses/pages/SummariesPage.tsx
 *
 * Page displaying published course summaries.
 * Fetches real data from the API and displays in a clean grid.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import type { PublicSummary } from "@/features/dashboard/types/summaryTypes";
import { FileText, Download, ArrowRight, ExternalLink } from "lucide-react";

function useSummaries() {
  return useQuery<PublicSummary[]>({
    queryKey: ["public-summaries"],
    queryFn: async () => {
      const { data } = await api.get("/courses/summaries/");
      return data;
    },
  });
}

export default function SummariesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: summaries, isLoading } = useSummaries();

  return (
    <main className="container max-w-5xl mx-auto px-4 py-12 min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary/15 text-brand-primary mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">
          {t("summaries.title")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("summaries.subtitle")}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !summaries || summaries.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto border border-border/40 bg-card/40 backdrop-blur rounded-2xl shadow-md p-8">
          <div className="text-6xl mb-6 text-brand-primary flex justify-center">
            <FileText className="w-16 h-16 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3">
            {t("summaries.noSummariesAvailable")}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t("summaries.summariesComingSoon")}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="rounded-full px-6"
            >
              {t("common.backToHome")}
            </Button>
            <Button
              onClick={() => navigate("/courses")}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold px-6 rounded-full"
            >
              {t("summaries.browseCourses")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map((s) => (
            <SummaryFileCard key={s.id} summary={s} />
          ))}
        </div>
      )}

      {/* Back to home */}
      <div className="text-center mt-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="ml-2 w-4 h-4" />
          {t("common.backToHome")}
        </Button>
      </div>
    </main>
  );
}

function SummaryFileCard({ summary }: { summary: PublicSummary }) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  /** Optimistic local count — increments immediately on download success */
  const [localDownloadCount, setLocalDownloadCount] = useState(summary.download_count);

  const handleDownload = async () => {
    if (!summary.file_url || downloading) return;
    setDownloading(true);
    try {
      // Increment download counter on server
      await api.post(`/courses/summaries/${summary.id}/download/`);

      // Optimistically update the local count immediately
      setLocalDownloadCount((prev) => prev + 1);

      // Fetch the file with auth headers
      const response = await api.get(summary.file_url, {
        responseType: "blob",
        // Use absolute URL directly — bypass baseURL
        baseURL: "",
      });

      // Create a download link and trigger it
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = summary.file_name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(summary.file_url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-brand-primary/40 transition-all hover:shadow-lg group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
          <FileText className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm truncate">{summary.title}</h3>
          </div>

          {/* Description */}
          {summary.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{summary.description}</p>
          )}

          {/* Source info */}
          {summary.source && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
              <span className="font-medium text-foreground">{summary.source}</span>
              {summary.source_url && (
                <a
                  href={summary.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-brand-primary hover:text-brand-primary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{t("common.goToSource")}</span>
                </a>
              )}
            </div>
          )}

          {/* File info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span>{summary.file_size_display}</span>
            {summary.subject && (
              <>
                <span className="text-border">•</span>
                <span>{summary.subject}</span>
              </>
            )}
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {localDownloadCount}
            </span>
          </div>

          {/* Download button */}
          {summary.file_url && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${downloading ? "animate-bounce" : ""}`} />
              {downloading ? t("summaries.downloading") : t("summaries.downloadFile")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

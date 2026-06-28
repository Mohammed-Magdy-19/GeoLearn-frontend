/**
 * src/features/courses/pages/MetadataPage.tsx
 *
 * Public page displaying published metadata entries.
 */
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import type { PublicMetadataEntry } from "@/features/dashboard/types/metadataTypes";
import { ClipboardList, ExternalLink, Download, ArrowRight } from "lucide-react";
import { CardGridSkeleton } from "@/components/ui/Skeletons";

function usePublicMetadata() {
  return useQuery<PublicMetadataEntry[]>({
    queryKey: ["public-metadata"],
    queryFn: async () => {
      const { data } = await api.get("/courses/metadata/");
      return data;
    },
  });
}

export default function MetadataPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: entries, isLoading } = usePublicMetadata();

  return (
    <main className="container max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary/15 text-brand-primary mb-4">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">{t("metadata.title")}</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("metadata.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} columnsClass="grid grid-cols-1 md:grid-cols-2 gap-4" />
      ) : !entries || entries.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto border border-border/40 bg-card/40 backdrop-blur rounded-2xl shadow-md p-8">
          <ClipboardList className="w-16 h-16 mx-auto mb-6 text-brand-primary animate-bounce" />
          <h2 className="text-xl font-bold text-foreground mb-3">{t("metadata.noMetadataAvailable")}</h2>
          <p className="text-muted-foreground mb-6 text-sm">{t("metadata.metadataComingSoon")}</p>
          <Button onClick={() => navigate("/")} variant="outline" className="rounded-full px-6">{t("common.backToHome")}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <MetadataCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="ml-2 w-4 h-4" />{t("common.backToHome")}
        </Button>
      </div>
    </main>
  );
}

function MetadataCard({ entry }: { entry: PublicMetadataEntry }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-brand-primary/40 transition-all hover:shadow-lg group">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm truncate">{entry.title}</h3>
            {entry.category && <span className="shrink-0 text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">{entry.category}</span>}
          </div>
          {entry.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{entry.description}</p>}
          {entry.source && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{entry.source}</span>
              {entry.source_url && (
                <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-brand-primary hover:text-brand-primary/80 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="w-3 h-3" /><span>{t("common.goToSource")}</span>
                </a>
              )}
            </div>
          )}
          {entry.file_url && (
            <a href={entry.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 text-xs font-medium transition-colors">
              <Download className="w-3.5 h-3.5" />{t("common.downloadFile")} ({entry.file_size_display})
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

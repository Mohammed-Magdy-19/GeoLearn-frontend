/**
 * src/features/courses/pages/ProgramsPage.tsx
 *
 * Public page displaying published programs.
 */
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import type { PublicProgramEntry } from "@/features/dashboard/types/programTypes";
import { Award, ExternalLink, ArrowRight } from "lucide-react";
import { CardGridSkeleton } from "@/components/ui/Skeletons";

function usePublicPrograms() {
  return useQuery<PublicProgramEntry[]>({
    queryKey: ["public-programs"],
    queryFn: async () => {
      const { data } = await api.get("/courses/programs/");
      return data;
    },
  });
}

export default function ProgramsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: entries, isLoading } = usePublicPrograms();

  return (
    <main className="container max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary/15 text-brand-primary mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">{t("programs.title")}</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("programs.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} columnsClass="grid grid-cols-1 md:grid-cols-2 gap-4" />
      ) : !entries || entries.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto border border-border/40 bg-card/40 backdrop-blur rounded-2xl shadow-md p-8">
          <Award className="w-16 h-16 mx-auto mb-6 text-brand-primary animate-bounce" />
          <h2 className="text-xl font-bold text-foreground mb-3">{t("programs.noProgramsAvailable")}</h2>
          <p className="text-muted-foreground mb-6 text-sm">{t("programs.programsComingSoon")}</p>
          <Button onClick={() => navigate("/")} variant="outline" className="rounded-full px-6">{t("common.backToHome")}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <ProgramCard key={entry.id} entry={entry} />
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

function ProgramCard({ entry }: { entry: PublicProgramEntry }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-brand-primary/40 transition-all hover:shadow-lg group flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
          <Award className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm truncate">{entry.title}</h3>
          </div>
          {entry.description && <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{entry.description}</p>}
          {entry.source && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{entry.source}</span>
              {entry.source_url && (
                <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-brand-primary hover:text-brand-primary/80 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="w-3 h-3" /><span>{t("common.goToSource")}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

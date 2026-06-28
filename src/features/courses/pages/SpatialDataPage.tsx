/**
 * src/features/courses/pages/SpatialDataPage.tsx
 *
 * Public page displaying spatial data on an interactive Leaflet map.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import type { PublicSpatialDataEntry } from "@/features/dashboard/types/spatialDataTypes";
import { MapPin, ExternalLink, ArrowRight, Download, Layers } from "lucide-react";
import { MapPageSkeleton } from "@/components/ui/Skeletons";

// Fix Leaflet default icon issue in bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function usePublicSpatialData() {
  return useQuery<PublicSpatialDataEntry[]>({
    queryKey: ["public-spatial-data"],
    queryFn: async () => {
      const { data } = await api.get("/courses/spatial-data/");
      return data;
    },
  });
}

/** Auto-fit map bounds to markers */
function FitBounds({ entries }: { entries: PublicSpatialDataEntry[] }) {
  const map = useMap();
  useEffect(() => {
    if (entries.length > 0) {
      const bounds = L.latLngBounds(entries.map((e) => [e.latitude, e.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [entries, map]);
  return null;
}

export default function SpatialDataPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: entries, isLoading } = usePublicSpatialData();
  const [selectedEntry, setSelectedEntry] = useState<PublicSpatialDataEntry | null>(null);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary/15 text-brand-primary mb-3">
          <Layers className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-1">{t("spatialData.title")}</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("spatialData.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <MapPageSkeleton />
      ) : !entries || entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="py-16 text-center max-w-md border border-border/40 bg-card/40 backdrop-blur rounded-2xl shadow-md p-8">
            <MapPin className="w-16 h-16 mx-auto mb-6 text-brand-primary animate-bounce" />
            <h2 className="text-xl font-bold text-foreground mb-3">{t("spatialData.noSpatialDataAvailable")}</h2>
            <p className="text-muted-foreground mb-6 text-sm">{t("spatialData.spatialDataComingSoon")}</p>
            <Button onClick={() => navigate("/")} variant="outline" className="rounded-full px-6">{t("common.backToHome")}</Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Map */}
          <div className="flex-1 min-h-[400px] lg:min-h-0">
            <MapContainer
              center={[30.0444, 31.2357]}
              zoom={6}
              className="h-full w-full z-0"
              style={{ minHeight: "400px" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds entries={entries} />
              {entries.map((entry) => (
                <Marker
                  key={entry.id}
                  position={[entry.latitude, entry.longitude]}
                  eventHandlers={{
                    click: () => setSelectedEntry(entry),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-bold text-sm mb-1">{entry.title}</h3>
                      {entry.description && <p className="text-xs text-gray-600 mb-1">{entry.description}</p>}
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{entry.data_type_display}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Render GeoJSON layers */}
              {entries
                .filter((e) => e.geojson_data)
                .map((entry) => (
                  <GeoJSON
                    key={`geojson-${entry.id}`}
                    data={entry.geojson_data as GeoJSON.GeoJsonObject}
                    style={{ color: "#6366f1", weight: 2, fillOpacity: 0.15 }}
                    onEachFeature={(_, layer) => {
                      layer.on("click", () => setSelectedEntry(entry));
                    }}
                  />
                ))}
            </MapContainer>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-s border-border bg-card overflow-y-auto max-h-[350px] lg:max-h-none">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">{t("common.pointsOnMap", { count: entries.length })}</h2>
            </div>
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full p-3 hover:bg-accent/50 transition-colors ${
                    selectedEntry?.id === entry.id ? "bg-brand-primary/5 border-s-2 border-brand-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 shrink-0 mt-0.5 text-brand-primary" />
                    <div className="flex-1 min-w-0 text-start">
                      <h3 className="text-sm font-medium text-foreground truncate">{entry.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{entry.data_type_display}</span>
                        {entry.category && <span className="text-xs text-muted-foreground">• {entry.category}</span>}
                      </div>
                      {entry.source && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <span>{entry.source}</span>
                          {entry.source_url && (
                            <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="text-brand-primary" onClick={(e) => e.stopPropagation()}>
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      )}
                      {entry.file_url && (
                        <a
                          href={entry.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-xs text-brand-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="size-3" />
                          {entry.file_name}
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back to home */}
      <div className="bg-background border-t border-border px-4 py-3 text-center">
        <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="ml-2 w-4 h-4" />{t("common.backToHome")}
        </Button>
      </div>
    </main>
  );
}

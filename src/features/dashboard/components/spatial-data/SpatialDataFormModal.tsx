/**
 * src/features/dashboard/components/spatial-data/SpatialDataFormModal.tsx
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FolderOpen, FileText, ExternalLink, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminSpatialDataEntry, SpatialDataPayload } from "../../types/spatialDataTypes";

const DATA_TYPES = [
  { value: "point", labelKey: "dashboard.dataTypePoint" },
  { value: "line", labelKey: "dashboard.dataTypeLine" },
  { value: "polygon", labelKey: "dashboard.dataTypePolygon" },
  { value: "layer", labelKey: "dashboard.dataTypeLayer" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SpatialDataPayload) => void;
  initialData: AdminSpatialDataEntry | null;
  isSubmitting?: boolean;
}

const SpatialDataFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData, isSubmitting = false }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("30.0444");
  const [longitude, setLongitude] = useState("31.2357");
  const [dataType, setDataType] = useState("point");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [geojsonData, setGeojsonData] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setLatitude(String(initialData.latitude));
        setLongitude(String(initialData.longitude));
        setDataType(initialData.data_type);
        setCategory(initialData.category);
        setSource(initialData.source);
        setSourceUrl(initialData.source_url);
        setGeojsonData(initialData.geojson_data ? JSON.stringify(initialData.geojson_data, null, 2) : "");
        setIsPublished(initialData.is_published);
        setSelectedFile(null);
      } else {
        setTitle(""); setDescription(""); setLatitude("30.0444"); setLongitude("31.2357");
        setDataType("point"); setCategory(""); setSource(""); setSourceUrl("");
        setGeojsonData(""); setIsPublished(true); setSelectedFile(null);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SpatialDataPayload = {
      title, description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      data_type: dataType, category, source,
      source_url: sourceUrl, is_published: isPublished,
    };
    if (selectedFile) payload.file = selectedFile;
    if (geojsonData.trim()) payload.geojson_data = geojsonData;
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {initialData ? t('dashboard.editSpatialData') : t('dashboard.addNewSpatialData')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sp-title">{t('dashboard.titleLabel')} *</Label>
            <Input id="sp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('dashboard.spatialTitlePlaceholder')} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-desc">{t('dashboard.descriptionLabel')}</Label>
            <Textarea id="sp-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('dashboard.detailedDescription')} className="min-h-[80px] resize-y" />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sp-lat" className="flex items-center gap-1"><MapPin className="size-3.5" />{t('dashboard.latitude')} *</Label>
              <Input id="sp-lat" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="30.0444" dir="ltr" className="text-left" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp-lng">{t('dashboard.longitude')} *</Label>
              <Input id="sp-lng" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="31.2357" dir="ltr" className="text-left" required />
            </div>
          </div>

          {/* Data Type */}
          <div className="space-y-1.5">
            <Label>{t('dashboard.dataType')}</Label>
            <Select value={dataType} onValueChange={(val) => setDataType(val || "point")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>{t(dt.labelKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sp-category">{t('dashboard.categoryLabel')}</Label>
            <Input id="sp-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t('dashboard.spatialCategoryPlaceholder')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-source">{t('dashboard.sourceLabel')}</Label>
            <Input id="sp-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder={t('dashboard.sourcePlaceholder')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-source-url" className="flex items-center gap-1.5"><ExternalLink className="size-3.5" />{t('dashboard.goToSource')}</Label>
            <Input id="sp-source-url" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder={`https://example.com (${t('common.optional')})`} dir="ltr" className="text-left" />
          </div>

          {/* GeoJSON */}
          <div className="space-y-1.5">
            <Label htmlFor="sp-geojson">{t('dashboard.geojsonOptional')}</Label>
            <Textarea id="sp-geojson" value={geojsonData} onChange={(e) => setGeojsonData(e.target.value)} placeholder='{"type": "Feature", ...}' dir="ltr" className="text-left font-mono text-xs min-h-[80px] resize-y" />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label>{t('dashboard.spatialFileOptional')}</Label>
            <div
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setSelectedFile(f); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragOver ? "border-brand-primary bg-brand-primary/5" : "border-border hover:border-brand-primary/50 hover:bg-accent/30"}`}
            >
              <input ref={fileInputRef} type="file" accept=".shp,.geojson,.json,.kml,.kmz,.gpx,.zip" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} className="hidden" />
              {selectedFile ? (
                <p className="text-sm font-medium text-foreground"><FileText className="size-4 inline" /> {selectedFile.name}</p>
              ) : initialData?.file_name ? (
                <p className="text-sm text-muted-foreground">{t('dashboard.currentFile')}: <span className="font-medium text-foreground">{initialData.file_name}</span></p>
              ) : (
                <div className="space-y-1">
                  <FolderOpen className="size-5 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Shapefile, GeoJSON, KML, GPX</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="sp-published" className="cursor-pointer">{t('dashboard.publishedVisible')}</Label>
            <Switch id="sp-published" checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title || !latitude || !longitude}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed gap-2"
            >
              {isSubmitting && (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {initialData ? t('dashboard.update') : t('dashboard.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpatialDataFormModal;

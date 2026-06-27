/**
 * src/features/dashboard/types/spatialDataTypes.ts
 *
 * TypeScript types for the spatial data management feature.
 */

export interface AdminSpatialDataEntry {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  data_type: string;
  data_type_display: string;
  category: string;
  source: string;
  source_url: string;
  file: string;
  file_url: string | null;
  file_name: string;
  file_size_display: string;
  geojson_data: object | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpatialDataPayload {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  data_type?: string;
  category?: string;
  source?: string;
  source_url?: string;
  file?: File;
  geojson_data?: string;
  is_published?: boolean;
}

export interface AdminSpatialDataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminSpatialDataEntry[];
}

export interface PublicSpatialDataEntry {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  data_type: string;
  data_type_display: string;
  category: string;
  source: string;
  source_url: string;
  file_url: string | null;
  file_name: string;
  file_size_display: string;
  geojson_data: object | null;
  created_at: string;
}

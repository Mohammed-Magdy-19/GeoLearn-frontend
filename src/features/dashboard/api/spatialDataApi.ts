/**
 * src/features/dashboard/api/spatialDataApi.ts
 *
 * Axios API service for spatial data management (admin CRUD).
 */

import api from "../../../services/api";
import type {
  AdminSpatialDataEntry,
  AdminSpatialDataResponse,
  SpatialDataPayload,
} from "../types/spatialDataTypes";

const BASE = "/admin/spatial-data";

export async function fetchAdminSpatialData(
  page: number = 1,
  search: string = ""
): Promise<AdminSpatialDataResponse> {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  const { data } = await api.get<AdminSpatialDataResponse>(`${BASE}/`, { params });
  return data;
}

export async function createSpatialData(payload: SpatialDataPayload): Promise<AdminSpatialDataEntry> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("latitude", String(payload.latitude));
  formData.append("longitude", String(payload.longitude));
  if (payload.description) formData.append("description", payload.description);
  if (payload.data_type) formData.append("data_type", payload.data_type);
  if (payload.category) formData.append("category", payload.category);
  if (payload.source) formData.append("source", payload.source);
  if (payload.source_url) formData.append("source_url", payload.source_url);
  if (payload.file) formData.append("file", payload.file);
  if (payload.geojson_data) formData.append("geojson_data", payload.geojson_data);
  if (payload.is_published !== undefined) {
    formData.append("is_published", String(payload.is_published));
  }
  const { data } = await api.post<AdminSpatialDataEntry>(`${BASE}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateSpatialData(
  id: string,
  payload: Partial<SpatialDataPayload>
): Promise<AdminSpatialDataEntry> {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.latitude !== undefined) formData.append("latitude", String(payload.latitude));
  if (payload.longitude !== undefined) formData.append("longitude", String(payload.longitude));
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.data_type !== undefined) formData.append("data_type", payload.data_type);
  if (payload.category !== undefined) formData.append("category", payload.category);
  if (payload.source !== undefined) formData.append("source", payload.source);
  if (payload.source_url !== undefined) formData.append("source_url", payload.source_url);
  if (payload.file) formData.append("file", payload.file);
  if (payload.geojson_data) formData.append("geojson_data", payload.geojson_data);
  if (payload.is_published !== undefined) {
    formData.append("is_published", String(payload.is_published));
  }
  const { data } = await api.patch<AdminSpatialDataEntry>(`${BASE}/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteSpatialData(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}/`);
}

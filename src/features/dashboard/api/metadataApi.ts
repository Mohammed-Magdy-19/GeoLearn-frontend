/**
 * src/features/dashboard/api/metadataApi.ts
 *
 * Axios API service for metadata management (admin CRUD).
 */

import api from "../../../services/api";
import type {
  AdminMetadataEntry,
  AdminMetadataResponse,
  MetadataPayload,
} from "../types/metadataTypes";

const BASE = "/admin/metadata";

export async function fetchAdminMetadata(
  page: number = 1,
  search: string = ""
): Promise<AdminMetadataResponse> {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  const { data } = await api.get<AdminMetadataResponse>(`${BASE}/`, { params });
  return data;
}

export async function createMetadata(payload: MetadataPayload): Promise<AdminMetadataEntry> {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.category) formData.append("category", payload.category);
  if (payload.source) formData.append("source", payload.source);
  if (payload.source_url) formData.append("source_url", payload.source_url);
  if (payload.file) formData.append("file", payload.file);
  if (payload.is_published !== undefined) {
    formData.append("is_published", String(payload.is_published));
  }
  const { data } = await api.post<AdminMetadataEntry>(`${BASE}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateMetadata(
  id: string,
  payload: Partial<MetadataPayload>
): Promise<AdminMetadataEntry> {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.category !== undefined) formData.append("category", payload.category);
  if (payload.source !== undefined) formData.append("source", payload.source);
  if (payload.source_url !== undefined) formData.append("source_url", payload.source_url);
  if (payload.file) formData.append("file", payload.file);
  if (payload.is_published !== undefined) {
    formData.append("is_published", String(payload.is_published));
  }
  const { data } = await api.patch<AdminMetadataEntry>(`${BASE}/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteMetadata(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}/`);
}

/**
 * src/features/dashboard/api/summariesApi.ts
 *
 * Axios-based API service for summaries management (admin CRUD).
 * All endpoints require admin authentication.
 */

import api from "../../../services/api";
import type {
  AdminSummary,
  AdminSummariesResponse,
  SummaryPayload,
} from "../types/summaryTypes";

const BASE = "/admin/summaries";

/**
 * Fetch paginated admin summaries list.
 */
export async function fetchAdminSummaries(
  page: number = 1,
  search: string = ""
): Promise<AdminSummariesResponse> {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  const { data } = await api.get<AdminSummariesResponse>(`${BASE}/`, { params });
  return data;
}

/**
 * Fetch a single summary by ID.
 */
export async function fetchAdminSummary(id: string): Promise<AdminSummary> {
  const { data } = await api.get<AdminSummary>(`${BASE}/${id}/`);
  return data;
}

/**
 * Create a new summary (multipart form data for file upload).
 */
export async function createSummary(payload: SummaryPayload): Promise<AdminSummary> {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.source) formData.append("source", payload.source);
  if (payload.source_url) formData.append("source_url", payload.source_url);
  if (payload.subject) formData.append("subject", payload.subject);
  if (payload.file) formData.append("file", payload.file);
  if (payload.is_published !== undefined) {
    formData.append("is_published", String(payload.is_published));
  }

  const { data } = await api.post<AdminSummary>(`${BASE}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Update an existing summary (multipart for optional file replacement).
 */
export async function updateSummary(
  id: string,
  payload: Partial<SummaryPayload>
): Promise<AdminSummary> {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.source !== undefined) formData.append("source", payload.source);
  if (payload.source_url !== undefined) formData.append("source_url", payload.source_url);
  if (payload.subject !== undefined) formData.append("subject", payload.subject);
  if (payload.file) formData.append("file", payload.file);
  if (payload.is_published !== undefined) {
    formData.append("is_published", String(payload.is_published));
  }

  const { data } = await api.patch<AdminSummary>(`${BASE}/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Delete a summary.
 */
export async function deleteSummary(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}/`);
}

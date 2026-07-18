/**
 * src/features/dashboard/api/programsApi.ts
 *
 * Axios API service for programs management (admin CRUD).
 */

import api from "../../../services/api";
import type {
  AdminProgramEntry,
  AdminProgramResponse,
  ProgramPayload,
} from "../types/programTypes";

const BASE = "/admin/programs";

export async function fetchAdminPrograms(
  page: number = 1,
  search: string = ""
): Promise<AdminProgramResponse> {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  const { data } = await api.get<AdminProgramResponse>(`${BASE}/`, { params });
  return data;
}

export async function createProgram(payload: ProgramPayload): Promise<AdminProgramEntry> {
  const { data } = await api.post<AdminProgramEntry>(`${BASE}/`, payload);
  return data;
}

export async function updateProgram(
  id: string,
  payload: Partial<ProgramPayload>
): Promise<AdminProgramEntry> {
  const { data } = await api.patch<AdminProgramEntry>(`${BASE}/${id}/`, payload);
  return data;
}

export async function deleteProgram(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}/`);
}

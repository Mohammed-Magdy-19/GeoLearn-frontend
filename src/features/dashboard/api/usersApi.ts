/**
 * src/features/dashboard/api/usersApi.ts
 *
 * Axios-based API service for user management operations.
 * All endpoints require admin/staff privileges (enforced server-side).
 */

import api from "../../../services/api";
import type {
  PlatformUser,
  UserFilters,
  UpdateRolePayload,
  PaginatedResponse,
  ApiSuccessResponse,
} from "../types/dashboardTypes";

// ─────────────────────────────────────────────────────────────
// User CRUD
// ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of users with optional filters.
 * GET /api/admin/users/
 */
export const fetchUsers = async (
  filters: UserFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<PlatformUser>> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.role !== "all") {
    params.set("role", filters.role);
  }
  if (filters.isActive !== "all") {
    params.set("is_active", String(filters.isActive));
  }

  const { data } = await api.get<PaginatedResponse<PlatformUser>>(
    `/admin/users/?${params.toString()}`
  );
  return data;
};

/**
 * Fetch a single user by ID.
 * GET /api/admin/users/<id>/
 */
export const fetchUserById = async (userId: string): Promise<PlatformUser> => {
  const { data } = await api.get<PlatformUser>(`/admin/users/${userId}/`);
  return data;
};

/**
 * Update a user's role (staff / superuser flags).
 * PATCH /api/admin/users/<id>/role/
 */
export const updateUserRole = async (
  userId: string,
  payload: UpdateRolePayload
): Promise<PlatformUser> => {
  const { data } = await api.patch<PlatformUser>(
    `/admin/users/${userId}/role/`,
    payload
  );
  return data;
};

/**
 * Toggle a user's active status (soft disable/enable).
 * PATCH /api/admin/users/<id>/toggle-active/
 */
export const toggleUserActive = async (
  userId: string
): Promise<PlatformUser> => {
  const { data } = await api.patch<PlatformUser>(
    `/admin/users/${userId}/toggle-active/`
  );
  return data;
};

/**
 * Permanently delete a user from the database.
 * DELETE /api/admin/users/<id>/
 */
export const deleteUser = async (userId: string): Promise<ApiSuccessResponse> => {
  const { data } = await api.delete<ApiSuccessResponse>(`/admin/users/${userId}/`);
  return data;
};

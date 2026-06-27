/**
 * src/features/notifications/api/notificationsAdminApi.ts
 *
 * API service for admin notification management.
 */

import api from "@/services/api";
import type {
  AdminNotification,
  AdminNotificationPayload,
  PaginatedAdminNotifications,
} from "../types/notificationTypes";

const BASE = "/admin/notifications";

/** Fetch admin notifications list (paginated) */
export async function fetchAdminNotifications(
  page: number = 1,
  search: string = "",
  type: string = ""
): Promise<PaginatedAdminNotifications> {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  if (type) params.type = type;
  const { data } = await api.get<PaginatedAdminNotifications>(`${BASE}/`, {
    params,
  });
  return data;
}

/** Create a new admin notification (broadcast to all users) */
export async function createAdminNotification(
  payload: AdminNotificationPayload
): Promise<AdminNotification> {
  const { data } = await api.post<AdminNotification>(`${BASE}/`, payload);
  return data;
}

/** Delete a notification */
export async function deleteAdminNotification(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}/`);
}

/** Delete all notifications */
export async function deleteAllAdminNotifications(): Promise<void> {
  await api.post(`${BASE}/delete-all/`);
}

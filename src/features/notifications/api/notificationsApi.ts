/**
 * src/features/notifications/api/notificationsApi.ts
 *
 * API service for user-facing notification endpoints.
 */

import api from "@/services/api";
import type {
  PaginatedNotifications,
  UnreadCountResponse,
} from "../types/notificationTypes";

/** Fetch user's notifications (paginated) */
export async function fetchNotifications(
  page: number = 1
): Promise<PaginatedNotifications> {
  const { data } = await api.get<PaginatedNotifications>("/notifications/", {
    params: { page },
  });
  return data;
}

/** Get unread notification count */
export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await api.get<UnreadCountResponse>(
    "/notifications/unread-count/"
  );
  return data;
}

/** Mark a single notification as read */
export async function markAsRead(notificationId: string): Promise<void> {
  await api.post(`/notifications/${notificationId}/read/`);
}

/** Mark all notifications as read */
export async function markAllAsRead(): Promise<void> {
  await api.post("/notifications/read-all/");
}

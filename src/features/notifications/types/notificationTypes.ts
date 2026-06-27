/**
 * src/features/notifications/types/notificationTypes.ts
 *
 * TypeScript types for the notification system.
 */

/** Notification type */
export type NotificationType = "system" | "admin";

/** User-facing notification (includes read state) */
export interface UserNotification {
  id: string;
  type: NotificationType;
  type_display: string;
  title: string;
  message: string;
  link: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

/** Admin notification (includes metadata) */
export interface AdminNotification {
  id: string;
  type: NotificationType;
  type_display: string;
  title: string;
  message: string;
  link: string;
  is_global: boolean;
  created_by: string | null;
  created_by_name: string;
  recipient_count: number;
  created_at: string;
}

/** Payload for creating an admin notification */
export interface AdminNotificationPayload {
  title: string;
  message: string;
  link?: string;
}

/** Paginated response */
export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserNotification[];
}

export interface PaginatedAdminNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminNotification[];
}

/** Unread count response */
export interface UnreadCountResponse {
  count: number;
}

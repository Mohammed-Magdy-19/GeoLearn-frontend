/**
 * src/features/notifications/hooks/useNotifications.ts
 *
 * TanStack Query hooks for the notification system.
 * Includes 30-second polling for unread count.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../api/notificationsApi";
import { useAuthStore } from "@/store/useAuthStore";

const BASE_KEY = ["notifications"] as const;

export const notificationKeys = {
  all: BASE_KEY,
  list: (page: number) => [...BASE_KEY, "list", page] as const,
  unreadCount: [...BASE_KEY, "unread-count"] as const,
};

/** Fetch paginated notifications */
export function useNotificationsList(page: number = 1) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: notificationKeys.list(page),
    queryFn: () => fetchNotifications(page),
    enabled: !!user,
    placeholderData: (prev) => prev,
  });
}

/** Fetch unread count with 30-second polling */
export function useUnreadCount() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: fetchUnreadCount,
    enabled: !!user,
    refetchInterval: 30_000, // Poll every 30 seconds
    refetchIntervalInBackground: false,
  });
}

/** Mark a single notification as read */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/** Mark all notifications as read */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

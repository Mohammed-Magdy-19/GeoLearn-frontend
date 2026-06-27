/**
 * src/features/notifications/components/NotificationBell.tsx
 *
 * Bell icon with unread badge + popover showing latest notifications.
 * Uses shadcn Popover for automatic outside-click handling and positioning.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, ChevronLeft } from "lucide-react";
import {
  useUnreadCount,
  useNotificationsList,
  useMarkAsRead,
  useMarkAllAsRead,
} from "../hooks/useNotifications";
import type { UserNotification } from "../types/notificationTypes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function NotificationBell() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { data: unreadData } = useUnreadCount();
  const { data: notificationsData } = useNotificationsList(1);
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.results?.slice(0, 5) ?? [];

  const handleNotificationClick = (notification: UserNotification) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const timeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return t("notifications.now");
    if (diffMin < 60) return t("notifications.minutesAgo", { count: diffMin });
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return t("notifications.hoursAgo", { count: diffHr });
    const diffDay = Math.floor(diffHr / 24);
    return t("notifications.daysAgo", { count: diffDay });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="relative p-2 rounded-full hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
        aria-label={t("notifications.title")}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-bold text-foreground">{t("notifications.title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium h-auto p-0"
            >
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>

        {/* Notification Items */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">{t("notifications.noNotifications")}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
                timeAgo={timeAgo}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2.5 bg-muted/30">
          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors flex items-center justify-center gap-1"
          >
            {t("notifications.viewAllNotifications")}
            <ChevronLeft className="size-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
  onClick,
  timeAgo,
}: {
  notification: UserNotification;
  onClick: (n: UserNotification) => void;
  timeAgo: (d: string) => string;
}) {
  const content = (
    <div
      onClick={() => onClick(notification)}
      className={`px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0 ${
        notification.is_read
          ? "hover:bg-muted/30"
          : "bg-brand-primary/5 hover:bg-brand-primary/10"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Unread indicator */}
        <div className="mt-1.5 shrink-0">
          {!notification.is_read && (
            <span className="block w-2 h-2 rounded-full bg-brand-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-1">
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {timeAgo(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link to={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

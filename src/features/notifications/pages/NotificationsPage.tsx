/**
 * src/features/notifications/pages/NotificationsPage.tsx
 *
 * Full notifications list page for students.
 * Shows all notifications with mark-as-read functionality.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, ArrowRight, Settings, Megaphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  useNotificationsList,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "../hooks/useNotifications";
import type { UserNotification } from "../types/notificationTypes";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotificationsList(page);
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const notifications = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 15);
  const unreadCount = unreadData?.count ?? 0;

  const handleMarkRead = (notification: UserNotification) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeIcon = (type: string): React.ReactNode => {
    return type === "system" ? <Settings className="size-4" /> : <Megaphone className="size-4" />;
  };

  return (
    <main className="container max-w-3xl mx-auto px-4 py-12 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-primary" />
            {t("notifications.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("notifications.notificationCount", { total: totalCount })}{unreadCount > 0 && ` ${t("notifications.unreadCount", { count: unreadCount })}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            className="text-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 ml-1.5" />
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("notifications.noNotifications")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("notifications.notificationsWillAppear")}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notification) => {
              const inner = (
                <div
                  key={notification.id}
                  onClick={() => handleMarkRead(notification)}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    notification.is_read
                      ? "border-border bg-card hover:bg-muted/30"
                      : "border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div className="mt-1 shrink-0 w-5 flex justify-center">
                      {!notification.is_read && (
                        <span className="block w-2.5 h-2.5 rounded-full bg-brand-primary" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{typeIcon(notification.type)}</span>
                        <h3 className={`text-sm font-semibold ${notification.is_read ? "text-foreground" : "text-foreground"}`}>
                          {notification.title}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {notification.type_display}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );

              if (notification.link) {
                return (
                  <Link key={notification.id} to={notification.link} className="block">
                    {inner}
                  </Link>
                );
              }
              return <div key={notification.id}>{inner}</div>;
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("common.previous")}
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Back */}
      <div className="text-center mt-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
          <Button variant="ghost" className="!p-0">
            <ArrowRight className="ml-2 w-4 h-4" />
            {t("common.backToHome")}
          </Button>
        </Link>
      </div>
    </main>
  );
}

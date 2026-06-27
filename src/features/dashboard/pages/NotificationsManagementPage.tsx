/**
 * src/features/dashboard/pages/NotificationsManagementPage.tsx
 *
 * Admin dashboard page for managing notifications.
 * Create manual notifications and view sent history.
 */

import { useState } from "react";
import { Bell, Settings, Megaphone, Users, Link2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAdminNotifications,
  createAdminNotification,
  deleteAdminNotification,
  deleteAllAdminNotifications,
} from "@/features/notifications/api/notificationsAdminApi";
import type {
  AdminNotification,
  AdminNotificationPayload,
} from "@/features/notifications/types/notificationTypes";
import { useDashboardStore } from "@/store/useDashboardStore";

export const NotificationsManagementPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { openConfirmDialog } = useDashboardStore();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications", page, search],
    queryFn: () => fetchAdminNotifications(page, search),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (payload: AdminNotificationPayload) =>
      createAdminNotification(payload),
    onSuccess: () => {
      toast.success(i18n.t("toasts.notificationSent"));
      setFormOpen(false);
    },
    onError: (error: unknown) => {
      const axiosErr = error as { response?: { data?: { detail?: string } }; message?: string };
      const msg = axiosErr.response?.data?.detail || axiosErr.message || i18n.t("toasts.notificationSendFailed");
      toast.error(msg);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminNotification(id),
    onSuccess: () => {
      toast.success(i18n.t("toasts.notificationDeleted"));
    },
    onError: (error: unknown) => {
      const axiosErr = error as { response?: { data?: { detail?: string } }; message?: string };
      const msg = axiosErr.response?.data?.detail || axiosErr.message || i18n.t("toasts.notificationDeleteFailed");
      toast.error(msg);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllAdminNotifications,
    onSuccess: () => {
      toast.success(i18n.t("toasts.allNotificationsDeleted"));
    },
    onError: (error: unknown) => {
      const axiosErr = error as { response?: { data?: { detail?: string } }; message?: string };
      const msg = axiosErr.response?.data?.detail || axiosErr.message || i18n.t("toasts.allNotificationsDeleteFailed");
      toast.error(msg);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    },
  });

  const notifications = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 10);

  const handleDelete = (notif: AdminNotification) => {
    openConfirmDialog(
      t("dashboard.deleteNotification"),
      t("dashboard.deleteNotificationConfirm", { title: notif.title }),
      () => deleteMutation.mutate(notif.id),
      "danger"
    );
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.manageNotifications")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.manageNotificationsSubtitle", { count: totalCount })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openConfirmDialog(
                  t("dashboard.deleteAllNotifications"),
                  t("dashboard.deleteAllConfirm"),
                  () => deleteAllMutation.mutate(),
                  "danger"
                )
              }
              disabled={deleteAllMutation.isPending}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4 ml-1.5" />
              {deleteAllMutation.isPending ? t("dashboard.deleting") : t("dashboard.deleteAll")}
            </Button>
          )}
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
            {t("dashboard.sendNotification")}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder={t("dashboard.searchNotifications")}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Bell className="size-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("dashboard.noNotificationsYet")}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("dashboard.sendFirstNotification")}
          </p>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold"
          >
            {t("dashboard.sendFirstNotificationButton")}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-brand-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">
                        {notif.type === "system" ? <Settings className="size-4" /> : <Megaphone className="size-4" />}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">
                        {notif.title}
                      </h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          notif.type === "system"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-brand-primary/15 text-brand-primary"
                        }`}
                      >
                        {notif.type_display}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span>{formatDate(notif.created_at)}</span>
                      <span className="text-border">•</span>
                      <span>{t("dashboard.createdBy", { name: notif.created_by_name })}</span>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1"><Users className="size-3" /> {t("dashboard.recipients", { count: notif.recipient_count })}</span>
                      {notif.link && (
                        <>
                          <span className="text-border">•</span>
                          <span className="text-brand-primary truncate max-w-[150px]">
                            <Link2 className="size-3 inline" /> {notif.link}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(notif)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10 shrink-0"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
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

      {/* Create Notification Modal */}
      {isFormOpen && (
        <CreateNotificationModal
          onClose={() => setFormOpen(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
          isPending={createMutation.isPending}
        />
      )}
    </div>
  );
};

// ── Create Notification Modal ──────────────────────────────

function CreateNotificationModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void;
  onSubmit: (payload: AdminNotificationPayload) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, message, link: link || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-lg p-6 max-w-lg w-full mx-4 animate-fade-in-up">
        <h3 className="text-lg font-bold text-foreground mb-4">{i18n.t("dashboard.sendNotification")}</h3>
        <p className="text-sm text-muted-foreground mb-5">
          {i18n.t("dashboard.notificationWillBeSent")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notif-title" className="text-sm font-medium">{i18n.t("dashboard.notifTitleLabel")}</Label>
            <Input
              id="notif-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={i18n.t("dashboard.notifTitlePlaceholder")}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notif-message" className="text-sm font-medium">{i18n.t("dashboard.notifMessageLabel")}</Label>
            <textarea
              id="notif-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={i18n.t("dashboard.notifMessagePlaceholder")}
              required
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notif-link" className="text-sm font-medium">
              {i18n.t("dashboard.notifLinkLabel")} <span className="text-muted-foreground">({i18n.t("dashboard.optional")})</span>
            </Label>
            <Input
              id="notif-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={i18n.t("dashboard.notifLinkPlaceholder")}
              dir="ltr"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {i18n.t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold"
              disabled={!title || !message || isPending}
            >
              {isPending ? i18n.t("dashboard.sendingNotification") : i18n.t("dashboard.sendNotification")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NotificationsManagementPage;

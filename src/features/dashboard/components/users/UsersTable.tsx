import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PlatformUser, UserRole } from "../../types/dashboardTypes";
import UserRow from "./UserRow";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";

interface UsersTableProps {
  users: PlatformUser[];
  isLoading: boolean;
  error: unknown;
  deletingUserId: string | null;
  togglingUserId: string | null;
  onRoleChange: (userId: string, role: UserRole) => void;
  onToggleActive: (userId: string) => void;
  onDelete: (user: PlatformUser) => void;
  onResetFilters: () => void;
}

/**
 * Table component for displaying and managing platform users.
 * Uses shadcn Table primitives for consistent styling and accessibility.
 */
export const UsersTable = ({
  users,
  isLoading,
  error,
  deletingUserId,
  togglingUserId,
  onRoleChange,
  onToggleActive,
  onDelete,
  onResetFilters,
}: UsersTableProps) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 bg-muted/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">{t("dashboard.failedToLoadUsers")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : t("dashboard.pleaseTryAgain")}
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-16 text-center">
        <Users className="mx-auto size-12 text-muted-foreground/50 mb-3" strokeWidth={1.5} />
        <p className="text-muted-foreground font-medium">
          {t("dashboard.noMatchingUsers")}
        </p>
        <Button
          variant="link"
          onClick={onResetFilters}
          className="mt-2 text-sm text-primary"
        >
          {t("dashboard.resetFiltersButton")}
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30" >
          <TableHead className="text-start py-3 px-4 font-semibold">
            {t("dashboard.userLabel")}
          </TableHead>
          <TableHead className="text-center py-3 px-4 font-semibold">
            {t("dashboard.phoneLabel")}
          </TableHead>
          <TableHead className="text-center py-3 px-4 font-semibold">
            {t("dashboard.roleLabel")}
          </TableHead>
          <TableHead className="text-center py-3 px-4 font-semibold">
            {t("dashboard.statusLabel")}
          </TableHead>
          <TableHead className="text-center py-3 px-4 font-semibold">
            {t("dashboard.registerDateLabel")}
          </TableHead>
          <TableHead className="text-center py-3 px-4 font-semibold">
            {t("dashboard.lastLoginLabel")}
          </TableHead>
          <TableHead className="text-center py-3 px-4 font-semibold w-16">
            {t("dashboard.actionLabel")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onRoleChange={onRoleChange}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
            isToggling={togglingUserId === user.id}
            isDeleting={deletingUserId === user.id}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

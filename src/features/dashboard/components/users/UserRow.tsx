import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PlatformUser, UserRole } from "../../types/dashboardTypes";
import RoleSelect from "./RoleSelect";
import ActiveToggle from "./ActiveToggle";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

interface UserRowProps {
  user: PlatformUser;
  onRoleChange: (userId: string, role: UserRole) => void;
  onToggleActive: (userId: string) => void;
  onDelete: (user: PlatformUser) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

/**
 * Renders a single row in the admin user management table.
 * Uses shadcn TableRow/TableCell for consistent styling.
 */
export const UserRow = ({
  user,
  onRoleChange,
  onToggleActive,
  onDelete,
  isToggling,
  isDeleting,
}: UserRowProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const currentRole: UserRole = user.is_superuser
    ? "admin"
    : user.is_staff
      ? "instructor"
      : "student";

  return (
    <TableRow className="text-center">
      {/* User Info */}
      <TableCell className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            {user.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {user.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{user.username}</p>
          </div>
        </div>
      </TableCell>

      {/* Phone */}
      <TableCell className="py-3 px-4 text-sm text-muted-foreground" dir="ltr">
        {user.phone_number}
      </TableCell>

      {/* Role */}
      <TableCell className="py-3 px-4" dir="ltr">
        <RoleSelect
          currentRole={currentRole}
          onRoleChange={(newRole) => onRoleChange(user.id, newRole)}
        />
      </TableCell>

      {/* Active Status */}
      <TableCell className="py-3 px-4" dir="ltr">
        <ActiveToggle
          isActive={user.is_active}
          onToggle={() => onToggleActive(user.id)}
          isPending={isToggling}
        />
      </TableCell>

      {/* Join Date */}
      <TableCell className="py-3 px-4 text-sm text-muted-foreground">
        {new Date(user.date_joined).toLocaleDateString(locale)}
      </TableCell>

      {/* Last Login */}
      <TableCell className="py-3 px-4 text-sm text-muted-foreground">
        {user.last_login
          ? new Date(user.last_login).toLocaleDateString(locale)
          : "—"}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(user)}
          disabled={isDeleting}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title={t("dashboard.deleteUser")}
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;

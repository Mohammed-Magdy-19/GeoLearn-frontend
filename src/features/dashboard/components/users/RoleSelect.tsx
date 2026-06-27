import { useTranslation } from "react-i18next";
import type { UserRole } from "../../types/dashboardTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

/**
 * Dropdown component to select user roles (ISP compliant).
 * Uses shadcn Select for consistent styling and accessibility.
 */
export const RoleSelect = ({ currentRole, onRoleChange }: RoleSelectProps) => {
  const { t } = useTranslation();
  return (
    <Select
      value={currentRole}
      onValueChange={(val) => onRoleChange(val as UserRole)}
    >
      <SelectTrigger className="w-fit text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="student">{t("dashboard.roleStudent")}</SelectItem>
        <SelectItem value="instructor">{t("dashboard.roleInstructor")}</SelectItem>
        <SelectItem value="admin">{t("dashboard.roleAdmin")}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default RoleSelect;

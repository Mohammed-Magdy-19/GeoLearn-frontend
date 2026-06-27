import { Search, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserFilters, UserRole } from "../../types/dashboardTypes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFiltersBarProps {
  filters: UserFilters;
  onFiltersChange: (filters: Partial<UserFilters>) => void;
  onResetFilters: () => void;
}

/**
 * Filter and search bar for user list management.
 * Uses shadcn Input, Select, and Button for consistent UI.
 */
export const UserFiltersBar = ({
  filters,
  onFiltersChange,
  onResetFilters,
}: UserFiltersBarProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-border bg-card">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          type="text"
          placeholder={t("dashboard.searchUsersPlaceholder")}
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="pr-10 pl-4"
        />
      </div>

      {/* Role Filter */}
      <Select
        value={filters.role}
        onValueChange={(val) =>
          onFiltersChange({ role: val as UserRole | "all" })
        }
      >
        <SelectTrigger className="w-fit min-w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("dashboard.allRoles")}</SelectItem>
          <SelectItem value="admin">{t("dashboard.roleAdmin")}</SelectItem>
          <SelectItem value="instructor">{t("dashboard.roleInstructor")}</SelectItem>
          <SelectItem value="student">{t("dashboard.roleStudent")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Active Filter */}
      <Select
        value={String(filters.isActive)}
        onValueChange={(val) =>
          onFiltersChange({
            isActive:
              val === "all"
                ? "all"
                : val === "true",
          })
        }
      >
        <SelectTrigger className="w-fit min-w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("dashboard.allStatuses")}</SelectItem>
          <SelectItem value="true">{t("dashboard.active")}</SelectItem>
          <SelectItem value="false">{t("dashboard.inactive")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      <Button
        variant="ghost"
        onClick={onResetFilters}
        className="gap-2"
      >
        <RefreshCw className="size-3.5" />
        {t("dashboard.resetFiltersButton")}
      </Button>
    </div>
  );
};

export default UserFiltersBar;

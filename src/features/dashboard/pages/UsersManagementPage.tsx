import { useUsersQuery } from "../hooks/useUsersQuery";
import { useDashboardStore } from "../../../store/useDashboardStore";
import { useTranslation } from "react-i18next";
import useUsersHandlers from "../hooks/useUsersHandlers";

import UserFiltersBar from "../components/users/UserFiltersBar";
import UsersTable from "../components/users/UsersTable";
import Pagination from "../components/users/Pagination";

/**
 * User administration page (SRP orchestrator).
 * Orchestrates pagination/filter states from store and handlers from custom hook.
 */
export const UsersManagementPage = () => {
  const { t } = useTranslation();
  const {
    userFilters,
    setUserFilters,
    resetUserFilters,
    usersPage,
    setUsersPage,
  } = useDashboardStore();

  const { data, isLoading, error } = useUsersQuery(
    userFilters,
    usersPage,
    20
  );

  const {
    deletingUserId,
    togglingUserId,
    handleRoleChange,
    handleToggleActive,
    handleDelete,
  } = useUsersHandlers();

  const totalPages = data ? Math.ceil(data.count / 20) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            {t("dashboard.manageUsers")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("dashboard.manageUsersSubtitle")}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {data ? (
            <span>
              {t("dashboard.totalUsersCount")}{" "}
              <strong className="text-foreground">
                {data.count.toLocaleString()}
              </strong>
            </span>
          ) : null}
        </div>
      </div>

      {/* Filters */}
      <UserFiltersBar
        filters={userFilters}
        onFiltersChange={setUserFilters}
        onResetFilters={resetUserFilters}
      />

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <UsersTable
          users={data?.results ?? []}
          isLoading={isLoading}
          error={error}
          deletingUserId={deletingUserId}
          togglingUserId={togglingUserId}
          onRoleChange={handleRoleChange}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          onResetFilters={resetUserFilters}
        />

        {/* Pagination */}
        <Pagination
          currentPage={usersPage}
          totalPages={totalPages}
          onPageChange={setUsersPage}
        />
      </div>
    </div>
  );
};

export default UsersManagementPage;

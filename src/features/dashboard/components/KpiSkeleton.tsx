import React from "react";

export const KpiSkeleton: React.FC = () => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-card animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
      <div className="h-10 w-10 bg-muted rounded-lg" />
    </div>
  </div>
);

export default KpiSkeleton;

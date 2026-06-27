import React from "react";

export const QuickStatRow: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-3">
      <span className="text-lg flex items-center">{icon}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="text-sm font-bold text-foreground font-display">
      {typeof value === "number" ? value.toLocaleString("ar-EG") : value}
    </span>
  </div>
);

export default QuickStatRow;

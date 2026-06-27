import { Switch } from "@/components/ui/switch";

interface ActiveToggleProps {
  isActive: boolean;
  onToggle: () => void;
  isPending: boolean;
}

/**
 * Toggle switch component for user active status.
 * Uses shadcn Switch for consistent styling (LSP — accepts standard switch attributes).
 */
export const ActiveToggle = ({
  isActive,
  onToggle,
  isPending,
}: ActiveToggleProps) => {
  return (
    <Switch
      checked={isActive}
      onCheckedChange={onToggle}
      disabled={isPending}
      className={isActive ? "data-checked:bg-brand-accent" : ""}
    />
  );
};

export default ActiveToggle;

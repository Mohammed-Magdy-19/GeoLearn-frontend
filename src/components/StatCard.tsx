/**
 * StatCard
 *
 * Renders a single statistic inside the Hero section's statistics row.
 * The parent <dl> handles the overall fade-in animation; each StatCard
 * adds a small per-item stagger via `style.animationDelay` so the three
 * numbers appear in sequence rather than all at once.
 *
 * Props:
 *   stat  — { value: string; label: string }  data from HERO_STATS
 *   index — 0-based position, used to compute the stagger delay
 */

interface StatItem {
  readonly value: string;
  readonly label: string;
}

interface StatCardProps {
  stat: StatItem;
  /** 0-based card index — drives the per-item stagger delay */
  index: number;
}

export default function StatCard({ stat, index }: StatCardProps) {
  return (
    /*
     * Each card fades in with a small extra offset on top of the parent's
     * animation-delay-700.  `animate-fade-in` + `both` fill-mode means the
     * card starts transparent during its own delay and stays opaque after.
     * We use inline style for the delay because the value is dynamic
     * (Tailwind can't purge dynamically constructed class names).
     */
    <div
      className="animate-fade-in text-center"
      style={{ animationDelay: `${700 + index * 120}ms` }}
    >
      {/* Statistic value — large display number */}
      <dt className="font-display text-4xl font-black text-brand-warm sm:text-5xl">
        {stat.value}
      </dt>

      {/* Human-readable label below the number */}
      <dd className="mt-1 text-sm text-white/70">{stat.label}</dd>
    </div>
  );
}
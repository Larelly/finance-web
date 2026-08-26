import { Card } from "@/components/ui/Card";
import { formatCents, formatSignedCents, formatPercent } from "@/lib/format";

interface StatTileProps {
  label: string;
  cents: number;
  accentClassName: string;
  delta?: { cents: number; pct: number } | null;
  deltaGoodDirection?: "up" | "down";
}

export function StatTile({ label, cents, accentClassName, delta, deltaGoodDirection = "down" }: StatTileProps) {
  const isGood = delta
    ? deltaGoodDirection === "down"
      ? delta.cents <= 0
      : delta.cents >= 0
    : null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <span className={`h-2 w-2 rounded-full ${accentClassName}`} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{formatCents(cents)}</div>
      {delta && (
        <div className={`mt-1.5 text-xs font-medium ${isGood ? "text-good" : "text-critical"}`}>
          {formatSignedCents(delta.cents)} ({formatPercent(delta.pct)}) vs. mês anterior
        </div>
      )}
    </Card>
  );
}

import { formatMonthLabel } from "@/lib/format";

export function MonthPicker({
  month,
  onChange,
}: {
  month: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-card p-1">
      <button
        onClick={() => onChange(shift(month, -1))}
        aria-label="Mês anterior"
        className="cursor-pointer rounded-md p-1.5 text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <span className="min-w-36 text-center text-sm font-medium capitalize">{formatMonthLabel(month)}</span>
      <button
        onClick={() => onChange(shift(month, 1))}
        aria-label="Próximo mês"
        className="cursor-pointer rounded-md p-1.5 text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

function shift(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

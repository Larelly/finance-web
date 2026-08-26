import { Card } from "@/components/ui/Card";
import { formatCents, formatPercent } from "@/lib/format";
import type { MonthlyReportCategory, TransactionType } from "@/lib/types";

function BreakdownGroup({
  title,
  colorVar,
  items,
}: {
  title: string;
  colorVar: string;
  items: MonthlyReportCategory[];
}) {
  if (items.length === 0) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold text-text-secondary">{title}</h3>
        <p className="text-sm text-text-muted">Nenhum lançamento neste mês.</p>
      </div>
    );
  }

  const max = Math.max(...items.map((i) => i.total));

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-text-secondary">{title}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.categoryId}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-text-primary">{item.name}</span>
              <span className="shrink-0 tabular-nums text-text-secondary">
                {formatCents(item.total)} · {formatPercent(item.share)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${max > 0 ? (item.total / max) * 100 : 0}%`,
                  backgroundColor: colorVar,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoryBreakdown({ byCategory }: { byCategory: MonthlyReportCategory[] }) {
  const byType = (type: TransactionType) =>
    byCategory.filter((c) => c.type === type).sort((a, b) => b.total - a.total);

  return (
    <Card className="grid grid-cols-1 gap-8 p-6 sm:grid-cols-2">
      <BreakdownGroup title="Receitas por categoria" colorVar="var(--income)" items={byType("INCOME")} />
      <BreakdownGroup title="Despesas por categoria" colorVar="var(--expense)" items={byType("EXPENSE")} />
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { MonthPicker } from "@/components/MonthPicker";
import { StatTile } from "@/components/StatTile";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { reportsApi, ApiError } from "@/lib/api";
import { currentMonth, userTimeZone } from "@/lib/format";
import type { MonthlyReport } from "@/lib/types";

export default function OverviewPage() {
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    reportsApi
      .monthly(month, userTimeZone())
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Falha ao carregar o relatório.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Visão geral</h1>
          <p className="text-sm text-text-secondary">Seu resumo financeiro do mês.</p>
        </div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-critical/30 bg-critical/5 p-4 text-sm text-critical">
          {error}
        </div>
      )}

      {!loading && !error && report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Receitas" cents={report.totals.income} accentClassName="bg-income" />
            <StatTile
              label="Despesas"
              cents={report.totals.expense}
              accentClassName="bg-expense"
              delta={
                report.comparison
                  ? { cents: report.comparison.expenseDelta, pct: report.comparison.expenseDeltaPct }
                  : null
              }
              deltaGoodDirection="down"
            />
            <StatTile
              label="Saldo"
              cents={report.totals.net}
              accentClassName={report.totals.net >= 0 ? "bg-good" : "bg-critical"}
            />
          </div>

          <CategoryBreakdown byCategory={report.byCategory} />
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { categoriesApi, transactionsApi, ApiError } from "@/lib/api";
import { formatCents, formatDate } from "@/lib/format";
import type { Category, Transaction, TransactionType } from "@/lib/types";

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  useEffect(() => {
    void categoriesApi.list().then(setCategories);
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await transactionsApi.list({
        page,
        pageSize: PAGE_SIZE,
        type: typeFilter || undefined,
        categoryId: categoryFilter || undefined,
        sort: "occurred_at:desc",
      });
      setTransactions(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao carregar transações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm("Excluir esta transação?")) return;
    try {
      await transactionsApi.remove(transaction.id);
      await load();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Não foi possível excluir a transação.");
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Transações</h1>
          <p className="text-sm text-text-secondary">{total} lançamento(s) no total.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          + Nova transação
        </Button>
      </div>

      <Card className="flex flex-wrap gap-3 p-4">
        <Select
          value={typeFilter}
          onChange={(e) => {
            setPage(1);
            setTypeFilter(e.target.value as TransactionType | "");
          }}
          className="w-40"
        >
          <option value="">Todos os tipos</option>
          <option value="INCOME">Receitas</option>
          <option value="EXPENSE">Despesas</option>
        </Select>
        <Select
          value={categoryFilter}
          onChange={(e) => {
            setPage(1);
            setCategoryFilter(e.target.value);
          }}
          className="w-48"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Card>

      {error && (
        <div className="rounded-xl border border-critical/30 bg-critical/5 p-4 text-sm text-critical">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-muted">Nenhuma transação encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="group border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                      {formatDate(transaction.occurredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            transaction.type === "INCOME" ? "bg-income" : "bg-expense"
                          }`}
                        />
                        {transaction.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{transaction.description || "—"}</td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums ${
                        transaction.type === "INCOME" ? "text-income" : "text-text-primary"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "−"}
                      {formatCents(transaction.amountCents)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setEditing(transaction);
                            setModalOpen(true);
                          }}
                          aria-label="Editar"
                          className="cursor-pointer rounded-md p-1.5 text-text-muted hover:bg-surface-sunken hover:text-text-primary"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction)}
                          aria-label="Excluir"
                          className="cursor-pointer rounded-md p-1.5 text-text-muted hover:bg-surface-sunken hover:text-critical"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-text-secondary">
            Página {page} de {totalPages}
          </span>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      )}

      {modalOpen && (
        <TransactionFormModal
          transaction={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function TransactionFormModal({
  transaction,
  categories,
  onClose,
  onSaved,
}: {
  transaction: Transaction | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "EXPENSE");
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [amount, setAmount] = useState(transaction ? (transaction.amountCents / 100).toFixed(2) : "");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [occurredAt, setOccurredAt] = useState(
    transaction ? toDateTimeLocal(transaction.occurredAt) : toDateTimeLocal(new Date().toISOString()),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);

  useEffect(() => {
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, filteredCategories]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const amountCents = Math.round(Number(amount.replace(",", ".")) * 100);
    if (!categoryId) {
      setError("Selecione uma categoria.");
      return;
    }
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        categoryId,
        type,
        amountCents,
        description: description || undefined,
        occurredAt: new Date(occurredAt).toISOString(),
      };
      if (transaction) {
        await transactionsApi.update(transaction.id, payload);
      } else {
        await transactionsApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar a transação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={transaction ? "Editar transação" : "Nova transação"} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
          <option value="EXPENSE">Despesa</option>
          <option value="INCOME">Receita</option>
        </Select>
        <Select
          label="Categoria"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione…
          </option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          label="Data"
          type="datetime-local"
          required
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
        />
        <Input
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="text-sm text-critical">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

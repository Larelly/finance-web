"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { categoriesApi, ApiError } from "@/lib/api";
import type { Category, TransactionType } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  async function load() {
    try {
      setCategories(await categoriesApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao carregar categorias.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDelete(category: Category) {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;
    try {
      await categoriesApi.remove(category.id);
      await load();
    } catch (err) {
      window.alert(
        err instanceof ApiError
          ? err.message
          : "Não foi possível excluir a categoria.",
      );
    }
  }

  const income = categories?.filter((c) => c.type === "INCOME") ?? [];
  const expense = categories?.filter((c) => c.type === "EXPENSE") ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-sm text-text-secondary">Organize receitas e despesas por categoria.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          + Nova categoria
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-critical/30 bg-critical/5 p-4 text-sm text-critical">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CategoryGroup
          title="Receitas"
          dotClassName="bg-income"
          categories={income}
          onEdit={(c) => {
            setEditing(c);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />
        <CategoryGroup
          title="Despesas"
          dotClassName="bg-expense"
          categories={expense}
          onEdit={(c) => {
            setEditing(c);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      {modalOpen && (
        <CategoryFormModal
          category={editing}
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

function CategoryGroup({
  title,
  dotClassName,
  categories,
  onEdit,
  onDelete,
}: {
  title: string;
  dotClassName: string;
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-sm font-semibold text-text-secondary">{title}</h2>
      {categories.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhuma categoria ainda.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {categories.map((category) => (
            <li
              key={category.id}
              className="group flex items-center justify-between rounded-lg px-2 py-2 hover:bg-surface-sunken"
            >
              <span className="flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
                {category.name}
              </span>
              <span className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onEdit(category)}
                  aria-label="Editar"
                  className="cursor-pointer rounded-md p-1.5 text-text-muted hover:bg-surface-card hover:text-text-primary"
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={() => onDelete(category)}
                  aria-label="Excluir"
                  className="cursor-pointer rounded-md p-1.5 text-text-muted hover:bg-surface-card hover:text-critical"
                >
                  <TrashIcon />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<TransactionType>(category?.type ?? "EXPENSE");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (category) {
        await categoriesApi.update(category.id, { name, type });
      } else {
        await categoriesApi.create({ name, type });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar a categoria.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={category ? "Editar categoria" : "Nova categoria"} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
          <option value="EXPENSE">Despesa</option>
          <option value="INCOME">Receita</option>
        </Select>
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

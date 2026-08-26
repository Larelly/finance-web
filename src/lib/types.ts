export type TransactionType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amountCents: number;
  description: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface MonthlyReportCategory {
  categoryId: string;
  name: string;
  type: TransactionType;
  total: number;
  share: number;
  transactionCount: number;
}

export interface MonthlyReport {
  month: string;
  currency: string;
  totals: { income: number; expense: number; net: number };
  byCategory: MonthlyReportCategory[];
  comparison: { previousMonth: string; expenseDelta: number; expenseDeltaPct: number } | null;
  generatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  timezone: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string[]>;
}

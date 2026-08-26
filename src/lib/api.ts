import type {
  AuthUser,
  Category,
  MonthlyReport,
  Paginated,
  ProblemDetails,
  TokenPair,
  Transaction,
  TransactionType,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const ACCESS_KEY = "finance.accessToken";
const REFRESH_KEY = "finance.refreshToken";

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | null;

  constructor(status: number, problem: ProblemDetails | null, fallbackMessage: string) {
    super(problem?.detail ?? fallbackMessage);
    this.status = status;
    this.problem = problem;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: TokenPair): void {
  window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

async function parseProblem(response: Response): Promise<ProblemDetails | null> {
  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return null;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        clearTokens();
        return false;
      }
      const tokens = (await response.json()) as TokenPair;
      setTokens(tokens);
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  auth?: boolean;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { method = "GET", body, query, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && !isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, true);
  }

  if (!response.ok) {
    const problem = await parseProblem(response);
    throw new ApiError(response.status, problem, `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const authApi = {
  register: (input: { email: string; password: string; timezone?: string }) =>
    request<AuthUser>("/api/v1/auth/register", { method: "POST", body: input, auth: false }),

  login: async (input: { email: string; password: string }) => {
    const tokens = await request<TokenPair>("/api/v1/auth/login", {
      method: "POST",
      body: input,
      auth: false,
    });
    setTokens(tokens);
    return tokens;
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    clearTokens();
    if (refreshToken) {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }
  },
};

export const categoriesApi = {
  list: () => request<Category[]>("/api/v1/categories"),
  create: (input: { name: string; type: TransactionType }) =>
    request<Category>("/api/v1/categories", { method: "POST", body: input }),
  update: (id: string, input: { name?: string; type?: TransactionType }) =>
    request<Category>(`/api/v1/categories/${id}`, { method: "PATCH", body: input }),
  remove: (id: string) => request<void>(`/api/v1/categories/${id}`, { method: "DELETE" }),
};

export interface ListTransactionsParams {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  categoryId?: string;
  type?: TransactionType;
  sort?: "occurred_at:asc" | "occurred_at:desc";
}

export const transactionsApi = {
  list: (params: ListTransactionsParams = {}) =>
    request<Paginated<Transaction>>("/api/v1/transactions", {
      query: params as Record<string, string | number | undefined>,
    }),
  create: (input: {
    categoryId: string;
    type: TransactionType;
    amountCents: number;
    description?: string;
    occurredAt: string;
  }) => request<Transaction>("/api/v1/transactions", { method: "POST", body: input }),
  update: (
    id: string,
    input: Partial<{
      categoryId: string;
      type: TransactionType;
      amountCents: number;
      description: string | null;
      occurredAt: string;
    }>,
  ) => request<Transaction>(`/api/v1/transactions/${id}`, { method: "PATCH", body: input }),
  remove: (id: string) => request<void>(`/api/v1/transactions/${id}`, { method: "DELETE" }),
};

export const reportsApi = {
  monthly: (month: string, timezone: string) =>
    request<MonthlyReport>("/api/v1/reports/monthly", { query: { month, timezone } }),
};

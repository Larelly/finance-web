# Finance Web

Frontend em Next.js (App Router) + TypeScript + Tailwind CSS para a [Finance API](https://github.com/Larelly/finance-api) — dashboard de finanças pessoais com login, categorias, transações e relatório mensal.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · sem bibliotecas de UI/chart externas (componentes e gráficos de barra construídos à mão).

## Como rodar

Precisa da [Finance API](https://github.com/Larelly/finance-api) rodando (`docker compose up` nela, porta 3000).

```bash
npm install
cp .env.example .env.local   # confirme NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev                  # sobe em http://localhost:3001
```

## Decisões

- **Tokens de sessão em `localStorage`** (access + refresh), com uma camada em `src/lib/api.ts` que renova o access token automaticamente em qualquer 401 e refaz a chamada original uma vez. É a abordagem mais simples para um projeto de portfólio; para produção real, o ideal seria um cookie `httpOnly` (a API já suporta o fluxo de refresh — só trocaria onde o token fica guardado).
- **Sem biblioteca de gráficos.** O breakdown por categoria é uma lista de barras HTML/CSS simples, com cor por tipo (receita/despesa) em vez de uma cor por categoria — mais legível que uma paleta arco-íris para uma lista já rotulada.
- **Tema claro/escuro** com paleta de tokens CSS (`globals.css`), respeitando a preferência do sistema por padrão e com alternância manual persistida em `localStorage`.
- **Todas as datas/valores em centavos** são formatados no cliente a partir do que a API já retorna (centavos, `BRL`) — a conversão para reais só acontece na camada de apresentação, como o backend espera.

## Estrutura

```
src/
  app/
    login/, register/          páginas de autenticação
    dashboard/
      layout.tsx                layout protegido (sidebar + topbar)
      page.tsx                  visão geral (relatório mensal)
      transactions/page.tsx     lista + CRUD de transações
      categories/page.tsx       lista + CRUD de categorias
  components/                   componentes de UI e de domínio
  lib/
    api.ts                      cliente HTTP + refresh automático de token
    auth-context.tsx            contexto de sessão (login/registro/logout)
    format.ts                   formatação de moeda/data/mês
    types.ts                    tipos espelhando os contratos da API
```

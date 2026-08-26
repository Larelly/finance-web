"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Geral" },
  { href: "/dashboard/transactions", label: "Transações" },
  { href: "/dashboard/categories", label: "Categorias" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
              active ? "bg-accent/10 text-accent" : "text-text-secondary"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

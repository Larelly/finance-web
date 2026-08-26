"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { useAuth } from "@/lib/auth-context";
import { isAuthenticated } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [isLoading, router]);

  if (isLoading || !isAuthenticated()) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-page">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-surface-page">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface-card px-4 py-3 md:px-8">
          <MobileNav />
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-text-secondary sm:inline">{user?.email}</span>
            <button
              onClick={() => void logout()}
              className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

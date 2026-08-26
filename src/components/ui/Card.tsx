export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface-card shadow-sm shadow-black/[0.03] ${className}`}
    >
      {children}
    </div>
  );
}

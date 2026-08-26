export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-accent to-accent-strong p-10 text-white lg:flex">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
            <circle cx="60" cy="60" r="140" fill="white" opacity="0.12" />
            <circle cx="340" cy="320" r="180" fill="white" opacity="0.1" />
          </svg>
        </div>
        <div className="relative z-10 text-lg font-semibold tracking-tight">Finance</div>
        <div className="relative z-10 max-w-sm">
          <p className="text-2xl font-semibold leading-snug">
            Suas finanças, organizadas em centavos — sem surpresas de arredondamento.
          </p>
          <p className="mt-4 text-sm text-white/80">
            Categorize receitas e despesas, acompanhe o relatório mensal e entenda para onde vai o seu
            dinheiro.
          </p>
        </div>
        <div className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} Finance
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface-page p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>
        </div>
      </div>
    </div>
  );
}

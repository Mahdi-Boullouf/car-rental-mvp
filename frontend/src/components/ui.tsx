import { type ReactNode } from "react";

export function PageHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const tint: Record<string, string> = {
  blue: "bg-brand/10 text-brand",
  green: "bg-okbg text-ok",
  red: "bg-dangerbg text-danger",
  indigo: "bg-[#ecebfd] text-[#4f46e5]",
};

export function KpiRow({ items }: { items: { n: ReactNode; l: string; c: keyof typeof tint | string; icon: ReactNode }[] }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((k, i) => (
        <div key={i} className="card flex flex-col items-start gap-2.5 p-4 transition hover:-translate-y-0.5 hover:shadow-lg2 sm:flex-row sm:items-center sm:gap-3.5">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${tint[k.c] || tint.blue}`}>
            <span className="h-[22px] w-[22px]">{k.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="whitespace-nowrap text-lg font-extrabold leading-none tabular-nums sm:text-[26px]">{k.n}</div>
            <div className="mt-1 text-[12.5px] font-semibold text-muted">{k.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Spinner({ label = "جارٍ التحميل…" }: { label?: string }) {
  return <div className="grid place-items-center py-20 text-muted">{label}</div>;
}

export function Alert({ children }: { children: ReactNode }) {
  return <div className="mt-4 rounded-xl border border-[#f6c9d3] bg-dangerbg px-4 py-3.5 text-sm leading-7 text-[#9f1239]">{children}</div>;
}

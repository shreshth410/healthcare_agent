
import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub: string;
  borderColor?: string;
}

export function KpiCard({ label, value, sub, borderColor }: KpiCardProps) {
  return (
    <div 
      className={clsx("bg-bg-surface border border-border-base rounded-md p-5 pb-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm")} 
      style={{ borderLeftColor: borderColor, borderLeftWidth: borderColor ? '4px' : '1px' }}
    >
      <div className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.08em] mb-1.5">{label}</div>
      <div className="text-[2.1rem] font-extrabold text-text-primary tracking-tight leading-[1.1] mb-2">{value}</div>
      <div className="text-[0.82rem] text-text-subtle leading-relaxed">{sub}</div>
    </div>
  );
}

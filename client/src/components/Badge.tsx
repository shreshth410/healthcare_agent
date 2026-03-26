
import clsx from "clsx";

interface BadgeProps {
  confidence: number;
}

export function Badge({ confidence }: BadgeProps) {
  let kind = "low";
  let label = "LOW";
  if (confidence >= 0.8) {
    kind = "high";
    label = "HIGH";
  } else if (confidence >= 0.6) {
    kind = "med";
    label = "MODERATE";
  }

  const pct = Math.round(confidence * 100);

  const colorClasses = {
    high: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
    med: "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]",
    low: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
  }[kind];

  return (
    <span className={clsx("inline-flex items-center gap-1.5 text-[0.72rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border", colorClasses)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {pct}% - {label}
    </span>
  );
}

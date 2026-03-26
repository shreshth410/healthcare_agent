
import clsx from "clsx";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

type AlertKind = "success" | "warning" | "danger" | "info";

interface AlertProps {
  kind: AlertKind;
  title: string;
  body?: string;
}

export function Alert({ kind, title, body }: AlertProps) {
  const Icon = {
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: XCircle,
    info: Info,
  }[kind];

  const colorClasses = {
    success: "bg-[#ECFDF5] border-[#34D399] text-[#065F46]",
    warning: "bg-[#FFFBEB] border-[#FBBF24] text-[#92400E]",
    danger: "bg-[#FEF2F2] border-[#F87171] text-[#991B1B]",
    info: "bg-[#F0F9FF] border-[#7DD3FC] text-[#075985]",
  }[kind];

  return (
    <div className={clsx("flex gap-4 p-5 rounded-md mb-5 border", colorClasses)}>
      <Icon className="shrink-0 mt-0.5 w-5 h-5" />
      <div>
        <div className="text-[0.95rem] font-bold mb-1">{title}</div>
        {body && <div className="text-[0.88rem] leading-relaxed opacity-90">{body}</div>}
      </div>
    </div>
  );
}

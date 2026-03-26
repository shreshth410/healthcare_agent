interface HeroProps {
  title: string;
  subtitle: string;
  dateStr: string;
}

export function Hero({ title, subtitle, dateStr }: HeroProps) {
  return (
    <div className="mb-8 rounded-xl border border-border-base bg-bg-surface shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="flex flex-wrap md:flex-nowrap gap-8 p-8 md:p-10 relative">
        <div style={{ flex: 1, minWidth: "320px" }}>
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="inline-flex text-[0.7rem] font-bold uppercase tracking-wider text-brand-blue bg-[#EEF4FF] border border-[#D6E1FF] rounded-full px-2.5 py-1">Neural Inference</span>
            <span className="inline-flex text-[0.7rem] font-bold uppercase tracking-wider text-brand-green bg-[#EEFDF7] border border-[#CFF7E4] rounded-full px-2.5 py-1">Audit Ready</span>
            <span className="inline-flex text-[0.7rem] font-bold uppercase tracking-wider text-[#6D28D9] bg-[#F5F3FF] border border-[#EDE9FE] rounded-full px-2.5 py-1">RAG Enabled</span>
            <span className="inline-flex text-[0.7rem] font-bold uppercase tracking-wider text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-full px-2.5 py-1">HITL Safeguard</span>
          </div>
          <div className="text-[1.85rem] font-extrabold text-text-primary tracking-[-0.02em] leading-[1.2] mb-3">{title}</div>
          <div className="text-[0.95rem] text-text-muted leading-[1.6] max-w-[800px]">{subtitle}</div>
        </div>

        <div className="flex flex-col gap-5 border-l border-border-base pl-8 min-w-[320px]">
          <div className="text-[0.75rem] font-bold uppercase tracking-[0.05em] text-text-subtle mb-1">Live System Status</div>

          <div className="flex gap-4 items-start">
            <div className="mt-1 w-2.5 h-2.5 rounded-full shrink-0 bg-brand-blue shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"></div>
            <div>
              <div className="text-[0.85rem] font-bold text-text-primary mb-1">Autonomous Coding Pipeline</div>
              <div className="text-[0.8rem] text-text-muted leading-[1.5]">
                Transforms raw physician notes into billing-ready ICD-10 & CPT outputs.
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div
              className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: "#3DD9EB", boxShadow: "0 0 0 4px rgba(61,217,235,0.12)" }}
            ></div>
            <div>
              <div className="text-[0.85rem] font-bold text-text-primary mb-1">Compliance-first Layer</div>
              <div className="text-[0.8rem] text-text-muted leading-[1.5]">
                Flags ambiguity, contradictions, bundling risks, and sequencing issues.
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div
              className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: "#22C55E", boxShadow: "0 0 0 4px rgba(34,197,94,0.12)" }}
            ></div>
            <div>
              <div className="text-[0.85rem] font-bold text-text-primary mb-1">System Date</div>
              <div className="font-mono text-[0.8rem] text-text-muted leading-[1.5]">{dateStr}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

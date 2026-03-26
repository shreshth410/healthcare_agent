
import { NavLink } from "react-router-dom";
import clsx from "clsx";

export function Sidebar() {
  const currentRoutes = [
    { name: "Analyze Note", path: "/" },
    { name: "Audit Trail", path: "/audit" },
    { name: "Impact Dashboard", path: "/impact" },
    { name: "Test Scenarios", path: "/scenarios" },
  ];

  return (
    <div className="w-[280px] shrink-0 bg-bg-surface border-r border-border-base flex flex-col h-full overflow-hidden shadow-xs relative z-10 hidden md:flex">
      <div className="p-5 pb-4 flex items-center gap-3">
        <div className="w-[42px] h-[42px] bg-brand-blue text-text-inverse shrink-0 shadow-[0_16px_30px_rgba(37,99,235,0.26)] rounded-sm flex items-center justify-center font-extrabold text-[1.2rem]">H</div>
        <div>
          <div className="text-[1.02rem] font-extrabold text-text-primary tracking-[-0.02em]">HealthAI</div>
          <div className="text-[0.72rem] text-text-muted font-semibold mt-[2px]">Autonomous Medical Coding</div>
        </div>
      </div>

      <div className="px-4 text-[0.67rem] font-extrabold uppercase tracking-[0.12em] text-text-subtle mb-2 mt-4">Workspace Navigation</div>
      <nav className="flex flex-col px-2">
        {currentRoutes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            className={({ isActive }) => clsx(
              "text-[0.88rem] font-semibold text-text-muted px-4 py-3 rounded-sm block transition-all leading-[1.35] cursor-pointer mb-1 border border-transparent hover:bg-bg-panel hover:text-text-primary",
              isActive && "bg-bg-panel text-brand-blue font-bold border-l-4 border-l-brand-blue rounded-l-none"
            )}
          >
            {r.name}
          </NavLink>
        ))}
      </nav>

      <hr className="border-none border-t border-border-base my-5" />

      <div className="px-2.5">
        <div className="px-2 text-[0.67rem] font-extrabold uppercase tracking-[0.12em] text-text-subtle mb-2">Architecture Stack</div>
        <div className="flex flex-col gap-3 mt-2 px-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0 bg-[#2563EB] shadow-[0_0_0_4px_rgba(37,99,235,0.10)]" />
            <div>
              <div className="text-[0.79rem] font-bold text-text-primary">Groq · Llama 3.3 70B</div>
              <div className="text-[0.68rem] text-text-subtle">Inference Layer</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0 bg-[#06B6D4] shadow-[0_0_0_4px_rgba(6,182,212,0.10)]" />
            <div>
              <div className="text-[0.79rem] font-bold text-text-primary">ChromaDB</div>
              <div className="text-[0.68rem] text-text-subtle">Medical Code Retrieval</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0 bg-[#8B5CF6] shadow-[0_0_0_4px_rgba(139,92,246,0.10)]" />
            <div>
              <div className="text-[0.79rem] font-bold text-text-primary">LangGraph</div>
              <div className="text-[0.68rem] text-text-subtle">Agent Orchestration</div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-none border-t border-border-base my-5" />
      
      <div className="px-2.5">
        <div className="px-2 text-[0.67rem] font-extrabold uppercase tracking-[0.12em] text-text-subtle mb-2">Model Routing Options</div>
        <div className="p-2.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md m-2 text-[0.75rem] text-[#065F46] leading-[1.5]">
          <strong>Smart Router Active:</strong> Utilizing Llama-3-8B local for basic extraction. Fallback to Gemini 2.0 Flash for complex density reasoning.
        </div>
      </div>

      <div className="flex-1" />

      <div className="m-2.5 mx-2.5 mb-4 bg-bg-panel border border-border-base rounded-md p-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0 bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,0.10)]" />
          <span className="text-[0.8rem] text-text-primary font-bold">System Status</span>
        </div>
        <div className="text-[0.72rem] text-text-muted mt-2 leading-[1.6]">
          All services healthy. Retrieval, validation, and escalation guardrails active.
        </div>
      </div>
    </div>
  );
}

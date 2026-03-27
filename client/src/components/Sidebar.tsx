import { NavLink } from "react-router-dom";
import clsx from "clsx";

export function Sidebar() {
  const currentRoutes = [
    { name: "Analyze Note", path: "/", dotColor: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-700" },
    { name: "Audit Trail", path: "/audit", dotColor: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-700" },
    { name: "Impact Dashboard", path: "/impact", dotColor: "bg-purple-500", lightBg: "bg-purple-50", textColor: "text-purple-700" },
    { name: "Test Scenarios", path: "/scenarios", dotColor: "bg-amber-500", lightBg: "bg-amber-50", textColor: "text-amber-700" },
  ];

  return (
    <div className="w-[280px] shrink-0 bg-[#F8FAFC] border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.01)] relative z-10 hidden md:flex">
      
      {/* Bespoke CSS Logo & Header */}
      <div className="p-6 pb-2 flex items-center gap-3">
        <div className="flex flex-col justify-center items-start w-10 h-10 rounded-xl bg-slate-900 p-2.5 shadow-md shadow-slate-900/10 border border-slate-800 shrink-0">
          <div className="w-5 h-[3px] bg-indigo-500 rounded-full mb-1"></div>
          <div className="w-3 h-[3px] bg-emerald-400 rounded-full"></div>
        </div>
        <div>
          <div className="text-[1.1rem] font-black text-slate-900 tracking-tight leading-none mb-1">HealthAI</div>
          <div className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-[0.15em]">Auto-Coding</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-6">
        
        {/* Navigation */}
        <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4 mt-8">Workspace</div>
        <nav className="flex flex-col gap-2">
          {currentRoutes.map((r) => (
            <NavLink
              key={r.path}
              to={r.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 text-[0.88rem] font-bold px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer group",
                isActive 
                  ? `bg-white shadow-sm ring-1 ring-slate-200/60 ${r.textColor}` 
                  : "text-slate-500 hover:bg-slate-200/40 hover:text-slate-800"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={clsx(
                    "transition-all duration-300 rounded-sm",
                    isActive ? `w-1.5 h-4 ${r.dotColor}` : "w-1.5 h-1.5 bg-slate-300 group-hover:bg-slate-400"
                  )} />
                  {r.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <hr className="border-none h-px bg-slate-200 my-8" />

        {/* Architecture Stack (Using Typographic Badges) */}
        <div>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4">Architecture Stack</div>
          <div className="flex flex-col gap-4">
            
            <div className="flex items-start gap-3 group">
              <div className="text-[0.6rem] font-mono font-bold text-blue-600 bg-blue-100/50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0 mt-0.5 transition-colors group-hover:bg-blue-100">
                /INF
              </div>
              <div>
                <div className="text-[0.82rem] font-bold text-slate-800">Llama 3.3 70B</div>
                <div className="text-[0.7rem] text-slate-500 font-medium">Inference Engine</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 group">
              <div className="text-[0.6rem] font-mono font-bold text-emerald-600 bg-emerald-100/50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0 mt-0.5 transition-colors group-hover:bg-emerald-100">
                /VEC
              </div>
              <div>
                <div className="text-[0.82rem] font-bold text-slate-800">ChromaDB</div>
                <div className="text-[0.7rem] text-slate-500 font-medium">Standard Code Retrieval</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 group">
              <div className="text-[0.6rem] font-mono font-bold text-purple-600 bg-purple-100/50 border border-purple-200 px-1.5 py-0.5 rounded shrink-0 mt-0.5 transition-colors group-hover:bg-purple-100">
                /ORC
              </div>
              <div>
                <div className="text-[0.82rem] font-bold text-slate-800">LangGraph Agents</div>
                <div className="text-[0.7rem] text-slate-500 font-medium">Pipeline Orchestration</div>
              </div>
            </div>

          </div>
        </div>

        <hr className="border-none h-px bg-slate-200 my-8" />
        
<div>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-1.5">
              Active Optimization
          </div>
          <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100/60 rounded-xl shadow-sm">
            <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-indigo-900 mb-1">
              Smart Routing Enabled
            </div>
            <div className="text-[0.75rem] text-indigo-800/80 leading-relaxed">
              Utilizing Llama-3-8B local for basic extraction. Automatic fallback to Gemini 2.0 Flash for complex clinical density.
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-5 border-t border-slate-200 bg-[#F8FAFC]">
        <div className="flex items-start gap-3">
          <div className="relative flex h-2 w-2 mt-1 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-[0.8rem] text-slate-900 font-bold mb-0.5">System Online</div>
            <div className="text-[0.7rem] text-slate-500 leading-relaxed pr-2">
              All pipelines healthy. Guardrails active.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
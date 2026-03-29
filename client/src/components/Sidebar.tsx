import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useAppContext } from "../context/AppContext";

export function Sidebar() {
  const { isDarkMode, toggleDarkMode } = useAppContext();
  
  const currentRoutes = [
    { name: "Analyze Note", path: "/", dotColor: "bg-blue-500", lightBg: "bg-blue-50 dark:bg-blue-500/10", textColor: "text-blue-700 dark:text-blue-400" },
    { name: "Audit Trail", path: "/audit", dotColor: "bg-emerald-500", lightBg: "bg-emerald-50 dark:bg-emerald-500/10", textColor: "text-emerald-700 dark:text-emerald-400" },
    { name: "Impact Dashboard", path: "/impact", dotColor: "bg-purple-500", lightBg: "bg-purple-50 dark:bg-purple-500/10", textColor: "text-purple-700 dark:text-purple-400" },
    { name: "Test Scenarios", path: "/scenarios", dotColor: "bg-amber-500", lightBg: "bg-amber-50 dark:bg-amber-500/10", textColor: "text-amber-700 dark:text-amber-400" },
  ];

  return (
    <div className="w-[280px] shrink-0 bg-[#F8FAFC] dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.01)] relative z-10 hidden md:flex">
      
      {/* Bespoke CSS Logo & Header */}
      <div className="p-6 pb-2 flex items-center gap-3">
        <div className="flex flex-col justify-center items-start w-10 h-10 rounded-xl bg-slate-900 p-2.5 shadow-md dark:shadow-slate-900/50 shadow-slate-900/10 border border-slate-800 shrink-0">
          <div className="w-5 h-[3px] bg-indigo-500 rounded-full mb-1"></div>
          <div className="w-3 h-[3px] bg-emerald-400 rounded-full"></div>
        </div>
        <div>
          <div className="text-[1.1rem] font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-1">HealthAI</div>
          <div className="text-[0.65rem] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.15em]">Auto-Coding</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-6">
        
        {/* Navigation */}
        <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4 mt-8">Workspace</div>
        <nav className="flex flex-col gap-2">
          {currentRoutes.map((r) => (
            <NavLink
              key={r.path}
              to={r.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 text-[0.88rem] font-bold px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer group",
                isActive 
                  ? `bg-white dark:bg-slate-800/80 shadow-sm dark:shadow-slate-900/50 ring-1 ring-slate-200/60 dark:ring-slate-700/50 ${r.textColor}` 
                  : "text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-200/40 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={clsx(
                    "transition-all duration-300 rounded-sm",
                    isActive ? `w-1.5 h-4 ${r.dotColor}` : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500"
                  )} />
                  {r.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <hr className="border-none h-px bg-slate-200 dark:bg-slate-800 my-8" />

        {/* Architecture Stack (Using Typographic Badges) */}
        <div>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4">Architecture Stack</div>
          <div className="flex flex-col gap-4">
            
            <div className="flex items-start gap-3 group">
              <div className="text-[0.6rem] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-1.5 py-0.5 rounded shrink-0 mt-0.5 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20">
                /INF
              </div>
              <div>
                <div className="text-[0.82rem] font-bold text-slate-800 dark:text-slate-200">Llama 3.3 70B</div>
                <div className="text-[0.7rem] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Inference Engine</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 group">
              <div className="text-[0.6rem] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0 mt-0.5 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20">
                /VEC
              </div>
              <div>
                <div className="text-[0.82rem] font-bold text-slate-800 dark:text-slate-200">ChromaDB</div>
                <div className="text-[0.7rem] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Standard Code Retrieval</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 group">
              <div className="text-[0.6rem] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-1.5 py-0.5 rounded shrink-0 mt-0.5 transition-colors group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20">
                /ORC
              </div>
              <div>
                <div className="text-[0.82rem] font-bold text-slate-800 dark:text-slate-200">LangGraph Agents</div>
                <div className="text-[0.7rem] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Pipeline Orchestration</div>
              </div>
            </div>

          </div>
        </div>

        <hr className="border-none h-px bg-slate-200 dark:bg-slate-800 my-8" />
        
        <div>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-3 ml-2 flex items-center gap-1.5">
              Active Optimization
          </div>
          <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/10 border border-indigo-100/60 dark:border-indigo-800/30 rounded-xl shadow-sm dark:shadow-slate-900/50">
            <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-indigo-900 dark:text-indigo-300 mb-1">
              Smart Routing Enabled
            </div>
            <div className="text-[0.75rem] text-indigo-800/80 dark:text-indigo-400/80 leading-relaxed">
              Utilizing Llama-3-8B local for basic extraction. Automatic fallback to Gemini 2.0 Flash for complex clinical density.
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0f172a] flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="relative flex h-2 w-2 mt-1 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-[0.8rem] text-slate-900 dark:text-slate-100 font-bold mb-0.5">System Online</div>
            <div className="text-[0.7rem] text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed pr-2">
              All pipelines healthy. Guardrails active.
            </div>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 dark:text-slate-500"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
          )}
        </button>
      </div>

    </div>
  );
}
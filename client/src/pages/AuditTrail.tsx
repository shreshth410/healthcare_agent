import { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { Alert } from "../components/Alert";
import { Badge } from "../components/Badge";
import { apiCall } from "../api";
import { 
  Database, Activity, CheckCircle2, AlertTriangle, FileWarning, 
  Hash, Clock, FileText, Code2, ShieldCheck, TerminalSquare, Search
} from "lucide-react";
import clsx from "clsx";

export function AuditTrail() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [auditData, setAuditData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("note");

  useEffect(() => {
    async function load() {
      try {
        const res = await apiCall("GET", "/sessions");
        if (res && res.sessions) {
          setSessions(res.sessions);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setAuditData(null);
      return;
    }
    async function fetchAudit() {
      try {
        const data = await apiCall("GET", `/audit/${selectedId}`);
        setAuditData(data);
      } catch (e) {
        console.error(e);
        setAuditData(null);
      }
    }
    fetchAudit();
  }, [selectedId]);

  const total = sessions.length;
  const cleanN = sessions.filter((s) => !s.escalated && !s.needs_clarification).length;
  const escN = sessions.filter((s) => s.escalated).length;
  const clarN = sessions.filter((s) => s.needs_clarification).length;
  const avgConf = total ? (sessions.reduce((acc, s) => acc + (s.overall_confidence || 0), 0) / total) : 0;

  const getStatusLabel = (s: any) => {
    if (s.escalated) return "Exception";
    if (s.needs_clarification) return "Override Req";
    return "Standard";
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <Hero
        title="Compliance Audit & Traceability"
        subtitle="Inspect historical coding sessions, AI extraction logic, validation matrices, and escalation routing. Designed for complete operational transparency."
        dateStr={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      />

      {/* Enhanced KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800"></div>
          <div className="text-[2rem] text-slate-900 font-black mb-1">{total}</div>
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-widest flex justify-center items-center gap-1.5"><Database size={12}/> Total</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="text-[2rem] text-slate-900 font-black mb-1">{cleanN}</div>
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-widest flex justify-center items-center gap-1.5"><CheckCircle2 size={12}/> Validated</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
          <div className="text-[2rem] text-slate-900 font-black mb-1">{escN}</div>
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-widest flex justify-center items-center gap-1.5"><AlertTriangle size={12}/> Exceptions</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          <div className="text-[2rem] text-slate-900 font-black mb-1">{clarN}</div>
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-widest flex justify-center items-center gap-1.5"><FileWarning size={12}/> Overrides</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          <div className="text-[2rem] text-slate-900 font-black mb-1">{Math.round(avgConf * 100)}%</div>
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-widest flex justify-center items-center gap-1.5"><Activity size={12}/> Mean Conf</div>
        </div>
      </div>

      {/* Modern Data Grid */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Database className="text-indigo-600" size={18} />
          <span className="font-bold text-[0.85rem] text-slate-800 uppercase tracking-widest">Transaction Ledger</span>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden ring-1 ring-slate-900/5">
          <div className="overflow-x-auto w-full hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Hash size={14}/> Hash ID</th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider"><div className="flex items-center gap-1.5"><Clock size={14}/> Timestamp</div></th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">Conf.</th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">ICD / CPT</th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">Payload Preview</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const stat = getStatusLabel(s);
                  return (
                    <tr 
                      key={s.session_id} 
                      onClick={() => setSelectedId(s.session_id)} 
                      className={clsx(
                        "border-b border-slate-100 cursor-pointer transition-all duration-200 text-[0.9rem] text-slate-700 group", 
                        selectedId === s.session_id 
                          ? "bg-indigo-50/50 hover:bg-indigo-50/80" 
                          : "hover:bg-slate-50"
                      )}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                         <span className={clsx(
                           "inline-flex items-center gap-1.5 px-3 py-1 text-[0.7rem] font-bold uppercase rounded-full border shadow-sm", 
                           stat === "Standard" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                           stat === "Exception" ? "bg-rose-50 text-rose-700 border-rose-200" : 
                           "bg-amber-50 text-amber-700 border-amber-200"
                         )}>
                           <div className={clsx(
                             "w-1.5 h-1.5 rounded-full",
                             stat === "Standard" ? "bg-emerald-500" : stat === "Exception" ? "bg-rose-500 animate-pulse" : "bg-amber-500 animate-pulse"
                           )}/>
                           {stat}
                         </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[0.85rem] font-bold text-indigo-900/80 group-hover:text-indigo-600 transition-colors">
                        {s.session_id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap text-[0.85rem]">
                        {s.timestamp?.substring(0, 16).replace("T", " ") || "—"}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <Badge confidence={s.overall_confidence || 0} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <div className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[0.75rem] font-bold text-slate-600 flex items-center gap-1" title="ICD-10 Codes">
                            <span className="text-indigo-400">I:</span> {s.icd10_count ?? "0"}
                          </div>
                          <div className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[0.75rem] font-bold text-slate-600 flex items-center gap-1" title="CPT Codes">
                            <span className="text-emerald-500">C:</span> {s.cpt_count ?? "0"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[0.85rem] truncate max-w-[250px]">
                        {s.raw_note_preview ? s.raw_note_preview.substring(0, 50) + "…" : "—"}
                      </td>
                    </tr>
                  );
                })}
                {sessions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-16 px-4 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Database size={48} className="mb-4 opacity-20" />
                        <div className="font-extrabold text-slate-700 text-[1.1rem] mb-1">Ledger Empty</div>
                        <div className="text-slate-500 text-[0.9rem]">Execute at least one processing cycle to populate the system ledger.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deep Inspection Panel */}
      {auditData && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
           <div className="flex items-center gap-2 mb-4">
             <Search className="text-indigo-600" size={18} />
             <span className="font-bold text-[0.85rem] text-slate-800 uppercase tracking-widest">Deep Inspection Lens <span className="text-indigo-500 font-mono tracking-normal ml-1">({selectedId.substring(0, 8).toUpperCase()})</span></span>
           </div>
           
           {/* Re-using your Alert logic */}
           <div className="mb-6 shadow-sm rounded-xl overflow-hidden">
             {(() => {
                const row = sessions.find((r) => r.session_id === selectedId);
                const stat = row ? getStatusLabel(row) : "Standard";
                if (stat === "Exception") return <Alert kind="danger" title="Transaction blocked due to algorithmic logic exception." />;
                if (stat === "Override Req") return <Alert kind="warning" title="Transaction required operator override before final execution." />;
                return <Alert kind="success" title="Transaction executed completely within standard logic parameters." />;
             })()}
           </div>

           <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 p-6 md:p-8 border border-slate-200/60">
             
             {/* Pill Navigation */}
             <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                {[
                  { id: "note", label: "Origin Document", icon: FileText },
                  { id: "schema", label: "Extraction Matrix", icon: TerminalSquare },
                  { id: "codes", label: "Output Array", icon: Code2 },
                  { id: "comp", label: "Compliance Log", icon: ShieldCheck }
                ].map(tab => (
                  <button 
                    key={tab.id} 
                    className={clsx(
                      "flex-1 whitespace-nowrap px-4 py-2.5 rounded-lg text-[0.9rem] font-bold transition-all duration-300 outline-none flex items-center justify-center gap-2", 
                      activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    )} 
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon size={16} className={activeTab === tab.id ? "text-indigo-500" : "text-slate-400"}/>
                    {tab.label}
                  </button>
                ))}
             </div>

             <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-[2] w-full overflow-hidden">
                  {activeTab === "note" && (
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 whitespace-pre-wrap text-[0.9rem] leading-relaxed font-mono text-slate-800 shadow-inner">
                      {auditData.raw_note_preview || "Data unavailable."}
                    </div>
                  )}
                  {activeTab === "schema" && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                      <h4 className="font-bold text-[0.85rem] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><TerminalSquare size={16}/> Pre-Validation Array</h4>
                      {/* Terminal UI styling for JSON */}
                      <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                        <div className="bg-slate-800/50 px-4 py-2 flex gap-2 border-b border-slate-700/50">
                          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                        </div>
                        <pre className="p-5 font-mono text-[0.8rem] text-indigo-200 overflow-x-auto custom-scrollbar">
                          {JSON.stringify(auditData.extraction_output || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {activeTab === "codes" && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                      <h4 className="font-bold text-[0.85rem] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Code2 size={16}/> Post-Validation Array</h4>
                      <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                         <div className="bg-slate-800/50 px-4 py-2 flex gap-2 border-b border-slate-700/50">
                          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                        </div>
                        <pre className="p-5 font-mono text-[0.8rem] text-emerald-200 overflow-x-auto custom-scrollbar">
                          {JSON.stringify(auditData.final_codes || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {activeTab === "comp" && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                      <h4 className="font-bold text-[0.85rem] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck size={16}/> Constraint Matrix</h4>
                      <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                         <div className="bg-slate-800/50 px-4 py-2 flex gap-2 border-b border-slate-700/50">
                          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                        </div>
                        <pre className="p-5 font-mono text-[0.8rem] text-amber-100/90 overflow-x-auto custom-scrollbar">
                          {JSON.stringify(auditData.compliance_result || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 w-full">
                   {activeTab === "note" && (
                     <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200">
                           <span className="text-[0.85rem] font-bold text-slate-500 flex items-center gap-2"><Hash size={14}/> Hash Key</span>
                           <span className="font-mono text-[0.9rem] font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded">{selectedId.substring(0,8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200">
                           <span className="text-[0.85rem] font-bold text-slate-500 flex items-center gap-2"><Activity size={14}/> System State</span>
                           <span className="text-[0.9rem] text-slate-800 font-bold">{sessions.find((r) => r.session_id === selectedId) ? getStatusLabel(sessions.find((r) => r.session_id === selectedId)) : "Standard"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[0.85rem] font-bold text-slate-500 flex items-center gap-2"><ShieldCheck size={14}/> Confidence Avg</span>
                           <Badge confidence={sessions.find((r) => r.session_id === selectedId)?.overall_confidence || 0} />
                        </div>
                     </div>
                   )}
                   {activeTab !== "note" && (
                      <div className="animate-in fade-in duration-500">
                        <h4 className="font-bold text-[0.85rem] text-slate-500 uppercase tracking-widest mb-3">Architecture Logic</h4>
                        <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[0.85rem] text-indigo-800/80 leading-relaxed shadow-sm">
                           {activeTab === "schema" && "Structured array representing identified clinical parameters prior to cross-referencing against vector tables. Used to debug LLM parsing logic."}
                           {activeTab === "codes" && "Final output array strictly verified by the operational logic constraint system. This represents the billing-ready payload."}
                           {activeTab === "comp" && "Complete telemetry of procedural edits, rule assessments, and array pruning logic. Proof of deterministic validation."}
                        </div>
                      </div>
                   )}
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
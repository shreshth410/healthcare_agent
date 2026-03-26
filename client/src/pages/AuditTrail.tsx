import { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { Alert } from "../components/Alert";
import { Badge } from "../components/Badge";
import { apiCall } from "../api";
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
    <div className="animate-fade-in">
      <Hero
        title="Compliance Audit & Traceability"
        subtitle="Inspect historical coding sessions, AI extraction logic, validation matrices, and escalation routing. Designed for complete operational transparency."
        dateStr={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      />

      <div className="flex gap-6 mt-6">
        <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
          <div className="text-[1.8rem] text-text-primary font-extrabold mb-1">{total}</div>
          <div className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.05em]">Total Transactions</div>
        </div>
        <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
          <div className="text-[1.8rem] text-text-primary font-extrabold mb-1">{cleanN}</div>
          <div className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.05em]">System Validated</div>
        </div>
        <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
          <div className="text-[1.8rem] text-text-primary font-extrabold mb-1">{escN}</div>
          <div className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.05em]">Exceptions</div>
        </div>
        <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
          <div className="text-[1.8rem] text-text-primary font-extrabold mb-1">{clarN}</div>
          <div className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.05em]">Overrides</div>
        </div>
        <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
          <div className="text-[1.8rem] text-text-primary font-extrabold mb-1">{Math.round(avgConf * 100)}%</div>
          <div className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.05em]">Mean Confidence</div>
        </div>
      </div>

      <div className="mt-6 mb-4">
        <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Transaction Ledger</span>
        <div className="bg-bg-surface border border-border-base rounded-lg shadow-sm overflow-hidden p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-bg-panel border-b border-border-base">
                  <th className="py-3 px-4 font-bold text-[0.8rem] text-text-muted uppercase tracking-[0.05em]">Status</th>
                  <th className="py-3 px-4 font-bold text-[0.8rem] text-text-muted uppercase tracking-[0.05em]">Hash ID</th>
                  <th className="py-3 px-4 font-bold text-[0.8rem] text-text-muted uppercase tracking-[0.05em]">Timestamp</th>
                  <th className="py-3 px-4 font-bold text-[0.8rem] text-text-muted uppercase tracking-[0.05em]">Conf.</th>
                  <th className="py-3 px-4 font-bold text-[0.8rem] text-text-muted uppercase tracking-[0.05em]">ICD</th>
                  <th className="py-3 px-4 font-bold text-[0.8rem] text-text-muted uppercase tracking-[0.05em]">CPT</th>
                  <th className="py-3 px-4 font-bold text-[0.8rem] text-text-muted uppercase tracking-[0.05em]">Payload Preview</th>
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
                        "border-b border-border-base cursor-pointer transition-colors text-[0.88rem] text-text-default hover:bg-[#F8FAFC]", 
                        selectedId === s.session_id && "bg-[#EEF4FF] hover:bg-[#EEF4FF]"
                      )}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                         <span className={clsx(
                           "inline-block px-2.5 py-1 text-[0.7rem] font-bold uppercase rounded-full border", 
                           stat === "Standard" ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]" : 
                           stat === "Exception" ? "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]" : 
                           "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
                         )}>
                           {stat}
                         </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[0.85rem] font-bold">{s.session_id.substring(0, 8).toUpperCase()}</td>
                      <td className="py-3 px-4 text-text-subtle whitespace-nowrap">{s.timestamp?.substring(0, 16).replace("T", " ") || "—"}</td>
                      <td className="py-3 px-4 font-semibold">{Math.round((s.overall_confidence || 0) * 100)}%</td>
                      <td className="py-3 px-4"><div className="w-6 h-6 rounded flex items-center justify-center bg-bg-panel border border-border-lite text-[0.75rem] font-bold text-text-muted">{s.icd10_count ?? "—"}</div></td>
                      <td className="py-3 px-4"><div className="w-6 h-6 rounded flex items-center justify-center bg-bg-panel border border-border-lite text-[0.75rem] font-bold text-text-muted">{s.cpt_count ?? "—"}</div></td>
                      <td className="py-3 px-4 text-text-subtle truncate max-w-[200px]">{s.raw_note_preview ? s.raw_note_preview.substring(0, 65) + "…" : "—"}</td>
                    </tr>
                  );
                })}
                {sessions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center">
                      <div className="font-extrabold text-text-primary text-[1.1rem] mb-2">Database Empty</div>
                      <div className="text-[#64748B] text-[0.9rem]">Execute at least one processing cycle to populate the system ledger.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {auditData && (
        <div className="animate-fade-in mt-8 pt-8 border-t border-border-base">
           <span className="section-label block mb-4 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Deep Inspection Lens ({selectedId.substring(0, 8).toUpperCase()})</span>
           
           {(() => {
              const row = sessions.find((r) => r.session_id === selectedId);
              const stat = row ? getStatusLabel(row) : "Standard";
              if (stat === "Exception") return <Alert kind="danger" title="Transaction blocked due to algorithmic logic exception." />;
              if (stat === "Override Req") return <Alert kind="warning" title="Transaction required operator override before final execution." />;
              return <Alert kind="success" title="Transaction executed completely within standard logic parameters." />;
           })()}

           <div className="flex border-b border-border-base gap-8 my-6">
              {["note", "schema", "codes", "comp"].map(key => {
                const labels: Record<string, string> = { note: "Origin Document", schema: "Extraction Matrix", codes: "Output Array", comp: "Compliance Log" };
                const label = labels[key];
                return (
                  <button 
                    key={key} 
                    className={clsx("bg-transparent border-none text-[0.9rem] font-bold text-text-muted py-3 border-b-4 border-transparent transition-all hover:text-text-primary", activeTab === key && "text-brand-blue border-b-brand-blue")} 
                    onClick={() => setActiveTab(key)}
                  >
                    {label}
                  </button>
                );
              })}
           </div>

           <div className="flex gap-6">
              <div style={{ flex: 2 }}>
                {activeTab === "note" && (
                  <div className="p-6 rounded-lg bg-bg-panel border border-border-base whitespace-pre-wrap text-[0.85rem] leading-[1.6] font-mono shadow-sm">
                    {auditData.raw_note_preview || "Data unavailable."}
                  </div>
                )}
                {activeTab === "schema" && (
                  <div>
                    <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Pre-Validation Structural Array</span>
                    <pre className="p-5 font-mono text-[0.75rem] text-text-default bg-bg-panel border border-border-base overflow-x-auto rounded-md shadow-sm">{JSON.stringify(auditData.extraction_output || {}, null, 2)}</pre>
                  </div>
                )}
                {activeTab === "codes" && (
                  <div>
                    <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Post-Validation Deliverables</span>
                    <pre className="p-5 font-mono text-[0.75rem] text-text-default bg-bg-panel border border-border-base overflow-x-auto rounded-md shadow-sm">{JSON.stringify(auditData.final_codes || {}, null, 2)}</pre>
                  </div>
                )}
                {activeTab === "comp" && (
                  <div>
                    <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Constraint Tracing Engine</span>
                    <pre className="p-5 font-mono text-[0.75rem] text-text-default bg-bg-panel border border-border-base overflow-x-auto rounded-md shadow-sm">{JSON.stringify(auditData.compliance_result || {}, null, 2)}</pre>
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                 {activeTab === "note" && (
                   <div className="p-6 bg-bg-surface border border-border-base rounded-lg shadow-sm">
                      <div className="flex justify-between pb-3 mb-4 border-b border-border-base">
                         <span className="text-[0.8rem] font-bold text-text-subtle">Hash</span>
                         <span className="font-mono text-[0.85rem] text-text-primary">{selectedId.substring(0,8).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between pb-3 mb-4 border-b border-border-base">
                         <span className="text-[0.8rem] font-bold text-text-subtle">State</span>
                         <span className="text-[0.85rem] text-text-primary font-semibold">{sessions.find((r) => r.session_id === selectedId) ? getStatusLabel(sessions.find((r) => r.session_id === selectedId)) : "Standard"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[0.8rem] font-bold text-text-subtle">Conf.</span>
                         <Badge confidence={sessions.find((r) => r.session_id === selectedId)?.overall_confidence || 0} />
                      </div>
                   </div>
                 )}
                 {activeTab !== "note" && (
                    <>
                      <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Architecture Note</span>
                      <div className="p-4 bg-bg-panel border border-border-base rounded-lg text-[0.82rem] text-text-muted leading-[1.6] shadow-sm">
                         {activeTab === "schema" && "Structured array representing identified clinical parameters prior to cross-referencing against vector tables."}
                         {activeTab === "codes" && "Final output array strictly verified by the operational logic constraint system."}
                         {activeTab === "comp" && "Complete telemetry of procedural edits, rule assessments, and array pruning logic."}
                      </div>
                    </>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

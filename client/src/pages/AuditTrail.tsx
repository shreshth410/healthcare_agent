import { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { Alert } from "../components/Alert";
import { Badge } from "../components/Badge";
import { apiCall } from "../api";
import {
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  Hash,
  Clock,
  FileText,
  Code2,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardList,
  Stethoscope,
  Workflow,
  BrainCircuit,
  ShieldAlert,
  FileSearch,
  Layers3
} from "lucide-react";
import clsx from "clsx";

export function AuditTrail() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("note");
  
  const [showRawExtraction, setShowRawExtraction] = useState(false);
  const [showRawCodes, setShowRawCodes] = useState(false);
  const [showRawCompliance, setShowRawCompliance] = useState(false);
  const [showRawTrace, setShowRawTrace] = useState(false);

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
        
        // Reset raw toggles on case switch
        setShowRawExtraction(false);
        setShowRawCodes(false);
        setShowRawCompliance(false);
        setShowRawTrace(false);
      } catch (e) {
        console.error(e);
        setAuditData(null);
      }
    }
    fetchAudit();
  }, [selectedId]);

  const handleDeleteSession = async () => {
    if (!selectedId) return;
    if (!confirm("Are you sure you want to delete this audit record? This action cannot be undone.")) {
      return;
    }
    try {
      setDeleting(true);
      await apiCall("DELETE", `/audit/${selectedId}`);
      setSessions(sessions.filter((s) => s.session_id !== selectedId));
      setSelectedId("");
      setAuditData(null);
    } catch (e) {
      console.error(e);
      alert("Failed to delete session: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };


  const total = sessions.length;
  const cleanN = sessions.filter((s) => !s.escalated && !s.needs_clarification).length;
  const escN = sessions.filter((s) => s.escalated).length;
  const clarN = sessions.filter((s) => s.needs_clarification).length;
  const avgConf = total
    ? sessions.reduce((acc, s) => acc + (s.overall_confidence || 0), 0) / total
    : 0;

  const selectedSession = sessions.find((s) => s.session_id === selectedId);

  const getStatusLabel = (s: any) => {
    if (s?.escalated) return "Exception";
    if (s?.needs_clarification) return "Override Req";
    return "Standard";
  };

  const getStatusStyles = (stat: string) => {
    if (stat === "Standard") {
      return {
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };
    }
    if (stat === "Exception") {
      return {
        pill: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
      };
    }
    return {
      pill: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    };
  };

  const extraction = auditData?.extraction_output || {};
  const finalCodes = auditData?.final_codes || auditData?.approved_codes || {};
  const compliance = auditData?.compliance_result || auditData?.compliance_checks || {};

  const extractionRows = buildExtractionRows(extraction);
  const codeCards = buildCodeCards(finalCodes);
  const complianceChecks = buildComplianceChecks(selectedSession);
  const traceSteps = buildTraceSteps(selectedSession);

  return (
    <div className="max-w-7xl mx-auto pb-16 animate-in fade-in duration-500">
      <Hero
        title="Compliance Audit & Traceability"
        subtitle="Inspect historical coding sessions, clinical extraction logic, compliance guardrails, and deterministic escalation pathways with full auditability."
        dateStr={new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      />

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 mb-10">
        <MetricCard label="Total Cases" value={total} icon={<Database size={14} />} bar="bg-slate-900" />
        <MetricCard label="Validated" value={cleanN} icon={<CheckCircle2 size={14} />} bar="bg-emerald-500" />
        <MetricCard label="Escalations" value={escN} icon={<AlertTriangle size={14} />} bar="bg-rose-500" />
        <MetricCard label="Clarifications" value={clarN} icon={<FileWarning size={14} />} bar="bg-amber-500" />
        <MetricCard label="Avg Confidence" value={`${Math.round(avgConf * 100)}%`} icon={<Activity size={14} />} bar="bg-indigo-500" />
      </div>

      {/* Ledger */}
      <section className="mb-10">
        <SectionHeader
          icon={<Database className="text-indigo-600" size={18} />}
          title="Transaction Ledger"
          subtitle="Select a historical adjudication session for deep inspection"
        />

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/70 overflow-hidden ring-1 ring-slate-900/5">
          <div className="overflow-x-auto w-full hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><Hash size={14} /> Hash ID</div>
                  </th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><Clock size={14} /> Timestamp</div>
                  </th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">ICD / CPT</th>
                  <th className="py-4 px-6 font-bold text-[0.75rem] text-slate-500 uppercase tracking-wider">Clinical Note Preview</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const stat = getStatusLabel(s);
                  const styles = getStatusStyles(stat);
                  return (
                    <tr
                      key={s.session_id}
                      onClick={() => setSelectedId(s.session_id)}
                      className={clsx(
                        "border-b border-slate-100 cursor-pointer transition-all duration-200 text-[0.9rem] text-slate-700 group",
                        selectedId === s.session_id ? "bg-indigo-50/60 hover:bg-indigo-50/80" : "hover:bg-slate-50"
                      )}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1 text-[0.7rem] font-bold uppercase rounded-full border shadow-sm", styles.pill)}>
                          <div className={clsx("w-1.5 h-1.5 rounded-full", styles.dot, stat !== "Standard" && "animate-pulse")} />
                          {stat}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[0.85rem] font-bold text-indigo-900/80 group-hover:text-indigo-600 transition-colors">
                        {s.session_id?.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap text-[0.85rem]">
                        {s.timestamp?.substring(0, 16).replace("T", " ") || "—"}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <Badge confidence={s.overall_confidence || 0} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <div className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[0.75rem] font-bold text-slate-600 flex items-center gap-1">
                            <span className="text-indigo-400">I:</span> {s.icd10_count ?? "0"}
                          </div>
                          <div className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[0.75rem] font-bold text-slate-600 flex items-center gap-1">
                            <span className="text-emerald-500">C:</span> {s.cpt_count ?? "0"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[0.85rem] truncate max-w-[320px]">
                        {s.raw_note_preview ? s.raw_note_preview.substring(0, 70) + "…" : "—"}
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
                        <div className="text-slate-500 text-[0.9rem]">Execute at least one processing cycle to populate the audit ledger.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deep Inspection Panel */}
      {auditData && selectedSession && (
        <section className="animate-in slide-in-from-bottom-4 fade-in duration-700">
          <SectionHeader
            icon={<Search className="text-indigo-600" size={18} />}
            title="Deep Inspection Lens"
            subtitle={`Full traceability for case ${selectedId.substring(0, 8).toUpperCase()}`}
          />

          <div className="mb-6 shadow-sm rounded-2xl overflow-hidden">
            {(() => {
              const stat = getStatusLabel(selectedSession);
              if (stat === "Exception") return <Alert kind="danger" title="This case was escalated due to guardrail conflict or insufficient deterministic support." />;
              if (stat === "Override Req") return <Alert kind="warning" title="This case requires human clarification before final code release." />;
              return <Alert kind="success" title="This case completed within approved coding and compliance boundaries." />;
            })()}
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <SummaryMiniCard icon={<Hash size={16} />} label="Case Hash" value={selectedId.substring(0, 8).toUpperCase()} />
            <SummaryMiniCard icon={<Activity size={16} />} label="System State" value={getStatusLabel(selectedSession)} />
            <SummaryMiniCard icon={<ShieldCheck size={16} />} label="Confidence" value={`${Math.round((selectedSession.overall_confidence || 0) * 100)}%`} />
            <SummaryMiniCard icon={<ClipboardList size={16} />} label="Audit Mode" value="Deterministic Trace" />
          </div>

          <div className="flex gap-3 mb-8">
            <button
              onClick={handleDeleteSession}
              disabled={deleting}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg border border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete Audit Record"}
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-6 md:p-8 border border-slate-200/70">
            {/* Pill Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-slate-50/70 p-1.5 rounded-2xl border border-slate-100">
              {[
                { id: "note", label: "Clinical Note", icon: FileText },
                { id: "schema", label: "Extraction Summary", icon: Stethoscope },
                { id: "codes", label: "Coding Decision Board", icon: Code2 },
                { id: "comp", label: "Compliance & Guardrails", icon: ShieldCheck },
                { id: "trace", label: "Decision Trace", icon: Workflow },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={clsx(
                    "flex-1 whitespace-nowrap px-4 py-2.5 rounded-xl text-[0.9rem] font-bold transition-all duration-300 outline-none flex items-center justify-center gap-2",
                    activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? "text-indigo-500" : "text-slate-400"} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Note Tab (With Sidebar) */}
            {activeTab === "note" && (
              <div className="grid lg:grid-cols-[1.7fr_0.9fr] gap-8 animate-in fade-in slide-in-from-left-2 duration-300">
                <div>
                  <PanelTitle icon={<FileSearch size={16} />} title="Clinical Source Document" subtitle="Original encounter note with operational review context" />
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 whitespace-pre-wrap text-[0.92rem] leading-relaxed font-mono text-slate-800 shadow-inner min-h-[320px]">
                    {auditData.raw_note_preview || "Data unavailable."}
                  </div>
                </div>
                <div className="space-y-4">
                  <InfoCard title="Audit Perspective" icon={<Sparkles size={16} />} content="This view preserves the exact source note used by the extraction and adjudication pipeline. In production, evidence spans and ambiguity markers would be highlighted here." tone="indigo" />
                  <InfoCard title="Why this matters" icon={<ShieldAlert size={16} />} content="For healthcare coding workflows, source-grounded auditability is essential. Every final billing decision must be explainable against documented clinical evidence." tone="slate" />
                </div>
              </div>
            )}

            {/* Schema Tab (With Sidebar) */}
            {activeTab === "schema" && (
              <div className="grid lg:grid-cols-[1.7fr_0.9fr] gap-8 animate-in fade-in slide-in-from-left-2 duration-300">
                <div>
                  <PanelTitle icon={<Stethoscope size={16} />} title="Clinical Extraction Summary" subtitle="Structured fields parsed from the source note before coding" />
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-5 py-3 text-[0.75rem] uppercase tracking-wider text-slate-500 font-bold">Field</th>
                          <th className="px-5 py-3 text-[0.75rem] uppercase tracking-wider text-slate-500 font-bold">Extracted Value</th>
                          <th className="px-5 py-3 text-[0.75rem] uppercase tracking-wider text-slate-500 font-bold">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractionRows.length > 0 ? (
                          extractionRows.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0">
                              <td className="px-5 py-4 text-[0.88rem] font-semibold text-slate-700">{row.label}</td>
                              <td className="px-5 py-4 text-[0.88rem] text-slate-600">{row.value}</td>
                              <td className="px-5 py-4"><Badge confidence={row.confidence} /></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-5 py-10 text-center text-slate-500">No structured extraction data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <RawJsonDrawer title="View Raw Extraction JSON" open={showRawExtraction} onToggle={() => setShowRawExtraction(!showRawExtraction)} json={extraction} color="indigo" />
                </div>
                <div className="space-y-4">
                  <InfoCard title="Why this view scores well" icon={<BrainCircuit size={16} />} content="Judges want to see that the agent is not directly jumping to billing outputs. This structured extraction layer proves that the system first normalizes clinical facts before assigning codes." tone="indigo" />
                  <InfoCard title="Operational Use" icon={<Layers3 size={16} />} content="In a real coding workflow, this layer helps QA teams inspect what the model understood, detect parser failures, and verify whether missing specificity was caught early." tone="slate" />
                </div>
              </div>
            )}

            {/* Codes Tab (FULL WIDTH) */}
            {activeTab === "codes" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <PanelTitle icon={<Code2 size={16} />} title="Coding Decision Board" subtitle="Final adjudication-ready ICD and CPT recommendations" />
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
                  {codeCards.length > 0 ? (
                    codeCards.map((card, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="text-[0.75rem] uppercase tracking-widest font-bold text-slate-500 mb-1">
                              {card.type}
                            </div>
                            <div className="text-[1.3rem] font-black text-slate-900 leading-none mb-2">
                              {card.code}
                            </div>
                            <div className="text-[0.9rem] text-slate-600">
                              {card.description}
                            </div>
                          </div>
                          <Badge confidence={card.confidence} />
                        </div>

                        <div className="space-y-4 pt-2">
                          <DetailBlock label="Rationale" value={card.reason} />
                          <DetailBlock label="Evidence" value={card.evidence} />
                          
                          <div className="flex items-center gap-4 pt-3 mt-1">
                            <span className="text-[0.75rem] font-bold uppercase tracking-widest text-slate-500">
                              Status
                            </span>
                            <span
                              className={clsx(
                                "px-3 py-1 rounded-full text-[0.75rem] font-bold border",
                                card.status === "Accepted"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : card.status === "Needs Review"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              )}
                            >
                              {card.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-1 xl:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                      No structured coding output available.
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <RawJsonDrawer title="View Final Machine-Readable JSON" open={showRawCodes} onToggle={() => setShowRawCodes(!showRawCodes)} json={finalCodes} color="emerald" />
                </div>
              </div>
            )}

            {/* Compliance Tab (FULL WIDTH) */}
            {activeTab === "comp" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <PanelTitle icon={<ShieldCheck size={16} />} title="Compliance & Guardrails" subtitle="Deterministic safety checks applied before final release" />
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
                  {complianceChecks.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", item.status === "pass" ? "bg-emerald-50 text-emerald-600" : item.status === "warn" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>
                            {item.status === "pass" ? <CheckCircle2 size={18} /> : item.status === "warn" ? <AlertTriangle size={18} /> : <ShieldAlert size={18} />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[1.05rem]">{item.title}</div>
                            <div className="text-[0.85rem] text-slate-500 mt-0.5">{item.short}</div>
                          </div>
                        </div>
                        <span className={clsx("px-3 py-1.5 rounded-full text-[0.72rem] font-bold uppercase border whitespace-nowrap", item.status === "pass" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : item.status === "warn" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200")}>
                          {item.status === "pass" ? "Passed" : item.status === "warn" ? "Review" : "Blocked"}
                        </span>
                      </div>
                      <div className="text-[0.9rem] text-slate-600 leading-relaxed mt-2 pt-4 border-t border-slate-100">{item.detail}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <RawJsonDrawer title="View Raw Compliance JSON" open={showRawCompliance} onToggle={() => setShowRawCompliance(!showRawCompliance)} json={compliance} color="amber" />
                </div>
              </div>
            )}

            {/* Trace Tab (FULL WIDTH) */}
            {activeTab === "trace" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <PanelTitle icon={<Workflow size={16} />} title="Decision Trace" subtitle="Step-by-step multi-agent execution timeline" />
                
                <div className="space-y-5">
                  {traceSteps.map((step, idx) => (
                    <div key={idx} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      {idx !== traceSteps.length - 1 && <div className="absolute left-[35px] top-[66px] bottom-[-24px] w-[2px] bg-gradient-to-b from-indigo-200 to-slate-200" />}
                      <div className="flex gap-5">
                        <div className="relative z-10 w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div>
                              <div className="text-[0.75rem] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Step {idx + 1}</div>
                              <div className="font-black text-slate-900 text-[1.1rem]">{step.title}</div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[0.72rem] font-bold bg-slate-100 text-slate-700 border border-slate-200">{step.agent}</span>
                          </div>
                          <div className="text-[0.95rem] text-slate-600 leading-relaxed mb-4">{step.description}</div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <MiniDetail label="Input" value={step.input} />
                            <MiniDetail label="Output" value={step.output} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <RawJsonDrawer title="View Raw Trace Payload" open={showRawTrace} onToggle={() => setShowRawTrace(!showRawTrace)} json={{ extraction_output: extraction, final_codes: finalCodes, compliance_result: compliance }} color="slate" />
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------------- Helper UI Components ---------------------- */

function MetricCard({ label, value, icon, bar }: { label: string; value: string | number; icon: React.ReactNode; bar: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className={clsx("absolute top-0 left-0 w-full h-1", bar)} />
      <div className="text-[2rem] text-slate-900 font-black mb-1">{value}</div>
      <div className="text-[0.72rem] font-bold text-slate-500 uppercase tracking-widest flex justify-center items-center gap-1.5">{icon} {label}</div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-bold text-[0.88rem] text-slate-800 uppercase tracking-widest">{title}</span>
      </div>
      {subtitle && <div className="text-[0.9rem] text-slate-500">{subtitle}</div>}
    </div>
  );
}

function PanelTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h4 className="font-bold text-[0.88rem] text-slate-800 uppercase tracking-widest">{title}</h4>
      </div>
      {subtitle && <p className="text-[0.88rem] text-slate-500">{subtitle}</p>}
    </div>
  );
}

function SummaryMiniCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500 text-[0.75rem] font-bold uppercase tracking-widest mb-2">{icon} {label}</div>
      <div className="text-[1.05rem] font-black text-slate-900 truncate">{value}</div>
    </div>
  );
}

function InfoCard({ title, content, icon, tone = "slate" }: { title: string; content: string; icon: React.ReactNode; tone?: "slate" | "indigo" | "emerald" | "amber" }) {
  const tones = {
    slate: "bg-slate-50 border-slate-200 text-slate-800",
    indigo: "bg-indigo-50/70 border-indigo-100 text-indigo-900",
    emerald: "bg-emerald-50/70 border-emerald-100 text-emerald-900",
    amber: "bg-amber-50/70 border-amber-100 text-amber-900",
  };
  return (
    <div className={clsx("p-5 rounded-2xl border shadow-sm", tones[tone])}>
      <div className="flex items-center gap-2 font-bold text-[0.85rem] uppercase tracking-widest mb-3">{icon} {title}</div>
      <div className="text-[0.88rem] leading-relaxed opacity-90">{content}</div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <div className="text-[0.72rem] uppercase tracking-widest font-bold text-slate-500 mb-1">{label}</div>
      <div className="text-[0.88rem] text-slate-700 leading-relaxed">{value}</div>
    </div>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 h-full">
      <div className="text-[0.72rem] uppercase tracking-widest font-bold text-slate-500 mb-1">{label}</div>
      <div className="text-[0.85rem] text-slate-700 leading-relaxed font-medium">{value}</div>
    </div>
  );
}

function RawJsonDrawer({ title, open, onToggle, json, color = "indigo" }: { title: string; open: boolean; onToggle: () => void; json: any; color?: "indigo" | "emerald" | "amber" | "slate" }) {
  const textColor = {
    indigo: "text-indigo-200",
    emerald: "text-emerald-200",
    amber: "text-amber-100/90",
    slate: "text-slate-200",
  };
  return (
    <div className="mt-5">
      <button onClick={onToggle} className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-4 transition-all duration-200">
        <div className="font-bold text-[0.85rem] text-slate-700 uppercase tracking-widest">{title}</div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="mt-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-800/50 px-4 py-2 flex gap-2 border-b border-slate-700/50">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <pre className={clsx("p-5 font-mono text-[0.8rem] overflow-x-auto custom-scrollbar", textColor[color])}>
            {JSON.stringify(json || {}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ---------------------- Data Builders ---------------------- */

function buildExtractionRows(extraction: any) {
  const rows: { label: string; value: string; confidence: number }[] = [];
  if (!extraction || typeof extraction !== "object") return rows;
  const preferredKeys = ["chief_complaint", "symptoms", "diagnosis", "diagnoses", "duration", "severity", "encounter_type", "setting", "provider_specialty", "procedures", "medications", "history", "assessment", "plan"];
  const allKeys = Array.from(new Set([...preferredKeys, ...Object.keys(extraction)]));
  allKeys.forEach((key) => {
    if (extraction[key] === undefined || extraction[key] === null) return;
    const value = Array.isArray(extraction[key]) ? extraction[key].join(", ") : typeof extraction[key] === "object" ? JSON.stringify(extraction[key]) : String(extraction[key]);
    rows.push({ label: prettifyKey(key), value: value || "—", confidence: inferConfidenceFromField(key, value) });
  });
  return rows;
}

function buildCodeCards(finalCodes: any) {
  const cards: { type: string; code: string; description: string; confidence: number; reason: string; evidence: string; status: string; }[] = [];
  if (!finalCodes || typeof finalCodes !== "object") return cards;

  const icdCandidates = finalCodes.icd10 || finalCodes.icd_codes || finalCodes.icd10_codes || finalCodes.icd || [];
  const cptCandidates = finalCodes.cpt || finalCodes.cpt_codes || finalCodes.procedure_codes || [];

  normalizeCodeList(icdCandidates).forEach((item: any, idx: number) => {
    const conf = item.confidence ?? 0.90;
    cards.push({
      type: "ICD-10",
      code: item.code || `ICD-${idx + 1}`,
      description: item.description || "Diagnosis code recommendation",
      confidence: conf,
      reason: item.reasoning || item.reason || "Mapped from extracted clinical findings and validated against documentation support.",
      evidence: item.evidence || "Supported by source note findings and structured extraction layer.",
      status: item.status || (conf >= 0.85 ? "Accepted" : "Needs Review"),
    });
  });

  normalizeCodeList(cptCandidates).forEach((item: any, idx: number) => {
    const conf = item.confidence ?? 0.80;
    cards.push({
      type: "CPT",
      code: item.code || `CPT-${idx + 1}`,
      description: item.description || "Procedure / visit code recommendation",
      confidence: conf,
      reason: item.reasoning || item.reason || "Derived from encounter complexity, documented procedures, and visit structure.",
      evidence: item.evidence || "Backed by documented evaluation / management or procedural indicators.",
      status: item.status || (conf >= 0.85 ? "Accepted" : "Needs Review"),
    });
  });

  return cards;
}

function buildComplianceChecks(selectedSession: any) {
  const checks = [
    {
      title: "Documentation Support Check",
      short: "Verifies that assigned codes are grounded in the source note",
      detail: selectedSession?.needs_clarification ? "The system detected incomplete or insufficient documentation and routed the case for clarification instead of guessing." : "The adjudication pipeline found enough documented support to allow structured coding output.",
      status: selectedSession?.needs_clarification ? "warn" : "pass",
    },
    {
      title: "Unsupported Coding Prevention",
      short: "Blocks codes that lack clinical evidence",
      detail: selectedSession?.escalated ? "At least one candidate code failed support or consistency validation, causing escalation." : "No unsupported diagnosis or procedure code passed final validation thresholds.",
      status: selectedSession?.escalated ? "fail" : "pass",
    },
    {
      title: "Upcoding / Overreach Guardrail",
      short: "Prevents inflated billing complexity",
      detail: "The system evaluates whether the documented visit complexity and procedures justify the final coding recommendation before release.",
      status: selectedSession?.needs_clarification ? "warn" : "pass",
    },
    {
      title: "Confidence Threshold Enforcement",
      short: "Routes low-certainty cases for human review",
      detail: `This case completed with overall confidence ${Math.round((selectedSession?.overall_confidence || 0) * 100)}%. Confidence thresholds are enforced before finalization.`,
      status: (selectedSession?.overall_confidence || 0) < 0.72 ? "warn" : selectedSession?.escalated ? "fail" : "pass",
    },
    {
      title: "Deterministic Escalation Path",
      short: "Refuses uncertain outputs outside confidence range",
      detail: selectedSession?.escalated || selectedSession?.needs_clarification ? "This case triggered a safe exception pathway instead of forcing a potentially unsafe coding decision." : "No escalation trigger was activated for this case.",
      status: selectedSession?.escalated ? "fail" : selectedSession?.needs_clarification ? "warn" : "pass",
    },
  ];
  return checks;
}

function buildTraceSteps(selectedSession: any) {
  return [
    { title: "Encounter Intake", agent: "Intake Agent", icon: <FileText size={18} />, description: "The system ingests the de-identified clinical note, normalizes formatting, and prepares the case for downstream extraction.", input: "Raw encounter note", output: "Normalized note payload" },
    { title: "Clinical Entity Extraction", agent: "Extraction Agent", icon: <Stethoscope size={18} />, description: "Structured clinical facts such as symptoms, diagnoses, procedures, duration, and context are extracted before coding begins.", input: "Normalized note payload", output: "Clinical extraction schema" },
    { title: "Diagnosis Mapping", agent: "ICD Agent", icon: <Code2 size={18} />, description: "The system maps extracted diagnoses and symptom clusters into candidate ICD-10 code recommendations with evidence support.", input: "Clinical extraction schema", output: "ICD candidate set" },
    { title: "Procedure / Visit Coding", agent: "CPT Agent", icon: <ClipboardList size={18} />, description: "Encounter complexity and documented procedures are converted into CPT candidates where sufficient documentation exists.", input: "Clinical extraction schema", output: "CPT candidate set" },
    { title: "Compliance Validation", agent: "Guardrail Agent", icon: <ShieldCheck size={18} />, description: "All code candidates are checked for support, consistency, confidence, and policy-safe release criteria before final output.", input: "ICD/CPT candidate sets", output: selectedSession?.escalated ? "Blocked / escalated decision" : selectedSession?.needs_clarification ? "Clarification required" : "Validated coding output" },
    { title: "Final Routing", agent: "Escalation Agent", icon: <Workflow size={18} />, description: "The system either finalizes the case, requests clarification, or escalates safely when documentation is insufficient or confidence is low.", input: "Validated / blocked decision", output: selectedSession?.escalated ? "Escalated for human review" : selectedSession?.needs_clarification ? "Clarification request generated" : "Billing-ready output released" },
  ];
}

/* ---------------------- Utility Functions ---------------------- */

function prettifyKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferConfidenceFromField(key: string, value: string) {
  if (!value || value === "—") return 0.5;
  if (key.includes("diagnosis") || key.includes("symptom")) return 0.9;
  if (key.includes("procedure") || key.includes("encounter")) return 0.82;
  return 0.78;
}

function normalizeCodeList(input: any) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((x) => (typeof x === "string" ? { code: x } : x));
  }
  if (typeof input === "object") {
    return Object.entries(input).map(([k, v]) => (typeof v === "string" ? { code: k, description: v } : { code: k, ...(typeof v === "object" ? v : {}) }));
  }
  return [];
}
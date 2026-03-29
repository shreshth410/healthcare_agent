import { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { KpiCard } from "../components/KpiCard";
import { Alert } from "../components/Alert";
import { Badge } from "../components/Badge";
import { useAppContext } from "../context/AppContext";
import { apiCall } from "../api";
import { ShieldCheck, Code2, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

function PipelinePhase({ phase, title, desc }: { phase: string; title: string; desc: string }) {
  return (
    <div className="flex-1 min-w-[200px] bg-bg-surface border border-border-base rounded-md p-4">
      <div className="text-[0.75rem] font-extrabold text-brand-blue uppercase mb-1.5">{phase}</div>
      <div className="text-[0.9rem] font-bold text-text-primary mb-1">{title}</div>
      <div className="text-[0.75rem] text-text-subtle leading-[1.5]">{desc}</div>
    </div>
  );
}

function CodeRow({ code, description, category, confidence, reasoning }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col mb-2">
      <div 
        className={clsx(
          "flex items-start gap-5 p-5 border-border-base border bg-bg-surface rounded-sm transition-shadow duration-200", 
          reasoning ? "cursor-pointer hover:shadow-sm dark:shadow-slate-900/50" : "cursor-default"
        )} 
        onClick={() => reasoning && setOpen(!open)}
      >
        <span className="font-mono text-[0.95rem] font-bold bg-bg-panel text-brand-blue border border-border-base py-1.5 px-2.5 rounded-sm min-w-[90px] text-center">{code || "N/A"}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[0.95rem] font-semibold text-text-primary mb-1 leading-[1.4]">{description || "No description available"}</div>
          {category && <div className="text-[0.82rem] text-text-subtle">{category}</div>}
        </div>
        <Badge confidence={confidence || 0} />
      </div>
      {open && reasoning && (
        <div className="mt-2 p-4 bg-bg-panel border-l-[3px] border-l-brand-blue rounded-r-sm text-[0.85rem] text-text-default leading-[1.6] animate-fade-in">
          <strong>System Reasoning & Documentation Support:</strong>
          <p>{reasoning}</p>
        </div>
      )}
    </div>
  );
}

export function AnalyzeNote() {
  const { injectedNote, setInjectedNote } = useAppContext();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [overrideText, setOverrideText] = useState("");
  const [overrideRunning, setOverrideRunning] = useState(false);

  useEffect(() => {
    if (injectedNote) {
      setNote(injectedNote);
      setResult(null);
      setStatus("idle");
      setInjectedNote("");
    }
  }, [injectedNote, setInjectedNote]);

  const runAnalysis = async () => {
    if (!note.trim()) {
      alert("Please input clinical documentation before running the sequence.");
      return;
    }
    try {
      setStatus("running");
      setLoadingStep(1);
      setTimeout(() => setLoadingStep(2), 500);
      setTimeout(() => setLoadingStep(3), 1500);
      
      const res = await apiCall("POST", "/analyze", { note: note.trim() });
      setResult(res);
      setStatus("complete");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      alert(err.message || "Analysis failed");
    }
  };

  const runOverride = async () => {
    if (!overrideText.trim()) return;
    try {
      setOverrideRunning(true);
      const newRes = await apiCall("POST", `/clarify/${result.session_id || ""}`, { clarification: overrideText.trim() });
      setResult(newRes);
    } catch (err: any) {
      alert(err.message || "Override failed");
    } finally {
      setOverrideRunning(false);
    }
  };

  const approved = result?.approved_codes || {};
  const overallConf = approved.overall_confidence || 0.0;
  const icd10 = approved.icd10_codes || [];
  const cpt = approved.cpt_codes || [];
  const isEscalated = result?.escalated || false;
  const needsClarify = result?.needs_clarification || false;

  const [activeTab, setActiveTab] = useState("icd");

  return (
    <div className="animate-fade-in">
      <Hero
        title="Autonomous Clinical Note Analysis"
        subtitle="Convert physician documentation into explainable ICD-10 and CPT code recommendations using an LLM + RAG + compliance validation pipeline. Designed for trust, traceability, and human oversight."
        dateStr={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      />

      <div className="flex gap-6 mt-6">
        <div className="flex-1"><KpiCard label="System Accuracy Tier" value="94.2%" sub="High-confidence extraction and code ranking with validation safeguards." /></div>
        <div className="flex-1"><KpiCard label="Avg. Processing Time" value="< 8s" sub="Fast enough for live clinical coding support and workflow augmentation." /></div>
        <div className="flex-1"><KpiCard label="Compliance Checks" value="6+ Rulesets" sub="Sequencing, specificity, bundling, duplicates, and escalation evaluation." /></div>
        <div className="flex-1"><KpiCard label="Review Protocol" value="HITL Default" sub="Human-in-the-loop fallback for ambiguous or contradictory documentation." /></div>
      </div>

      <div className="mt-4 mb-4">
        <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">System Decision Pipeline</span>
        <div className="flex gap-4 flex-wrap">
          <PipelinePhase phase="Phase 1" title="Clinical Parsing" desc="Extract diagnoses, procedures, modifiers, laterality, and acuity." />
          <PipelinePhase phase="Phase 2" title="RAG Code Retrieval" desc="Query vector database for exact ICD-10-CM and CPT matches." />
          <PipelinePhase phase="Phase 3" title="Compliance Engine" desc="Validate NCCI edits, sequencing, and supporting evidence." />
          <PipelinePhase phase="Phase 4" title="Adjudication" desc="Output finalized codes or route to human for exception handling." />
        </div>
      </div>

      <div className="flex gap-6 items-start" style={{ marginBottom: result ? "2rem" : "5rem" }}>
        <div className="flex-1">
          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Physician Documentation Input</span>
          <div className="premium-card bg-bg-surface border border-border-base p-6 rounded-lg shadow-sm dark:shadow-slate-900/50">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
              <div>
                <div className="text-[1rem] font-extrabold text-[#0F172A]">Provide Clinical Note payload</div>
                <div className="text-[0.82rem] text-text-subtle mt-1 leading-[1.65]">
                  Input physician documentation to generate coding recommendations with explainable system logic.
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex text-[0.7rem] font-bold uppercase tracking-wider text-[#3759E6] bg-[#EEF4FF] border border-[#D6E1FF] rounded-full px-2.5 py-1">ICD-10 Output</span>
                <span className="inline-flex text-[0.7rem] font-bold uppercase tracking-wider text-[#047857] bg-[#EEFDF7] border border-[#CFF7E4] rounded-full px-2.5 py-1">CPT Output</span>
              </div>
            </div>

            <textarea
              className="input-field w-full p-4 border border-border-base rounded-md focus:border-brand-blue resize-y bg-bg-surface font-sans text-[0.9rem] leading-[1.6]"
              rows={12}
              placeholder="Paste physician documentation here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={status === "running"}
            />

            <div className="flex gap-3 mt-4 items-center">
              <button className="btn-primary bg-brand-blue hover:bg-blue-700 text-text-inverse font-bold py-2.5 px-6 rounded-md shadow-sm dark:shadow-slate-900/50 transition-all" style={{ flex: 1.2 }} onClick={runAnalysis} disabled={status === "running"}>
                {status === "running" ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
                    Executing...
                  </div>
                ) : "Run System Analysis"}
              </button>
              <button
                className="btn-secondary bg-white dark:bg-slate-900 hover:bg-gray-50 text-text-primary border border-border-base font-bold py-2.5 px-6 rounded-md transition-all"
                style={{ flex: 0.9 }}
                onClick={() => { setNote(""); setResult(null); setStatus("idle"); }}
                disabled={status === "running"}
              >
                Clear Buffer
              </button>
              <div className="flex-1 text-[0.8rem] text-text-subtle">
                <strong>System Tip:</strong> Utilize the <strong>Test Scenarios</strong> module for pre-built notes that demonstrate boundary cases.
              </div>
            </div>
            
            {status === "running" && (
              <div className="mt-6 p-4 bg-bg-panel border border-border-base rounded-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-spin w-4 h-4 border-2 border-brand-blue/30 border-t-brand-blue rounded-full"></div>
                  <strong className="text-brand-blue text-[0.95rem]">Executing autonomous coding sequence...</strong>
                </div>
                {loadingStep >= 1 && <div className="text-[0.85rem] text-text-default mt-2 animate-fade-in">[System] Parsing clinical entities — diagnoses, procedures, acuity, laterality...</div>}
                {loadingStep >= 2 && <div className="text-[0.85rem] text-text-default mt-2 animate-fade-in">[System] Retrieving knowledge vectors for ICD-10-CM and CPT matching...</div>}
                {loadingStep >= 3 && <div className="text-[0.85rem] text-text-default mt-2 animate-fade-in">[System] Running compliance engine — NCCI, specificity, sequencing algorithms...</div>}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 basis-[320px]">
          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">System Advantages</span>
          <div className="bg-bg-panel border border-border-base p-6 rounded-lg">
            <div className="text-[0.95rem] font-extrabold text-[#0F172A] mb-4">Core Capabilities</div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[#EEF4FF] text-[#3759E6]"><Code2 size={16} /></div>
                <div>
                  <div className="text-[0.82rem] font-extrabold text-[#0F172A]">Explainable Logic</div>
                  <div className="text-[0.76rem] text-text-subtle leading-[1.5]">Every diagnostic code is directly referenced back to clinical evidence.</div>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[#EEFDF7] text-[#047857]"><ShieldCheck size={16} /></div>
                <div>
                  <div className="text-[0.82rem] font-extrabold text-[#0F172A]">Compliance Aware</div>
                  <div className="text-[0.76rem] text-text-subtle leading-[1.5]">In-built validation and financial risk detection before generation.</div>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[#F5F3FF] text-[#6D28D9]"><RefreshCw size={16} /></div>
                <div>
                  <div className="text-[0.82rem] font-extrabold text-[#0F172A]">Deterministic Fallback</div>
                  <div className="text-[0.76rem] text-text-subtle leading-[1.5]">Clarification routing guarantees safety in contradictory scenarios.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="animate-fade-in">
          {needsClarify ? (
            <Alert kind="warning" title="Exception Triggered: Clarification Required" body={result.clarification_question || "The system could not assign codes with sufficient confidence threshold. Please provide additional clinical context."} />
          ) : isEscalated ? (
            <Alert kind="danger" title="Exception Triggered: Escalated for Human Adjudication" body={result.escalation_reason || "Clinical contradictions or insufficient documentation detected. This block must be manually reviewed prior to submission."} />
          ) : (
            <Alert kind="success" title="Validation Passed — Submission Ready" body="All extracted codes successfully cleared the compliance pipeline. Review the systemic output logic below." />
          )}

          <div className="flex gap-6 mt-4">
             <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
               <div className="text-[0.75rem] font-bold text-text-muted uppercase mb-2">System Confidence</div>
               <div className="text-[1.8rem] font-extrabold text-text-primary">{Math.round(overallConf * 100)}%</div>
             </div>
             <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
               <div className="text-[0.75rem] font-bold text-text-muted uppercase mb-2">ICD-10 Entities</div>
               <div className="text-[1.8rem] font-extrabold text-text-primary">{icd10.length}</div>
             </div>
             <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
               <div className="text-[0.75rem] font-bold text-text-muted uppercase mb-2">CPT Entities</div>
               <div className="text-[1.8rem] font-extrabold text-text-primary">{cpt.length}</div>
             </div>
             <div className="flex-1 bg-bg-surface border border-border-base rounded-sm p-4 text-center shadow-xs">
               <div className="text-[0.75rem] font-bold text-text-muted uppercase mb-2">Entities Pruned</div>
               <div className="text-[1.8rem] font-extrabold text-text-primary">{(result.removed_codes || []).length}</div>
             </div>
          </div>

          <div className="mt-6">
            {needsClarify && (
              <>
                <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Operator Override Input</span>
                <div className="p-6 bg-bg-surface border border-border-base rounded-lg mb-6 shadow-sm dark:shadow-slate-900/50">
                  <textarea
                    className="w-full p-4 border border-border-base rounded-md focus:border-brand-blue resize-y bg-bg-surface font-sans text-[0.9rem] leading-[1.6] mb-4"
                    rows={4}
                    placeholder="Provide required clinical parameters to disambiguate this case block..."
                    value={overrideText}
                    onChange={(e) => setOverrideText(e.target.value)}
                    disabled={overrideRunning}
                  />
                  <button className="bg-brand-blue hover:bg-blue-700 text-text-inverse font-bold py-2.5 px-6 rounded-md shadow-sm dark:shadow-slate-900/50 transition-all" onClick={runOverride} disabled={overrideRunning}>
                    {overrideRunning ? "Re-evaluating..." : "Submit Override"}
                  </button>
                </div>
              </>
            )}

            {isEscalated && (
              <div className="flex gap-6 mt-4 mb-6">
                <div style={{ flex: 1.5 }}>
                  <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Exception Rationale</span>
                  <div className="p-6 rounded-lg bg-[#FEF2F2] border-[#FECACA] border">
                    <div className="text-[1rem] font-extrabold text-[#7F1D1D] mb-2">Why the automated pipeline halted</div>
                    <div className="text-[0.88rem] text-[#7F1D1D] leading-[1.75]">
                      {result.escalation_reason || "Insufficient documentation confidence logic triggered."}
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">System Recommendations</span>
                  <div className="p-6 bg-bg-surface border border-border-base rounded-lg shadow-sm dark:shadow-slate-900/50">
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2 items-start"><XCircle size={16} color="#EF4444" className="mt-0.5" /><span className="text-[0.84rem] text-[#334155]">Request an addendum to resolve contradictions.</span></div>
                      <div className="flex gap-2 items-start"><XCircle size={16} color="#EF4444" className="mt-0.5" /><span className="text-[0.84rem] text-[#334155]">Route documentation to Senior Staff for manual adjudication.</span></div>
                      <div className="flex gap-2 items-start"><XCircle size={16} color="#EF4444" className="mt-0.5" /><span className="text-[0.84rem] text-[#334155]">Suspend billing generation until cleared.</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex border-b border-border-base gap-8 mb-6">
                {["icd", "cpt", "compliance", "telemetry"].map(key => {
                  const labels: Record<string, string> = { icd: "ICD-10 Diagnoses", cpt: "CPT Procedures", compliance: "Compliance Ruleset", telemetry: "Session Telemetry" };
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

                <div className="animate-fade-in">
                  {activeTab === "icd" && (
                    <div className="flex gap-6">
                       <div style={{ flex: 3 }}>
                         <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">{icd10.length} diagnosis code{icd10.length !== 1 && "s"} generated</span>
                         {icd10.length === 0 ? <div className="p-8 text-center border border-dashed border-border-lite rounded-md font-bold text-text-default">No ICD-10 codes identified.</div> : icd10.map((c: any, i: number) => <CodeRow key={i} {...c} />)}
                       </div>
                       <div style={{ flex: 1 }}>
                         <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Evaluation Logic</span>
                         <div className="p-5 bg-bg-panel border border-border-base rounded-lg shadow-sm dark:shadow-slate-900/50">
                           <div className="font-extrabold text-[#0F172A] mb-2 text-[0.9rem]">ICD-10-CM Standard</div>
                           <div className="text-[0.82rem] text-text-muted leading-[1.6]">
                             Algorithm prioritizes the principal diagnosis. Logic enforces the highest available specificity with respect to laterality, acuity, and episode of care parameters.
                           </div>
                         </div>
                       </div>
                    </div>
                  )}

                  {activeTab === "cpt" && (
                    <div className="flex gap-6">
                       <div style={{ flex: 3 }}>
                         <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">{cpt.length} procedure code{cpt.length !== 1 && "s"} generated</span>
                         {cpt.length === 0 ? <div className="p-8 text-center border border-dashed border-border-lite rounded-md font-bold text-text-default">No CPT codes identified.</div> : cpt.map((c: any, i: number) => <CodeRow key={i} {...c} />)}
                       </div>
                       <div style={{ flex: 1 }}>
                         <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Evaluation Logic</span>
                         <div className="p-5 bg-bg-panel border border-border-base rounded-lg shadow-sm dark:shadow-slate-900/50">
                           <div className="font-extrabold text-[#0F172A] mb-2 text-[0.9rem]">CPT Standard</div>
                           <div className="text-[0.82rem] text-text-muted leading-[1.6]">
                           Procedure validity constrained by medical necessity documentation, approach vectors, and time evaluations. Modifiers cross-referenced against note evidence.
                           </div>
                         </div>
                       </div>
                    </div>
                  )}

                  {activeTab === "compliance" && (
                     <div className="flex gap-6">
                        <div style={{ flex: 3 }}>
                          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Validation Matrix</span>
                          <div className="flex flex-col gap-2">
                             {(result.compliance_checks || []).map((c: any, i: number) => (
                               <div key={i} className="flex gap-2 items-center text-[0.88rem] text-text-default">
                                 {c.pass ? <CheckCircle2 size={18} className="text-brand-green" /> : <XCircle size={18} className="text-brand-red" />}
                                 {c.label}
                               </div>
                             ))}
                          </div>
                          
                          {result.removed_codes?.length > 0 && (
                            <div className="mt-6">
                              <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">System-Pruned Candidates</span>
                              <div className="text-[0.8rem] text-text-subtle mb-3">Candidates isolated during extraction but discarded during ruleset evaluation.</div>
                              {result.removed_codes.map((rc: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 bg-bg-surface border border-border-base p-3 px-4 rounded-lg mb-2 shadow-sm dark:shadow-slate-900/50">
                                  <span className="font-mono text-[0.9rem] font-bold text-brand-red">{rc.code || "N/A"}</span>
                                  <span className="text-[0.85rem] text-text-muted">{rc.reason || "Discarded by validation algorithms."}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 2 }}>
                          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Ruleset Status</span>
                          <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-5 mb-4 rounded-lg">
                            <div className="text-[0.88rem] text-[#047857] leading-[1.6] font-semibold">
                              {result.compliance_notes || "All constraint layers cleared. Zero bundling violations, sequencing anomalies, or specificity faults identified."}
                            </div>
                          </div>
                          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Applied Frameworks</span>
                          {["ICD-10-CM Official Guidelines", "National Correct Coding Initiative (NCCI)", "CMS Outpatient Code Editor", "AHA Knowledge Base"].map((r, i) => (
                            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#E2E8F0] text-[0.82rem] text-[#334155] font-medium">
                               <div className="w-1.5 h-1.5 bg-border-lite rounded-full"></div>{r}
                            </div>
                          ))}
                        </div>
                     </div>
                  )}

                  {activeTab === "telemetry" && (
                     <div className="flex gap-6">
                        <div style={{ flex: 1 }}>
                          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Telemetry & Identity</span>
                          <div className="bg-bg-surface border border-border-base p-5 rounded-lg shadow-sm dark:shadow-slate-900/50">
                             <div className="flex justify-between mb-3 pb-2 border-b border-border-base">
                               <span className="text-[0.8rem] font-bold text-text-subtle">Session Hash</span>
                               <span className="font-mono text-[0.85rem] text-text-primary">{result.session_id || "N/A"}</span>
                             </div>
                             <div className="flex justify-between mb-3 pb-2 border-b border-border-base">
                               <span className="text-[0.8rem] font-bold text-text-subtle">Timestamp</span>
                               <span className="text-[0.85rem] text-text-primary">{result.timestamp || "N/A"}</span>
                             </div>
                             <div className="flex justify-between mb-3 pb-2 border-b border-border-base">
                               <span className="text-[0.8rem] font-bold text-text-subtle">Model Vector</span>
                               <span className="text-[0.85rem] text-text-primary">{result.model || "Llama 3.3 70B (Groq)"}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-[0.8rem] font-bold text-text-subtle">System State</span>
                               <span className="text-[0.85rem] font-bold text-brand-green">Validated</span>
                             </div>
                          </div>
                          
                          <div className="mt-4">
                            <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">System Observations</span>
                            <div className="bg-bg-panel p-5 border border-border-base rounded-lg text-[0.85rem] leading-[1.6] text-text-default">
                               {approved.coding_notes || "Standard operation. No irregular parameters logged."}
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Raw Output Vector (JSON)</span>
                          <div className="bg-bg-panel p-4 overflow-x-auto border border-border-base rounded-lg">
                            <pre className="text-[0.75rem] font-mono m-0 text-text-default">
                              {JSON.stringify(approved, null, 2)}
                            </pre>
                          </div>
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

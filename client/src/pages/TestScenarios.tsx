
import { Hero } from "../components/Hero";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { X, FileText, Eye } from "lucide-react";
import clsx from "clsx";

const SCENARIOS = [
  {
    key: "sc_1", tag_cls: "sc-tag-clean", tag: "Standard Pass",
    title: "Cardiology Profile",
    desc: "Rigid documentation of a 58-year-old male presenting with acute inferior ST-elevation myocardial infarction and PCI execution.",
    meta: ["58M", "Cardiology", "Clean Logic"],
    codes: ["I21.19", "92928"],
    expect: "System Expected Logic: High-confidence extraction string. Zero escalation.",
    file: "/tests/scenario_1.txt",
  },
  {
    key: "sc_2", tag_cls: "sc-tag-warn", tag: "Override Requirement",
    title: "Data Ambiguity",
    desc: "Incomplete diagnostic vector lacking specific symptom isolation and core parameters.",
    meta: ["47F", "Emergency", "Ambiguity"],
    codes: ["I20.0 / I21.4 (TBD)", "93010"],
    expect: "System Expected Logic: Pipeline halt; operator input required to advance.",
    file: "/tests/scenario_2.txt",
  },
  {
    key: "sc_3", tag_cls: "sc-tag-escalate", tag: "Algorithmic Exception",
    title: "Structural Contradiction",
    desc: "Pharmacological history conflicts with active diagnostics. Inverse logic detected in ECG vs Troponin records.",
    meta: ["71M", "Internal Med", "Conflict"],
    codes: ["Exception Code"],
    expect: "System Expected Logic: Pipeline termination. Case routed to human administrator.",
    file: "/tests/scenario_3.txt",
  },
  {
    key: "sc_4", tag_cls: "sc-tag-warn", tag: "Override Requirement",
    title: "Anatomical Omission",
    desc: "Meniscal procedure logged with zero documentation detailing laterality axis.",
    meta: ["45F", "Orthopedics", "Ambiguity"],
    codes: ["M23.2xx (TBD)"],
    expect: "System Expected Logic: Operation suspension pending laterality variable input.",
    file: "/tests/scenario_4_ambiguous.txt",
  },
  {
    key: "sc_5", tag_cls: "sc-tag-clean", tag: "Standard Pass",
    title: "Pediatric Diagnostics",
    desc: "12-year-old male with moderate persistent asthma presentation at bi-annual interval.",
    meta: ["12M", "Pediatrics", "Clean Logic"],
    codes: ["J45.40"],
    expect: "System Expected Logic: High-confidence matrix output for J45.40.",
    file: "/tests/scenario_5_clean.txt",
  },
  {
    key: "sc_6", tag_cls: "sc-tag-clean", tag: "Standard Pass",
    title: "Dermatological Extraction",
    desc: "34-year-old male; excisional surgical vector applied to dorsal anomaly.",
    meta: ["34M", "Dermatology", "Clean Logic"],
    codes: ["D48.5", "11401"],
    expect: "System Expected Logic: Standard generation for dual-code requirement.",
    file: "/tests/scenario_6_clean.txt",
  },
  {
    key: "sc_7", tag_cls: "sc-tag-escalate", tag: "Algorithmic Exception",
    title: "Temporal Contradiction",
    desc: "Pre-operative schedule logged for appendectomy; historical database asserts prior execution in 2001.",
    meta: ["72M", "Surgery", "Conflict"],
    codes: ["Exception Code"],
    expect: "System Expected Logic: Hard system stop due to timeline impossibility index.",
    file: "/tests/scenario_7_escalation.txt",
  },
  {
    key: "sc_8", tag_cls: "sc-tag-clean", tag: "Standard Pass",
    title: "Gastroenterological Profile",
    desc: "Standard evaluation logic isolating IBS-D diagnostics.",
    meta: ["28F", "Gastro", "Clean Logic"],
    codes: ["K58.0"],
    expect: "System Expected Logic: Fast-track validation sequence.",
    file: "/tests/scenario_8_clean.txt",
  },
  {
    key: "sc_9", tag_cls: "sc-tag-clean", tag: "Standard Pass",
    title: "Neurology Assessment",
    desc: "42-year-old male with recurring tension-type headaches requiring preventive intervention.",
    meta: ["42M", "Neurology", "Clean Logic"],
    codes: ["G44.1", "90834"],
    expect: "System Expected Logic: Validated tension headache coding with preventive strategy.",
    file: "/tests/scenario_9_clean.txt",
  },
  {
    key: "sc_10", tag_cls: "sc-tag-clean", tag: "Standard Pass",
    title: "ENT & Infectious Disease",
    desc: "19-year-old college student with acute streptococcal pharyngitis and positive rapid strep test.",
    meta: ["19M", "ENT/ID", "Clean Logic"],
    codes: ["J02.0", "92004"],
    expect: "System Expected Logic: Confirmed strep infection with allergy-appropriate antibiotic coding.",
    file: "/tests/scenario_10_clean.txt",
  }
];

export function TestScenarios() {
  const { setInjectedNote } = useAppContext();
  const navigate = useNavigate();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [scenarioContent, setScenarioContent] = useState<Record<string, string>>({});

  const loadScenario = async (key: string, fileUrl: string) => {
    if (scenarioContent[key]) return;
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error("File fetch failed");
      const text = await res.text();
      setScenarioContent((prev) => ({ ...prev, [key]: text }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewScenario = async (key: string, fileUrl: string) => {
    await loadScenario(key, fileUrl);
    setExpandedKey(expandedKey === key ? null : key);
  };

  const handleInject = async (fileUrl: string) => {
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error("File fetch failed");
      const text = await res.text();
      setInjectedNote(text);
      navigate("/");
    } catch (e) {
      alert("Unable to load scenario: " + fileUrl);
    }
  };

  return (
    <div className="animate-fade-in">
      <Hero
        title="Standardized Validation Bounds"
        subtitle="Load engineered edge-cases into the workspace to verify algorithmic parsing accuracy, contradiction detection, and escalation safety nets."
        dateStr={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      />

      <div className="bg-bg-surface border border-border-base p-[1.2rem_1.5rem] rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-brand-blue text-white font-mono text-[0.7rem] font-bold">1</div>
            <span style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 700 }}>Select Parameters</span>
          </div>
          <div style={{ width: "30px", height: "1px", background: "var(--border-2)" }} />
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-brand-blue text-white font-mono text-[0.7rem] font-bold">2</div>
            <span style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 700 }}>Inject Payload</span>
          </div>
          <div style={{ width: "30px", height: "1px", background: "var(--border-2)" }} />
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-brand-blue text-white font-mono text-[0.7rem] font-bold">3</div>
            <span style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 700 }}>Execute Engine Evaluation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-6">
        {SCENARIOS.map((s) => (
          <div key={s.key} className="flex flex-col p-6 bg-bg-surface border border-border-base rounded-lg transition-transform hover:-translate-y-1 hover:shadow-md shadow-sm h-full relative">
            <span className={clsx(
              "inline-flex self-start py-0.5 px-2.5 rounded-sm text-[0.65rem] font-bold uppercase tracking-[0.1em] border mb-3",
              s.tag_cls === "sc-tag-clean" && "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
              s.tag_cls === "sc-tag-warn" && "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
              s.tag_cls === "sc-tag-escalate" && "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
            )}>
              {s.tag}
            </span>
            <div className="text-[1.1rem] font-extrabold text-text-primary tracking-[-0.01em] mb-3 leading-[1.3]">{s.title}</div>
            
            <div className="flex gap-2 flex-wrap mb-3">
              {s.meta.map((m, i) => <span key={i} className="py-0.5 px-2 bg-bg-panel border border-border-base rounded-md text-[0.72rem] text-text-subtle font-semibold">{m}</span>)}
            </div>

            <div className="text-[0.88rem] text-text-default leading-[1.6] mb-5">{s.desc}</div>
            <hr className="border-none border-t border-dashed border-border-base my-4 mx-[-1.5rem]" />

            <div style={{ marginBottom: "0.8rem" }}>
              <div className="text-[0.7rem] font-bold text-text-muted uppercase tracking-[0.05em] mb-1.5">Target Output Bounds</div>
              {s.codes.map((c, i) => (
                <div key={i} className="inline-block py-[0.15rem] px-[0.45rem] font-mono text-[0.85rem] font-bold text-brand-blue bg-blue-50 border border-blue-100 rounded-sm mb-[0.2rem] mr-[0.2rem]">{c}</div>
              ))}
            </div>

            <div className="p-3 bg-bg-panel border border-border-lite border-l-4 border-l-brand-blue rounded-r-md text-[0.8rem] text-text-subtle leading-[1.6] mb-4">
              {s.expect}
            </div>

            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => handleViewScenario(s.key, s.file)}
                className="flex-1 bg-transparent hover:bg-bg-panel text-text-primary border border-border-base font-bold py-2 px-3 rounded transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Eye size={16} /> View
              </button>
              <button 
                onClick={() => handleInject(s.file)}
                className="flex-1 bg-brand-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all"
              >
                Inject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for viewing/editing scenario */}
      {expandedKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-base">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-brand-blue" />
                <h2 className="text-[1.3rem] font-bold text-text-primary">
                  {SCENARIOS.find((s) => s.key === expandedKey)?.title}
                </h2>
              </div>
              <button 
                onClick={() => setExpandedKey(null)}
                className="p-2 hover:bg-bg-panel rounded-lg transition-all"
              >
                <X size={24} className="text-text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="whitespace-pre-wrap font-mono text-[0.9rem] text-text-default leading-relaxed bg-bg-panel p-4 rounded-lg">
                {scenarioContent[expandedKey] || "Loading..."}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-border-base bg-bg-panel">
              <button
                onClick={() => setExpandedKey(null)}
                className="px-4 py-2 bg-bg-surface border border-border-base rounded-lg font-bold text-text-primary hover:bg-bg-panel transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

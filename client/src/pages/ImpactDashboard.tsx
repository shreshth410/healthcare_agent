
import { Hero } from "../components/Hero";
import { KpiCard } from "../components/KpiCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", "Legacy Baseline": 22, "Augmented Baseline": 18 },
  { name: "Feb", "Legacy Baseline": 24, "Augmented Baseline": 48 },
  { name: "Mar", "Legacy Baseline": 21, "Augmented Baseline": 85 },
  { name: "Apr", "Legacy Baseline": 23, "Augmented Baseline": 120 },
  { name: "May", "Legacy Baseline": 22, "Augmented Baseline": 145 },
  { name: "Jun", "Legacy Baseline": 25, "Augmented Baseline": 180 },
];

export function ImpactDashboard() {
  return (
    <div className="animate-fade-in">
      <Hero
        title="Performance Economics & Outcomes"
        subtitle="Empirical tracking of throughput efficiency, revenue cycle acceleration, and operational cost depreciation utilizing autonomous matrices."
        dateStr={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      />

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div style={{ flex: 1 }}>
          <KpiCard label="Projected Resource Savings" value="$1.2M" sub="Calculated via a 42% reduction in manual adjudication overheads." borderColor="#4F7CFF" />
        </div>
        <div style={{ flex: 1 }}>
          <KpiCard label="Cycle Acceleration (DNFB)" value="3.4 Days" sub="Decrease in standard accounts receivable staging periods." borderColor="#22C55E" />
        </div>
        <div style={{ flex: 1 }}>
          <KpiCard label="Rejection Risk Variance" value="-18%" sub="Yielded from automated front-end logic verification checks." borderColor="#8B5CF6" />
        </div>
      </div>

      <div className="flex gap-6 mt-6">
        <div style={{ flex: 2 }}>
          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Throughput Trajectory Modeling</span>
          <div className="bg-bg-surface border border-border-base rounded-lg p-4 shadow-sm" style={{ height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip 
                   contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                   itemStyle={{ fontSize: "14px", fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#475569" }} />
                <Line type="monotone" dataKey="Legacy Baseline" stroke="#94A3B8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Augmented Baseline" stroke="#4F7CFF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Infrastructure Optimization</span>
          <div className="bg-bg-surface border border-border-base p-6 rounded-lg shadow-sm">
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A", marginBottom: "0.5rem" }}>
              Smart Inference Router
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--t4)", lineHeight: 1.65, marginBottom: "1.2rem" }}>
              By engineering a dynamic fallback logic layer—delegating standard text isolation to lower-parameter local models and reserving complex cognitive loads for high-density frontier models—this architecture yields <b>an 85% reduction in API token utilization</b> while preserving standard accuracy baselines.
            </div>
            <div className="flex justify-between items-center pt-4 border-t" style={{ borderTop: "1px solid #E2E8F0" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Operating Cost / 10K Txn
              </span>
              <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#22C55E" }}>
                $14.50
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

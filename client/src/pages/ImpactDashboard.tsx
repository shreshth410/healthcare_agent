import { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { KpiCard } from "../components/KpiCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { apiCall } from "../api";

interface MetricsData {
  total_sessions: number;
  autonomous_success: number;
  projected_savings_formatted: string;
  dnfb_days_formatted: string;
  rejection_variance_formatted: string;
  chart_data: Array<{
    name: string;
    "Legacy Baseline": number;
    "Augmented Baseline": number;
  }>;
}

export function ImpactDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await apiCall("GET", "/metrics");
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex justify-center items-center h-full transition-all duration-300">
        <div className="flex animate-pulse flex-col items-center gap-4 text-slate-400 dark:text-slate-500">
          <svg className="h-10 w-10 animate-spin text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium tracking-wide">Loading metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Hero
        title="Performance Economics & Outcomes"
        subtitle={`Empirical tracking of throughput efficiency utilizing autonomous matrices. Total Sessions: ${metrics.total_sessions} | Autonomous Success: ${metrics.autonomous_success}`}
        dateStr={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      />

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div style={{ flex: 1 }}>
          <KpiCard label="Projected Resource Savings" value={metrics.projected_savings_formatted} sub="Calculated via reduction in manual adjudication overheads." borderColor="#4F7CFF" />
        </div>
        <div style={{ flex: 1 }}>
          <KpiCard label="Cycle Acceleration (DNFB)" value={metrics.dnfb_days_formatted} sub="Decrease in standard accounts receivable staging periods." borderColor="#22C55E" />
        </div>
        <div style={{ flex: 1 }}>
          <KpiCard label="Rejection Risk Variance" value={metrics.rejection_variance_formatted} sub="Yielded from automated front-end logic verification checks." borderColor="#8B5CF6" />
        </div>
      </div>

      <div className="flex gap-6 mt-6">
        <div style={{ flex: 2 }}>
          <span className="section-label block mb-2 font-bold text-[0.85rem] text-text-primary uppercase tracking-[0.05em]">Throughput Trajectory Modeling</span>
          <div className="bg-bg-surface border border-border-base rounded-lg p-4 shadow-sm dark:shadow-slate-900/50" style={{ height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.chart_data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
          <div className="bg-bg-surface border border-border-base p-6 rounded-lg shadow-sm dark:shadow-slate-900/50">
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

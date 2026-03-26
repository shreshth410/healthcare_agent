
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { AnalyzeNote } from "./pages/AnalyzeNote";
import { AuditTrail } from "./pages/AuditTrail";
import { ImpactDashboard } from "./pages/ImpactDashboard";
import { TestScenarios } from "./pages/TestScenarios";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<AnalyzeNote />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/impact" element={<ImpactDashboard />} />
            <Route path="/scenarios" element={<TestScenarios />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}

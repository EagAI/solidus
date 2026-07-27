import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ConstructionGate from "./components/ConstructionGate";
import DocsPage from "./components/DocsPage";
import HelpPage from "./components/HelpPage";
import HomePage from "./components/HomePage";
import UpdatesPage from "./components/UpdatesPage";
import UptimePage from "./components/UptimePage";

export default function App() {
  return (
    <ConstructionGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/atnaujinimai" element={<UpdatesPage />} />
          <Route path="/dokumentacija" element={<DocsPage />} />
          <Route path="/pagalba" element={<HelpPage />} />
          <Route path="/uptime" element={<UptimePage />} />
          <Route path="/updates" element={<Navigate to="/atnaujinimai" replace />} />
          <Route path="/docs" element={<Navigate to="/dokumentacija" replace />} />
          <Route path="/help" element={<Navigate to="/pagalba" replace />} />
          <Route path="/status" element={<Navigate to="/uptime" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConstructionGate>
  );
}

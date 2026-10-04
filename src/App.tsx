import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ConstructionGate from "./components/ConstructionGate";
import DocsPage from "./components/DocsPage";
import HelpPage from "./components/HelpPage";
import HomePage from "./components/HomePage";
import TeamPage from "./components/TeamPage";
import TermsPage from "./components/TermsPage";
import UpdatesPage from "./components/UpdatesPage";
import UptimePage from "./components/UptimePage";
import PanelLayout from "./panel/PanelLayout";
import AntiRaidPage from "./panel/pages/AntiRaidPage";
import AutorolePage from "./panel/pages/AutorolePage";
import BlacklistPage from "./panel/pages/BlacklistPage";
import CommandsPage from "./panel/pages/CommandsPage";
import CurrencyPage from "./panel/pages/CurrencyPage";
import DashboardPage from "./panel/pages/DashboardPage";
import ServersPage from "./panel/pages/ServersPage";
import EmbedBuilderPage from "./panel/pages/EmbedBuilderPage";
import EntrancePage from "./panel/pages/EntrancePage";
import ExtrasPage from "./panel/pages/ExtrasPage";
import FiltersPage from "./panel/pages/FiltersPage";
import GiveawayPage from "./panel/pages/GiveawayPage";
import GoodbyePage from "./panel/pages/GoodbyePage";
import LevelsPage from "./panel/pages/LevelsPage";
import LogsPage from "./panel/pages/LogsPage";
import PollsPage from "./panel/pages/PollsPage";
import RolesPage from "./panel/pages/RolesPage";
import SettingsPage from "./panel/pages/SettingsPage";
import ShopPage from "./panel/pages/ShopPage";
import TicketsPage from "./panel/pages/TicketsPage";
import VoicePage from "./panel/pages/VoicePage";
import WarningsPage from "./panel/pages/WarningsPage";

export default function App() {
  return (
    <ConstructionGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/atnaujinimai" element={<UpdatesPage />} />
          <Route path="/komanda" element={<TeamPage />} />
          <Route path="/dokumentacija" element={<DocsPage />} />
          <Route path="/pagalba" element={<HelpPage />} />
          <Route path="/salygos" element={<TermsPage />} />
          <Route path="/uptime" element={<UptimePage />} />

          <Route path="/panel" element={<PanelLayout />}>
            <Route index element={<ServersPage />} />
            <Route path="valdymas" element={<DashboardPage />} />
            <Route path="komandos" element={<CommandsPage />} />
            <Route path="automatika" element={<Navigate to="/panel/nariai/entrance" replace />} />
            <Route path="entrance" element={<Navigate to="/panel/nariai/entrance" replace />} />
            <Route path="nariai" element={<Navigate to="/panel/nariai/entrance" replace />} />
            <Route path="nariai/entrance" element={<EntrancePage />} />
            <Route path="nariai/goodbye" element={<GoodbyePage />} />
            <Route path="nariai/autorole" element={<AutorolePage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="ispejimai" element={<WarningsPage />} />
            <Route path="nustatymai" element={<SettingsPage />} />
            <Route path="tiketai" element={<Navigate to="/panel/tiketai/nustatymai" replace />} />
            <Route path="tiketai/nustatymai" element={<TicketsPage section="nustatymai" />} />
            <Route path="tiketai/istorija" element={<TicketsPage section="istorija" />} />
            <Route path="filtrai" element={<FiltersPage />} />
            <Route path="blacklist" element={<BlacklistPage />} />
            <Route path="anti-raid" element={<AntiRaidPage />} />
            <Route path="logai" element={<LogsPage />} />
            <Route path="lygiai" element={<LevelsPage />} />
            <Route path="valiuta" element={<CurrencyPage />} />
            <Route path="parduotuve" element={<ShopPage />} />
            <Route path="giveaway" element={<GiveawayPage />} />
            <Route path="apklausos" element={<PollsPage />} />
            <Route path="embed" element={<EmbedBuilderPage />} />
            <Route path="voice" element={<VoicePage />} />
            <Route path="extras" element={<ExtrasPage />} />
          </Route>

          <Route path="/dashboard" element={<Navigate to="/panel" replace />} />
          <Route path="/updates" element={<Navigate to="/atnaujinimai" replace />} />
          <Route path="/team" element={<Navigate to="/komanda" replace />} />
          <Route path="/terms" element={<Navigate to="/salygos" replace />} />
          <Route path="/docs" element={<Navigate to="/dokumentacija" replace />} />
          <Route path="/help" element={<Navigate to="/pagalba" replace />} />
          <Route path="/status" element={<Navigate to="/uptime" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConstructionGate>
  );
}
